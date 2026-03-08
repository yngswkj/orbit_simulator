import React, { useMemo } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { getSimulationStepDt } from '../../utils/physics';
import { Vector3, CatmullRomCurve3 } from 'three';
import { Line } from '@react-three/drei';

const PREDICTION_STEPS = 1200;
const TIME_MULTIPLIER = 1.0;
const SAVE_FREQUENCY = 10; // Save every 10 steps (120 points total)

// Dynamic update intervals based on timeScale
// Higher timeScale = more frequent updates needed
const getUpdateInterval = (timeScale: number): number => {
    if (timeScale >= 10) return 50;   // 20fps for fast simulation
    if (timeScale >= 5) return 80;    // 12.5fps
    if (timeScale >= 2) return 100;   // 10fps (default)
    if (timeScale >= 1) return 150;   // 6.7fps for normal speed
    return 200;                        // 5fps for slow simulation
};

interface PathData {
    id: string;
    points: Vector3[];
    color: string;
}

// Smooth orbit line with Catmull-Rom spline interpolation
const SmoothOrbitLine: React.FC<{ points: Vector3[]; color: string }> = ({ points, color }) => {
    const smoothPoints = useMemo(() => {
        if (points.length < 4) return points;
        try {
            const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
            // Interpolate to ~3x the original points for smooth curves
            return curve.getPoints(Math.min(points.length * 3, 360));
        } catch {
            return points;
        }
    }, [points]);

    if (smoothPoints.length < 2) return null;

    return (
        <Line
            points={smoothPoints}
            color={color}
            lineWidth={1.5}
            opacity={0.4}
            transparent
        />
    );
};

export const OrbitPrediction: React.FC = () => {
    const bodiesLength = usePhysicsStore((state) => state.bodies.length);
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const timeScale = usePhysicsStore((state) => state.timeScale);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);

    const [paths, setPaths] = React.useState<PathData[]>([]);
    const workerRef = React.useRef<Worker | null>(null);
    const pendingRequestRef = React.useRef(false);

    // Reset paths when distance scale changes
    React.useEffect(() => {
        setPaths([]);
    }, [useRealisticDistances]);

    // Worker lifecycle
    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            workerRef.current = new Worker(
                new URL('../../workers/predictionWorker.ts', import.meta.url),
                { type: 'module' }
            );
        } catch {
            console.warn('Prediction worker not available, using main thread fallback');
            workerRef.current = null;
            return;
        }

        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'result') {
                pendingRequestRef.current = false;
                const result = e.data.paths.map((p: { id: string; points: number[][]; color: string }) => ({
                    id: p.id,
                    points: p.points.map((pt: number[]) => new Vector3(pt[0], pt[1], pt[2])),
                    color: p.color
                }));
                setPaths(result);
            }
        };

        const worker = workerRef.current;
        if (!worker) return;

        worker.addEventListener('message', handleMessage);
        return () => {
            pendingRequestRef.current = false;
            worker.removeEventListener('message', handleMessage);
            worker.terminate();
            if (workerRef.current === worker) {
                workerRef.current = null;
            }
        };
    }, []);

    // Main prediction loop with dynamic frequency
    React.useEffect(() => {
        if (simulationState === 'paused') return;

        const updateInterval = getUpdateInterval(timeScale);

        const interval = setInterval(() => {
            const currentState = usePhysicsStore.getState();
            const currentBodies = currentState.bodies;
            if (currentBodies.length === 0) return;

            const worker = workerRef.current;
            const dt = getSimulationStepDt(
                currentState.timeScale,
                currentState.useRealisticDistances
            ) * TIME_MULTIPLIER;

            if (worker && !pendingRequestRef.current) {
                // Use Worker for calculation
                pendingRequestRef.current = true;

                const bodyData = currentBodies.map(b => ({
                    id: b.id,
                    position: { x: b.position.x, y: b.position.y, z: b.position.z },
                    velocity: { x: b.velocity.x, y: b.velocity.y, z: b.velocity.z },
                    mass: b.mass,
                    radius: b.radius,
                    color: b.color
                }));

                worker.postMessage({
                    type: 'predict',
                    bodies: bodyData,
                    steps: PREDICTION_STEPS,
                    dt,
                    saveFrequency: SAVE_FREQUENCY
                });
            }
            // Note: Main thread fallback removed for performance
            // If worker is unavailable, prediction lines won't update
        }, updateInterval);

        return () => {
            clearInterval(interval);
            pendingRequestRef.current = false;
        };
    }, [simulationState, timeScale, bodiesLength]);

    return (
        <group>
            {paths.map(p => (
                <SmoothOrbitLine
                    key={p.id}
                    points={p.points}
                    color={p.color}
                />
            ))}
        </group>
    );
};
