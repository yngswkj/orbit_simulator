import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../store/physicsStore';

export const usePhysicsLoop = () => {
    const updateBodies = usePhysicsStore((state) => state.updateBodies);
    const simulationState = usePhysicsStore((state) => state.simulationState);

    useFrame(() => {
        if (simulationState === 'running') {
            updateBodies();
        }
    });
};
