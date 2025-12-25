import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { updatePhysics } from '../../utils/physics';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';

const PREDICTION_STEPS = 300; // Lookahead steps
const TIME_MULTIPLIER = 2.0;

export const OrbitPrediction: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const simulationState = usePhysicsStore((state) => state.simulationState);

    // Fallback to simpler implementation:
    // Just use regular State update but throttled.

    const [paths, setPaths] = React.useState<{ id: string; points: Vector3[]; color: string }[]>([]);

    // Use useEffect for lower frequency updates (Web Worker would be ideal for heavy N, but this suffices for now)
    React.useEffect(() => {
        if (simulationState === 'paused') return;

        const interval = setInterval(() => {
            const currentBodies = usePhysicsStore.getState().bodies;
            if (currentBodies.length === 0) return;

            let simBodies = currentBodies.map(b => ({
                ...b,
                position: b.position.clone(),
                velocity: b.velocity.clone()
            }));

            const newPaths: { [key: string]: Vector3[] } = {};
            currentBodies.forEach(b => {
                if (!b.isFixed) newPaths[b.id] = [b.position.clone()];
            });

            // Reduce steps or increase multipliers for longer range with less precision
            const steps = PREDICTION_STEPS;

            for (let i = 0; i < steps; i++) {
                simBodies = updatePhysics(simBodies, TIME_MULTIPLIER);
                // Save point every 5 steps to reduce vertex count
                if (i % 5 === 0) {
                    simBodies.forEach(b => {
                        if (newPaths[b.id]) newPaths[b.id].push(b.position.clone());
                    });
                }
            }

            const result = Object.keys(newPaths).map(id => ({
                id,
                points: newPaths[id],
                color: currentBodies.find(b => b.id === id)?.color || 'white'
            }));

            setPaths(result);
        }, 200); // Update 5 times per second (200ms) instead of frame-bound

        return () => clearInterval(interval);
    }, [simulationState, bodies.length]); // Re-run if bodies count changes significantly or paused state toggles

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
