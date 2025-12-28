import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { createPhysicsState, updatePhysicsSoA, BASE_DT } from '../../utils/physics';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';

const PREDICTION_STEPS = 1200; // Increased steps for smoothness
const TIME_MULTIPLIER = 1.0; // Reduced multiplier for better accuracy (smaller dt)

export const OrbitPrediction: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const simulationState = usePhysicsStore((state) => state.simulationState);

    const [paths, setPaths] = React.useState<{ id: string; points: Vector3[]; color: string }[]>([]);

    React.useEffect(() => {
        if (simulationState === 'paused') return;

        const interval = setInterval(() => {
            const currentBodies = usePhysicsStore.getState().bodies;
            if (currentBodies.length === 0) return;

            // 1. Create SoA state ONCE (Drastic allocation reduction)
            // We clone initial state implicitly by creating a new PhysicsState from bodies
            const state = createPhysicsState(currentBodies);

            // Map IDs to indices for easy access
            const ids = state.ids;
            const colors: { [key: string]: string } = {};
            currentBodies.forEach(b => colors[b.id] = b.color);

            const newPaths: { [key: string]: Vector3[] } = {};
            for (let i = 0; i < state.count; i++) {
                // Initialize paths with current position
                newPaths[ids[i]] = [new Vector3(state.positions[i * 3], state.positions[i * 3 + 1], state.positions[i * 3 + 2])];
            }

            // 2. Integration Loop using SoA
            const dt = BASE_DT * TIME_MULTIPLIER;
            // Use local variables for speed
            const shouldSaveFrequency = 10; // Save every 10 steps (120 points total)

            for (let i = 0; i < PREDICTION_STEPS; i++) {
                // Direct Symplectic Integration (Velocity Verlet)
                updatePhysicsSoA(state, dt, false, false); // No BarnesHut, No Collision for prediction (faster)

                if (i % shouldSaveFrequency === 0) {
                    for (let j = 0; j < state.count; j++) {
                        const id = ids[j];
                        // Only add points for bodies that exist in initial set
                        if (newPaths[id]) {
                            newPaths[id].push(new Vector3(
                                state.positions[j * 3],
                                state.positions[j * 3 + 1],
                                state.positions[j * 3 + 2]
                            ));
                        }
                    }
                }
            }

            const result = Object.keys(newPaths).map(id => ({
                id,
                points: newPaths[id],
                color: colors[id] || 'white'
            }));

            setPaths(result);
        }, 100); // 10fps update rate (smooth enough for prediction lines)

        return () => clearInterval(interval);
    }, [simulationState, bodies.length]);

    return (
        <group>
            {paths.map(p => (
                <Line
                    key={p.id}
                    points={p.points}
                    color={p.color}
                    lineWidth={1.5}
                    opacity={0.4}
                    transparent
                />
            ))}
        </group>
    );
};
