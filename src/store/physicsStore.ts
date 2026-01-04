import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState, TidalDisruptionEvent, LegacyCollisionEvent, CollisionEvent } from '../types/physics';
import type { StarSystemMode } from '../types/starSystem';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT, calculateTotalEnergy, applyCollisions } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem } from '../utils/solarSystem';
import { getPresetById } from '../utils/starSystems';
import { PhysicsWorkerManager } from '../workers/physicsWorkerManager';
import { GPUPhysicsEngine } from '../gpu/GPUPhysicsEngine';
import { useEffectsStore } from './effectsStore';

import { BUFFER_LIMITS } from '../constants/physics';
import { DISTANCE_SCALE_FACTOR } from '../utils/solarSystem';

// Helper to trigger visual effects for collisions
const triggerCollisionEffects = (events: CollisionEvent[]) => {
    const effectsStore = useEffectsStore.getState();
    events.forEach(event => {
        effectsStore.triggerCollisionEffects({
            body1Id: event.largerBodyId,
            body2Id: event.smallerBodyId,
            collisionPoint: event.collisionPoint,
            relativeVelocity: event.relativeVelocity,
            combinedMass: event.combinedMass,
            largerBodyId: event.largerBodyId,
            smallerBodyId: event.smallerBodyId,
            smallerBodyColor: event.smallerBodyColor,
            smallerBodyRadius: event.smallerBodyRadius
        });
    });
};

let _workerManager: PhysicsWorkerManager | null = null;
export const getWorkerManager = (): PhysicsWorkerManager => {
    if (!_workerManager) {
        _workerManager = new PhysicsWorkerManager(BUFFER_LIMITS.MAX_BODIES);
        _workerManager.initWorkers();
    }
    return _workerManager;
};

let _gpuEngine: GPUPhysicsEngine | null = null;
export const getGPUEngine = (): GPUPhysicsEngine => {
    if (!_gpuEngine) {
        _gpuEngine = new GPUPhysicsEngine();
    }
    return _gpuEngine;
};

export const physicsStats = {
    fps: 0,
    physicsDuration: 0,
    renderDuration: 0, // Assigned by Scene/Loop
    bodyCount: 0,
    mode: 'CPU',
    energy: {
        kinetic: 0,
        potential: 0,
        total: 0,
        initial: 0,
        drift: 0
    },
    lastEnergyCheck: 0,
    cameraPosition: [0, 0, 0]
};

const MAX_STABLE_DT = 0.02; // Threshold to split steps

export type HistoryAction =
    | { type: 'ADD'; body: CelestialBody }
    | { type: 'REMOVE'; body: CelestialBody }
    | { type: 'UPDATE'; id: string; previous: Partial<CelestialBody>; current: Partial<CelestialBody> };

interface PhysicsStore {
    bodies: CelestialBody[];
    physicsState: PhysicsState | null; // Persisted SoA state
    simulationState: SimulationState;
    timeScale: number;
    simulationTime: number; // Accumulated time for rotation sync
    showPrediction: boolean;
    showGrid: boolean;
    showRealisticVisuals: boolean;
    showHabitableZone: boolean;
    showPerformance: boolean;
    followingBodyId: string | null;
    selectedBodyId: string | null;
    cameraMode: CameraMode;
    gpuDataInvalidated: boolean; // Flag to trigger data upload to GPU
    zenMode: boolean;
    labMode: boolean;
    resetToken: number; // Increment to signal forced visual resets

    // User Mode
    userMode: 'beginner' | 'advanced';
    setUserMode: (mode: 'beginner' | 'advanced') => void;
    hasSeenOnboarding: boolean;
    setHasSeenOnboarding: (seen: boolean) => void;

    // History
    history: HistoryAction[];
    historyIndex: number;
    pushHistoryAction: (action: HistoryAction) => void;
    undo: () => void;
    redo: () => void;

    // Distance Scale
    useRealisticDistances: boolean;
    toggleRealisticDistances: () => void;
    toggleZenMode: () => void;
    toggleLabMode: () => void;

    // Gravity Visualization
    showGravityField: boolean;
    toggleGravityField: () => void;

