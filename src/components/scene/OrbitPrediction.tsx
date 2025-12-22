import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
                />
            ))}
        </group>
    );
};
