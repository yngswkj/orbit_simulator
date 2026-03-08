import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { usePhysicsStore } from '../../store/physicsStore';
import { transitionCamera, transitionToBody, transitionToHome, transitionZoom } from '../../utils/cameraTransitions';

const computeSystemFrame = (bodies: ReturnType<typeof usePhysicsStore.getState>['bodies'], targetBodyId: string) => {
    const target = bodies.find(body => body.id === targetBodyId);
    if (!target) {
        return null;
    }

    const targetPosition = new Vector3(target.position.x, target.position.y, target.position.z);
    const farthestBodyDistance = bodies.reduce((max, body) => {
        if (body.id === targetBodyId) {
            return max;
        }

        return Math.max(max, body.position.distanceTo(target.position));
    }, target.radius * 12);

    const frameDistance = Math.max(farthestBodyDistance * 1.8, target.radius * 18);
    const cameraPosition = targetPosition.clone().add(new Vector3(frameDistance * 0.85, frameDistance * 0.55, frameDistance));

    return {
        target,
        cameraPosition,
        lookAt: targetPosition
    };
};

export const SupernovaCinematicController: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const scenario = usePhysicsStore(state => state.supernovaScenario);
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody);
    const setCameraMode = usePhysicsStore(state => state.setCameraMode);
    const advanceSupernovaScenario = usePhysicsStore(state => state.advanceSupernovaScenario);
    const { camera, controls } = useThree();

    const lastPhaseRef = React.useRef<string>('idle');
    const lastCountdownBucketRef = React.useRef<number>(-1);

    useFrame(() => {
        if (scenario.phase !== 'countdown' || !scenario.triggerAt) {
            lastCountdownBucketRef.current = -1;
            return;
        }

        const remainingMs = Math.max(0, scenario.triggerAt - performance.now());
        const bucket = Math.ceil(remainingMs / 100);

        if (bucket !== lastCountdownBucketRef.current) {
            lastCountdownBucketRef.current = bucket;
            advanceSupernovaScenario('countdown', {
                countdownRemainingMs: remainingMs
            });
        }
    });

    React.useEffect(() => {
        if (!controls || !scenario.active) {
            lastPhaseRef.current = 'idle';
            return;
        }

        if (lastPhaseRef.current === scenario.phase) {
            return;
        }

        const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };
        const targetId = scenario.remnantBodyId ?? scenario.targetStarId;
        const frame = targetId ? computeSystemFrame(bodies, targetId) : null;
        const target = targetId ? bodies.find(body => body.id === targetId) : null;

        if (!target && scenario.phase !== 'complete') {
            return;
        }

        lastPhaseRef.current = scenario.phase;

        switch (scenario.phase) {
            case 'intro':
                if (target) {
                    setFollowingBody(target.id);
                    setCameraMode('sun_lock');
                    transitionToBody(camera, orbitControls, target.position, target.radius, {
                        duration: 1.0,
                        ease: 'power3.out'
                    });
                }
                break;
            case 'countdown':
                if (target) {
                    setFollowingBody(target.id);
                    setCameraMode('sun_lock');
                    transitionToBody(camera, orbitControls, target.position, target.radius, {
                        duration: 1.0,
                        ease: 'power2.inOut'
                    });
                    transitionZoom(camera, orbitControls, 0.8, {
                        duration: 1.2,
                        ease: 'power2.out'
                    });
                }
                break;
            case 'shock-breakout':
            case 'ejecta':
                if (frame) {
                    setFollowingBody(frame.target.id);
                    setCameraMode('sun_lock');
                    transitionCamera(camera, orbitControls, frame.cameraPosition, frame.lookAt, {
                        duration: 1.3,
                        ease: 'power3.out'
                    });
                }
                break;
            case 'remnant':
                if (scenario.remnantBodyId) {
                    const remnant = bodies.find(body => body.id === scenario.remnantBodyId);
                    if (remnant) {
                        setFollowingBody(remnant.id);
                        setCameraMode('sun_lock');
                        transitionToBody(camera, orbitControls, remnant.position, remnant.radius, {
                            duration: 1.25,
                            ease: 'power3.out'
                        });
                        break;
                    }
                }

                if (frame) {
                    setFollowingBody(null);
                    setCameraMode('free');
                    transitionToHome(camera, orbitControls, frame.cameraPosition, frame.lookAt, {
                        duration: 1.4,
                        ease: 'power3.out'
                    });
                }
                break;
            case 'complete':
                if (!scenario.remnantBodyId && frame) {
                    setFollowingBody(null);
                    setCameraMode('free');
                    transitionToHome(camera, orbitControls, frame.cameraPosition, frame.lookAt, {
                        duration: 1.2,
                        ease: 'power2.out'
                    });
                }
                break;
            default:
                break;
        }
    }, [
        advanceSupernovaScenario,
        bodies,
        camera,
        controls,
        scenario.active,
        scenario.phase,
        scenario.remnantBodyId,
        scenario.targetStarId,
        setCameraMode,
        setFollowingBody
    ]);

    return null;
};