    // Multithreading
    useMultithreading: boolean;
    useGPU: boolean;
    isCalculating: boolean;
    isWorkerSupported: boolean;
    isGPUSupported: boolean | null; // null = checking
    toggleMultithreading: () => void;
    toggleGPU: () => void;
    checkGPUSupport: () => Promise<void>;

    // Star System
    currentSystemId: string | null;
    currentSystemMode: StarSystemMode | null;
    loadStarSystem: (systemId: string, mode?: StarSystemMode) => void;

    addBody: (body: Omit<CelestialBody, 'id'>) => void;
    duplicateBody: (id: string) => void;
    removeBody: (id: string) => void;
    // Destruction Events
    tidallyDisruptedEvents: TidalDisruptionEvent[];
    collisionEvents: LegacyCollisionEvent[];
    addTidalDisruptionEvent: (event: TidalDisruptionEvent) => void;
    removeTidalDisruptionEvent: (bodyId: string) => void;
    addCollisionEvent: (event: LegacyCollisionEvent) => void;
    removeCollisionEvent: (eventId: string) => void;

    updateBodies: () => void;
    loadSolarSystem: () => void;
    setSimulationState: (state: SimulationState) => void;
    setTimeScale: (scale: number) => void;
    togglePrediction: () => void;
    toggleGrid: () => void;
    toggleRealisticVisuals: () => void;
    toggleHabitableZone: () => void;
    togglePerformance: () => void;
    setFollowingBody: (id: string | null) => void;
    selectBody: (id: string | null) => void;
    updateBody: (id: string, updates: Partial<CelestialBody>) => void;
    setCameraMode: (mode: CameraMode) => void;
    reset: () => void;
    cleanup: () => void;
}

