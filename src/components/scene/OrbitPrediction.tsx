import React, { useMemo } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { BASE_DT } from '../../utils/physics';
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

// Worker singleton
let predictionWorker: Worker | null = null;
let pendingRequest = false;

const getPredictionWorker = (): Worker | null => {
    if (typeof window === 'undefined') return null;

    if (!predictionWorker) {
        try {
            predictionWorker = new Worker(
                new URL('../../workers/predictionWorker.ts', import.meta.url),
                { type: 'module' }
            );
        } catch {
            console.warn('Prediction worker not available, using main thread fallback');
            return null;
        }
    }
    return predictionWorker;
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

    // Reset paths when distance scale changes
    React.useEffect(() => {
        setPaths([]);
    }, [useRealisticDistances]);

    // Worker message handler
    React.useEffect(() => {
        const worker = getPredictionWorker();
        if (!worker) return;

        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'result') {
                pendingRequest = false;
                const result = e.data.paths.map((p: { id: string; points: number[][]; color: string }) => ({
                    id: p.id,
                    points: p.points.map((pt: number[]) => new Vector3(pt[0], pt[1], pt[2])),
                    color: p.color
                }));
                setPaths(result);
            }
        };

        worker.addEventListener('message', handleMessage);
        return () => {
            worker.removeEventListener('message', handleMessage);
        };
    }, []);

    // Main prediction loop with dynamic frequency
    React.useEffect(() => {
        if (simulationState === 'paused') return;

        const updateInterval = getUpdateInterval(timeScale);

        const interval = setInterval(() => {
            const currentBodies = usePhysicsStore.getState().bodies;
            if (currentBodies.length === 0) return;

            const worker = getPredictionWorker();
            const dt = BASE_DT * TIME_MULTIPLIER;

            if (worker && !pendingRequest) {
                // Use Worker for calculation
                pendingRequest = true;

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

        return () => clearInterval(interval);
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
