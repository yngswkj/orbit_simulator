import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import { updatePhysics } from '../../utils/physics';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { Line } from '@react-three/drei';

const PREDICTION_STEPS = 300; // Lookahead steps
const TIME_MULTIPLIER = 2.0;

// Inner component for a single body's prediction line
const BodyPredictionLine = ({ bodyId, initialBodies }: { bodyId: string, initialBodies: any[] }) => {
    const lineRef = useRef<any>(null);

    // We calculate all paths in parent or here? 
    // Individual components calculating full N-body system is wasteful.
    // We need a single manager that calculates and passes data, OR a manager that updates refs.
    return null;
};

export const OrbitPrediction: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const simulationState = usePhysicsStore((state) => state.simulationState);

    // Refs for lines
    // We need a dynamic list of lines. 
    // It's tricky to update generic Line component geometry imperatively easily without re-render.
    // But we can just calculate in a loop and force update periodically, or optimize later.
    // For now, let's stick to the useEffect approach but trigger it more often, or accept it's static until bodies change?
    // User asked for "Forecast", usually implies seeing where they go from CURRENT moment.
    // So it must update every frame.

    // Let's use a simpler approach: Calculate points in useFrame and pass to Line instances?
    // No, passing props triggers React render.

    // Approach:
    // 1. One component 'PredictionManager'
    // 2. in useFrame: simulate N steps ahead.
    // 3. Construct the points array for each body.
    // 4. Update the geometry of line meshes directly.

    // However, Drei's <Line> is a wrapper around Line2 (fat lines).
    // Maybe using simple <line> with BufferGeometry is faster and easier to update imperatively.

    const linesRef = useRef<{ [key: string]: THREE.Line }>({});

    useFrame(({ clock }) => {
        // throttle updates to every 5 frames to save CPU?
        if (clock.getElapsedTime() % 0.1 < 0.02) {
            // Run simulation
            // Clone bodies lightweight
            let simBodies = bodies.map(b => ({
                ...b,
                position: b.position.clone(),
                velocity: b.velocity.clone()
            }));

            const positions: { [key: string]: number[] } = {};
            bodies.forEach(b => { if (!b.isFixed) positions[b.id] = [] });

            for (let i = 0; i < PREDICTION_STEPS; i++) {
                simBodies = updatePhysics(simBodies, TIME_MULTIPLIER);
                simBodies.forEach(b => {
                    if (positions[b.id]) {
                        positions[b.id].push(b.position.x, b.position.y, b.position.z);
                    }
                });
            }

            // Update geometries
            Object.keys(positions).forEach(id => {
                const line = linesRef.current[id];
                if (line && line.geometry) {
                    const attr = line.geometry.getAttribute('position') as Float32BufferAttribute;
                    if (attr) {
                        // Check size
                        // Reallocating buffer every frame is bad. 
                        // We should set a fixed size buffer.
                    }
                }
            });

            // Actually, for simplicity in React, let's just stick to a component that uses `useMemo` to generate points
            // and re-renders only when `bodies` change is NOT ENOUGH because position changes every frame.
            // Re-rendering 500 lines every frame via React is slow.
        }
    });

    // Fallback to simpler implementation:
    // Just use regular State update but throttled.

    const [paths, setPaths] = React.useState<{ id: string; points: Vector3[]; color: string }[]>([]);

    // Use a ref to throttle
    const frameCount = useRef(0);

    useFrame(() => {
        if (simulationState === 'paused') return; // No need to update prediction if paused? actually yes if we drag bodies.
        // Update every 10 frames
        frameCount.current++;
        if (frameCount.current % 10 === 0) {
            if (bodies.length === 0) return;

            let simBodies = bodies.map(b => ({
                ...b,
                position: b.position.clone(),
                velocity: b.velocity.clone()
            }));

            const newPaths: { [key: string]: Vector3[] } = {};
            bodies.forEach(b => { if (!b.isFixed) newPaths[b.id] = [b.position.clone()] });

            for (let i = 0; i < PREDICTION_STEPS; i++) {
                simBodies = updatePhysics(simBodies, TIME_MULTIPLIER);
                if (i % 2 === 0) {
                    simBodies.forEach(b => {
                        if (newPaths[b.id]) newPaths[b.id].push(b.position.clone());
                    });
                }
            }

            const result = Object.keys(newPaths).map(id => ({
                id,
                points: newPaths[id],
                color: bodies.find(b => b.id === id)?.color || 'white'
            }));

            setPaths(result);
        }
    });

    return (
        <group>
            {paths.map(p => (
                <Line
                    key={p.id}
                    points={p.points}
                    color={p.color}
                    lineWidth={1}
                    opacity={0.2}
                    transparent
                    vertexColors={false}
                />
            ))}
        </group>
    );
};