// Use the shared solar system generator to ensure consistency between Initial Load and Reset
const INITIAL_BODIES: CelestialBody[] = createSolarSystem();

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
    bodies: INITIAL_BODIES,
    physicsState: null,
    simulationState: 'running',
    timeScale: 1.0,
    simulationTime: 0,
    showPrediction: false,
    showGrid: true,
    showRealisticVisuals: true,
    showHabitableZone: false,
    showPerformance: false,
    followingBodyId: null,
    selectedBodyId: null,
    cameraMode: 'free',
    gpuDataInvalidated: true,
    showGravityField: false,

    tidallyDisruptedEvents: [],
    collisionEvents: [],

    // Star System
    currentSystemId: 'solar-system',
    currentSystemMode: null,

    useRealisticDistances: false,

    zenMode: false,
    labMode: false,
    resetToken: 0,

    // User Mode - default to beginner for better onboarding, restore from localStorage
    userMode: typeof window !== 'undefined' && localStorage.getItem('orbit-simulator-user-mode') === 'advanced' ? 'advanced' : 'beginner',
    hasSeenOnboarding: typeof window !== 'undefined' && localStorage.getItem('orbit-simulator-onboarding-seen') === 'true',

    useMultithreading: false,
    useGPU: false,
    isCalculating: false,
    isWorkerSupported: typeof window !== 'undefined' && !!window.Worker && !!window.SharedArrayBuffer,
    isGPUSupported: null,

    checkGPUSupport: async () => {
        const supported = await GPUPhysicsEngine.isSupported();
        set({ isGPUSupported: supported });
    },

    cleanup: () => {
        if (_workerManager) {
            _workerManager.terminate();
            _workerManager = null;
        }
        if (_gpuEngine) {
            _gpuEngine.dispose();
            _gpuEngine = null;
        }
    },

    toggleMultithreading: () => {
        const { useMultithreading } = get();
        // If we are currently using MT, we are disabling it -> Clean up Worker
        if (useMultithreading) {
            if (_workerManager) {
                _workerManager.terminate();
                _workerManager = null;
            }
        }
        // If we are enabling MT, we must ensure GPU is off and cleaned up
        if (!useMultithreading) {
            if (_gpuEngine) {
                _gpuEngine.dispose();
                _gpuEngine = null;
            }
        }

        set((state) => ({
            useMultithreading: !state.useMultithreading,
            useGPU: false, // Ensure GPU off
            physicsState: null,
            gpuDataInvalidated: true,
            isCalculating: false // Reset in case we were stuck
        }));
    },

    toggleGPU: () => {
        const { useGPU } = get();
        // If currently using GPU, disabling it -> Clean up GPU
        if (useGPU) {
            if (_gpuEngine) {
                _gpuEngine.dispose();
                _gpuEngine = null;
            }
        }
        // If enabling GPU, ensure Worker is off and cleaned up
        if (!useGPU) {
            if (_workerManager) {
                _workerManager.terminate();
                _workerManager = null;
            }
        }

        set((state) => ({
            useGPU: !state.useGPU,
            useMultithreading: false, // Ensure MT off
            physicsState: null,
            gpuDataInvalidated: true, // Force upload when switching
            isCalculating: false // Reset in case we were stuck
        }));
    },

    toggleRealisticDistances: () => {
        const { useRealisticDistances, bodies } = get();
        const newScale = !useRealisticDistances;

        // Scale factor: REALISTIC (1AU=50) / COMPRESSED (1AU=20) = 2.5
        // NOTE: Updated constants make this 4.0 (200/50).
        const factor = newScale ? DISTANCE_SCALE_FACTOR : 1 / DISTANCE_SCALE_FACTOR;

        // Velocity scaling: v = sqrt(GM/r), so when r -> r*factor, v -> v/sqrt(factor)
        const velocityFactor = 1 / Math.sqrt(factor);



        // Transform all body positions and velocities (except fixed bodies at origin)
        const scaledBodies = bodies.map(body => {
            // Skip fixed bodies (usually central star)
            if (body.isFixed) return body;

            return {
                ...body,
                position: new Vector3(
                    body.position.x * factor,
                    body.position.y * factor,
                    body.position.z * factor
                ),
                velocity: new Vector3(
                    body.velocity.x * velocityFactor,
                    body.velocity.y * velocityFactor,
                    body.velocity.z * velocityFactor
                )
            };
        });

        // Dispatch event for camera adjustment
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('distanceScaleChanged', {
                detail: { realistic: newScale, factor }
            }));
        }

        set({
            useRealisticDistances: newScale,
            // timeScale: newTimeScale, // Do NOT overwrite user setting. We handle scaling dynamically in updateBodies
            bodies: scaledBodies,
            physicsState: null,
            gpuDataInvalidated: true
        });
    },


    addTidalDisruptionEvent: (event) => set((state) => ({
        tidallyDisruptedEvents: [...state.tidallyDisruptedEvents, event]
    })),

    removeTidalDisruptionEvent: (bodyId) => set((state) => ({
        tidallyDisruptedEvents: state.tidallyDisruptedEvents.filter(e => e.bodyId !== bodyId)
    })),

    addCollisionEvent: (event) => set((state) => ({
        collisionEvents: [...state.collisionEvents, event]
    })),

    removeCollisionEvent: (eventId) => set((state) => ({
        collisionEvents: state.collisionEvents.filter(e => e.id !== eventId)
    })),

    toggleGravityField: () => set((state) => ({ showGravityField: !state.showGravityField })),

    // History
    history: [],
    historyIndex: -1,

    pushHistoryAction: (action) => set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return {
            history: [...newHistory, action],
            historyIndex: newHistory.length
        };
    }),

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < 0) return;

        const action = history[historyIndex];

        switch (action.type) {
            case 'ADD':
                // Reverse of ADD is REMOVE
                set(state => ({
                    bodies: state.bodies.filter(b => b.id !== action.body.id),
                    physicsState: null,
                    gpuDataInvalidated: true,
                    // If we removed the selected body, deselect it
                    selectedBodyId: state.selectedBodyId === action.body.id ? null : state.selectedBodyId
                }));
                break;
            case 'REMOVE':
                // Reverse of REMOVE is ADD
                set(state => ({
                    bodies: [...state.bodies, action.body],
                    physicsState: null,
                    gpuDataInvalidated: true
                }));
                break;
            case 'UPDATE':
                // Reverse of UPDATE is restoring PREVIOUS values
                set(state => ({
                    bodies: state.bodies.map(b =>
                        b.id === action.id ? { ...b, ...action.previous } : b
                    ),
                    physicsState: null,
                    gpuDataInvalidated: true
                }));
                // If updated body was selected, it stays selected.
                break;
        }

        set({ historyIndex: historyIndex - 1 });
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const action = history[historyIndex + 1];

        switch (action.type) {
            case 'ADD':
                // Re-apply ADD
                set(state => ({
                    bodies: [...state.bodies, action.body],
                    physicsState: null,
                    gpuDataInvalidated: true
                }));
                break;
            case 'REMOVE':
                // Re-apply REMOVE
                set(state => ({
                    bodies: state.bodies.filter(b => b.id !== action.body.id),
                    physicsState: null,
                    gpuDataInvalidated: true,
                    selectedBodyId: state.selectedBodyId === action.body.id ? null : state.selectedBodyId
                }));
                break;
            case 'UPDATE':
                // Re-apply UPDATE (restore CURRENT values)
                set(state => ({
                    bodies: state.bodies.map(b =>
                        b.id === action.id ? { ...b, ...action.current } : b
                    ),
                    physicsState: null,
                    gpuDataInvalidated: true
                }));
                break;
        }

        set({ historyIndex: historyIndex + 1 });
    },

    addBody: (body) => {
        const { bodies, pushHistoryAction } = get();
        const newBody = { ...body, id: uuidv4() };

        pushHistoryAction({ type: 'ADD', body: newBody });

        const newBodies = [...bodies, newBody];
        set({ bodies: newBodies, physicsState: null, gpuDataInvalidated: true });
    },

    duplicateBody: (id) => {
        const { bodies, pushHistoryAction } = get();
        const bodyToDuplicate = bodies.find(b => b.id === id);
        if (!bodyToDuplicate) return;

        const newBody = {
            ...bodyToDuplicate,
            id: uuidv4(),
            name: `${bodyToDuplicate.name} (Copy)`,
            position: bodyToDuplicate.position.clone().add(new Vector3(2, 0, 2)), // Offset slightly
            velocity: bodyToDuplicate.velocity.clone()
        };

        pushHistoryAction({ type: 'ADD', body: newBody });

        set((state) => ({
            bodies: [...state.bodies, newBody],
            selectedBodyId: newBody.id, // Select the new body
            physicsState: null, // Invalidate state
            gpuDataInvalidated: true
        }));
    },

    removeBody: (id) => {
        const { bodies, followingBodyId, selectedBodyId, pushHistoryAction } = get();
        const bodyToRemove = bodies.find(b => b.id === id);

        if (bodyToRemove) {
            pushHistoryAction({ type: 'REMOVE', body: bodyToRemove });
        }

        const newBodies = bodies.filter(b => b.id !== id);
        set({
            bodies: newBodies,
            physicsState: null, // Invalidate state
            followingBodyId: followingBodyId === id ? null : followingBodyId,
            selectedBodyId: selectedBodyId === id ? null : selectedBodyId,
            gpuDataInvalidated: true
        });
    },



    updateBodies: async () => {
        const { bodies, simulationState, timeScale, simulationTime, physicsState, useMultithreading, useGPU, isCalculating, gpuDataInvalidated } = get();

        physicsStats.bodyCount = bodies.length;
        physicsStats.mode = useGPU ? 'GPU' : (useMultithreading ? 'Worker' : 'CPU');

        if (simulationState === 'paused') return;
        if ((useMultithreading || useGPU) && isCalculating) return;

        const start = performance.now();



        // Correction: We actually want this applied regardless of CPU/GPU IF we want visual parity.
        // However, GPU/Worker might need dt passed explicitly.
        // Wait, 'useRealisticDistances' is state.
        const distModeMultiplier = get().useRealisticDistances ? 8.0 : 1.0;

        const dt = BASE_DT * timeScale * distModeMultiplier;

        // Energy Calculation (Throttled 1Hz)
        const now = performance.now();
        if (!physicsStats.lastEnergyCheck || now - physicsStats.lastEnergyCheck > 1000) {
            physicsStats.lastEnergyCheck = now;

            const handleEnergyUpdate = (e: { kinetic: number, potential: number, total: number } | number) => {
                const current = typeof e === 'number' ? { kinetic: 0, potential: 0, total: e } : e;

                // Initialize Initial Energy if reset or first run
                if (simulationTime < 0.1 || physicsStats.energy.initial === 0) {
                    physicsStats.energy.initial = current.total;
                }

                const drift = physicsStats.energy.initial !== 0
                    ? (current.total - physicsStats.energy.initial) / Math.abs(physicsStats.energy.initial)
                    : 0;

                physicsStats.energy = {
                    ...current,
                    initial: physicsStats.energy.initial,
                    drift
                };
            };

            if (useMultithreading) {
                // Determine if worker returns object or number
                // Worker currently returns number, we will accept it for now or assume implementation plan allows simpler update
                // For now, let's treat worker result as total
                getWorkerManager().calculateEnergy(bodies.length).then((e: number | { kinetic: number; potential: number; total: number }) => {
                    // Temporarily handle both until worker is updated
                    handleEnergyUpdate(e);
                });
            } else {
                const energy = calculateTotalEnergy(bodies);
                handleEnergyUpdate(energy);
            }
        }

        if (useGPU) {
            set({ isCalculating: true });
            try {
                const navGPU = getGPUEngine();
                if (!navGPU.isReady) await navGPU.init(BUFFER_LIMITS.MAX_BODIES);

                const steps = Math.ceil(dt / MAX_STABLE_DT);
                const stepDt = dt / steps;

                // Optimization: Only upload bodies if invalidated or new
                if (gpuDataInvalidated || !navGPU.isReady) {
                    await navGPU.setBodies(bodies);
                    set({ gpuDataInvalidated: false });
                }

                for (let i = 0; i < steps; i++) {
                    await navGPU.step(stepDt, bodies.length);
                }
                const gpuData = await navGPU.getBodies(bodies.length);

                if (gpuData) {
                    let nextBodies = bodies.map((b, i) => {
                        const idx = i * 12;
                        return {
                            ...b,
                            position: new Vector3(gpuData[idx], gpuData[idx + 1], gpuData[idx + 2]),
                            velocity: new Vector3(gpuData[idx + 4], gpuData[idx + 5], gpuData[idx + 6])
                        };
                    });

                    // GPU Collision Sync/Resolution
                    const collisions = await navGPU.getCollisions();

                    if (collisions && collisions.length > 0) {
                        const { bodies: resolvedBodies, hasRemovals, collisionEvents } = applyCollisions(nextBodies, collisions);
                        nextBodies = resolvedBodies;

                        // Dispatch events (Store legacy format) and Trigger Effects (New format)
                        if (collisionEvents && collisionEvents.length > 0) {
                            // 1. Dispatch legacy store events (for Scene.tsx independent rendering if needed? Actually we are moving to EffectsStore)
                            // But Scene.tsx in Week 1 uses store.collisionEvents. So we need to map them back?
                            // physics.ts/applyCollisions now returns detailed CollisionEvent[] (HEAD)
                            // Scene.tsx uses store.addCollisionEvent({ id, position, color, startTime })

                            collisionEvents.forEach(e => {
                                get().addCollisionEvent({
                                    id: uuidv4(),
                                    position: e.collisionPoint,
                                    color: e.smallerBodyColor,
                                    startTime: performance.now()
                                });
                            });

                            // 2. Trigger new visual effects (EffectsLayer)
                            triggerCollisionEffects(collisionEvents);
                        }

                        if (hasRemovals) {
                            set({ physicsState: null, gpuDataInvalidated: true });
                        }
                    }

                    set({
                        bodies: nextBodies,
                        physicsState: null,
                        simulationTime: simulationTime + dt,
                        isCalculating: false
                    });
                }
            } catch (e) {
                // Ignore AbortError caused by buffer destruction during cleanup/dispose
                if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('destroyed'))) {
                    return;
                }
                console.error("GPU Step Failed", e);
                set({ isCalculating: false, useGPU: false });
            }

        } else if (useMultithreading) {
            set({ isCalculating: true });

            const workerMgr = getWorkerManager();

            if (!physicsState || physicsState.count !== bodies.length) {
                workerMgr.setBodies(bodies);
            }

            // Capture collisions
            const collisions: [number, number][] = [];
            workerMgr.onCollision = (pairs: [number, number][]) => {
                collisions.push(...pairs);
            };

            try {
                await workerMgr.executeStep(bodies.length, dt);

                const workerState = workerMgr.getPhysicsState(bodies.length);
                workerState.ids = bodies.map(b => b.id);
                let nextBodies = syncStateToBodies(workerState, bodies);

                // Resolve Collisions (CPU Main Thread)
                if (collisions.length > 0) {
                    const { bodies: resolvedBodies, hasRemovals, collisionEvents } = applyCollisions(nextBodies, collisions);
                    nextBodies = resolvedBodies;

                    if (collisionEvents && collisionEvents.length > 0) {
                        collisionEvents.forEach(e => {
                            get().addCollisionEvent({
                                id: uuidv4(),
                                position: e.collisionPoint,
                                color: e.smallerBodyColor,
                                startTime: performance.now()
                            });
                        });

                        triggerCollisionEffects(collisionEvents);
                    }

                    if (hasRemovals) {
                        set({ physicsState: null });
                    }
                }

                set({
                    bodies: nextBodies,
                    physicsState: workerState,
                    simulationTime: simulationTime + dt,
                    isCalculating: false
                });
            } catch (e) {
                console.warn("Worker Step Failed / Terminated", e);
                set({ isCalculating: false, useMultithreading: false });
            }


        } else {
            let currentState = physicsState;
            if (!currentState || currentState.count !== bodies.length) {
                currentState = createPhysicsState(bodies);
            }

            const steps = Math.ceil(dt / MAX_STABLE_DT);
            const stepDt = dt / steps;

            // Disable collisions in updatePhysicsSoA, handle them manually for effects
            for (let i = 0; i < steps; i++) {
                updatePhysicsSoA(currentState, stepDt, false, false);
            }

            let nextBodies = syncStateToBodies(currentState, bodies);

            // CPU-mode collision detection and effects
            // Use applyCollisions to get collision events for visual effects
            const { positions, radii, masses } = currentState;
            const collisionPairs: [number, number][] = [];

            for (let i = 0; i < currentState.count; i++) {
                if (masses[i] <= 0) continue;

                for (let j = i + 1; j < currentState.count; j++) {
                    if (masses[j] <= 0) continue;

                    const i3 = i * 3;
                    const j3 = j * 3;

                    const dx = positions[i3] - positions[j3];
                    const dy = positions[i3 + 1] - positions[j3 + 1];
                    const dz = positions[i3 + 2] - positions[j3 + 2];

                    const distSq = dx * dx + dy * dy + dz * dz;
                    const radSum = radii[i] + radii[j];

                    if (distSq < (radSum * 0.8) ** 2) {
                        collisionPairs.push([i, j]);
                    }
                }
            }

            if (collisionPairs.length > 0) {
                const { bodies: resolvedBodies, collisionEvents } = applyCollisions(nextBodies, collisionPairs);
                nextBodies = resolvedBodies;

                // Trigger visual effects
                if (collisionEvents && collisionEvents.length > 0) {
                    // Add legacy collision events for Scene.tsx
                    collisionEvents.forEach(e => {
                        get().addCollisionEvent({
                            id: uuidv4(),
                            position: e.collisionPoint,
                            color: e.smallerBodyColor,
                            startTime: performance.now()
                        });
                    });

                    // Trigger new effects system
                    triggerCollisionEffects(collisionEvents);
                }

                // Invalidate state due to removals
                set({ physicsState: null });
            }

            // Roche Limit Check: DISABLED
            // The simulation's visual scaling (large radii for visibility, compressed distances)
            // makes accurate Roche limit physics impractical. Collision effects provide sufficient drama.

            set({
                bodies: nextBodies,
                physicsState: currentState,
                simulationTime: simulationTime + dt
            });
        }

        physicsStats.physicsDuration = performance.now() - start;
    },

    setSimulationState: (state) => set({ simulationState: state }),

    loadSolarSystem: () => {
        set({
            bodies: createSolarSystem(),
            physicsState: null,
            timeScale: 1.0,
            simulationState: 'running',
            simulationTime: 0,
            followingBodyId: null,
            selectedBodyId: null,
            cameraMode: 'free',
            gpuDataInvalidated: true,
            useRealisticDistances: false,
            currentSystemId: 'solar-system',
            currentSystemMode: null,
            resetToken: 0,
            history: [],
            historyIndex: -1
        });
    },

    loadStarSystem: (systemId: string, mode?: StarSystemMode) => {
        const preset = getPresetById(systemId);
        if (!preset) return;

        const bodies = preset.createBodies(mode).map(body => ({
            ...body,
            id: uuidv4()
        }));

        // Get camera config: use mode-specific if available, otherwise default
        const cameraConfig = (mode && preset.getCameraForMode)
            ? preset.getCameraForMode(mode)
            : preset.initialCamera;

        // Dispatch event for camera reset
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('starSystemChanged', {
                detail: {
                    systemId,
                    mode,
                    camera: cameraConfig
                }
            }));
        }

        set({
            bodies,
            currentSystemId: systemId,
            currentSystemMode: mode || null,
            physicsState: null,
            timeScale: 1.0,
            simulationState: 'running',
            simulationTime: 0,
            followingBodyId: null,
            selectedBodyId: null,
            cameraMode: 'free',
            gpuDataInvalidated: true,
            useRealisticDistances: false,
            // Zen Mode
            zenMode: false,
            resetToken: 0,
            history: [],
            historyIndex: -1
        });
    },

    toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
    toggleLabMode: () => set((state) => ({ labMode: !state.labMode })),

    setUserMode: (mode) => {
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbit-simulator-user-mode', mode);
        }
        set({ userMode: mode });
    },

    setHasSeenOnboarding: (seen) => {
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbit-simulator-onboarding-seen', String(seen));
        }
        set({ hasSeenOnboarding: seen });
    },

    setTimeScale: (scale) => set({ timeScale: scale }),

    togglePrediction: () => set((state) => ({ showPrediction: !state.showPrediction })),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleRealisticVisuals: () => set((state) => ({ showRealisticVisuals: !state.showRealisticVisuals })),
    toggleHabitableZone: () => set((state) => ({ showHabitableZone: !state.showHabitableZone })),
    togglePerformance: () => set((state) => ({ showPerformance: !state.showPerformance })),
    setFollowingBody: (id) => set({ followingBodyId: id }),
    selectBody: (id) => set({ selectedBodyId: id }),
    setCameraMode: (mode) => set({ cameraMode: mode }),

    updateBody: (id, updates) => {
        const { bodies } = get();
        const newBodies = bodies.map(b => b.id === id ? { ...b, ...updates } : b);
        set({ bodies: newBodies, physicsState: null, gpuDataInvalidated: true });
    },

    reset: () => {
        const { currentSystemId, currentSystemMode, bodies, resetToken } = get();

        // Determine which bodies to load
        let initialBodies = INITIAL_BODIES;
        if (currentSystemId && currentSystemId !== 'solar-system') {
            const preset = getPresetById(currentSystemId);
            if (preset) {
                initialBodies = preset.createBodies(currentSystemMode || undefined).map(body => ({
                    ...body,
                    id: uuidv4()
                }));
            }
        } else {
            initialBodies = createSolarSystem();
        }

        // PRESERVE IDs: Overwrite new IDs with existing ones for matching bodies
        // This ensures the Scene/Camera component doesn't see them as "new" objects
        const existingIdMap = new Map(bodies.map(b => [b.name, b.id]));

        const bodiesWithPreservedIds = initialBodies.map(newBody => {
            if (existingIdMap.has(newBody.name)) {
                return { ...newBody, id: existingIdMap.get(newBody.name)! };
            }
            return newBody;
        });

        // If realistic mode is on, we must re-apply the scaling to the freshly loaded bodies
        // becasue createSolarSystem/createBodies generates them at "Normal" (Compressed) scale.
        const useRealisticDistances = get().useRealisticDistances;
        let finalBodies = bodiesWithPreservedIds;

        if (useRealisticDistances) {
            const factor = DISTANCE_SCALE_FACTOR;
            const velocityFactor = 1 / Math.sqrt(factor);

            finalBodies = finalBodies.map(body => {
                if (body.isFixed) return body;
                return {
                    ...body,
                    position: new Vector3(
                        body.position.x * factor,
                        body.position.y * factor,
                        body.position.z * factor
                    ),
                    velocity: new Vector3(
                        body.velocity.x * velocityFactor,
                        body.velocity.y * velocityFactor,
                        body.velocity.z * velocityFactor
                    )
                };
            });
        }

        set({
            bodies: finalBodies,
            physicsState: null,
            simulationTime: 0,
            gpuDataInvalidated: true,
            resetToken: resetToken + 1,
            // Reset visualization states

            showGravityField: false,
            // We don't touch followingBodyId/cameraMode here, relying on ID preservation.
            history: [],
            historyIndex: -1
        });
    }
}));
