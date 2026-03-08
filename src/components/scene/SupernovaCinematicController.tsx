import React, { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { usePhysicsStore } from '../../store/physicsStore'
import { transitionCamera, transitionToBody, transitionToHome, transitionZoom } from '../../utils/cameraTransitions'
import { getPresetById } from '../../utils/starSystems'
import { TIDAL_APPROACH_WIDE_RATIO, evaluateScriptedScenarioFrame } from '../../utils/scriptedScenarios'

const computeBodiesFrame = (
    bodies: ReturnType<typeof usePhysicsStore.getState>['bodies'],
    focusIds: string[]
) => {
    const focusBodies = bodies.filter(body => focusIds.includes(body.id))

    if (focusBodies.length === 0) {
        return null
    }

    const center = focusBodies.reduce(
        (acc, body) => acc.add(body.position),
        new Vector3(0, 0, 0)
    ).multiplyScalar(1 / focusBodies.length)

    const maxActorRadius = focusBodies.reduce((max, body) => Math.max(max, body.radius), 1)
    const farthestBodyDistance = bodies.reduce((max, body) => {
        return Math.max(max, center.distanceTo(body.position))
    }, maxActorRadius * 12)

    const frameDistance = Math.max(farthestBodyDistance * 1.7, maxActorRadius * 18)

    return {
        cameraPosition: center.clone().add(new Vector3(frameDistance * 0.85, frameDistance * 0.55, frameDistance)),
        lookAt: center
    }
}

const computeWideBodyFrame = (
    body: ReturnType<typeof usePhysicsStore.getState>['bodies'][number],
    currentDistance: number
) => {
    const bodyPosition = new Vector3(body.position.x, body.position.y, body.position.z)
    const accretionDiskRadius = body.hasAccretionDisk && body.accretionDiskConfig
        ? body.radius * body.accretionDiskConfig.outerRadius
        : body.radius
    const jetExtent = body.hasJets ? body.radius * 15 : body.radius
    const visualRadius = Math.max(body.radius, accretionDiskRadius, jetExtent)
    const distance = Math.max(visualRadius * 2.35, currentDistance * 0.58, 78)
    const offsetDirection = new Vector3(0.72, 0.24, 0.92).normalize()

    return {
        cameraPosition: bodyPosition.clone().add(offsetDirection.multiplyScalar(distance)),
        lookAt: bodyPosition
    }
}

const computeTidalStreamFrame = (
    primary: ReturnType<typeof usePhysicsStore.getState>['bodies'][number],
    target: ReturnType<typeof usePhysicsStore.getState>['bodies'][number],
    pushIn: number
) => {
    const primaryPosition = new Vector3(primary.position.x, primary.position.y, primary.position.z)
    const targetPosition = new Vector3(target.position.x, target.position.y, target.position.z)
    const tidalAxis = primaryPosition.clone().sub(targetPosition)
    const separation = Math.max(tidalAxis.length(), primary.radius + target.radius * 2)

    if (tidalAxis.lengthSq() <= 0.0001) {
        return computeBodiesFrame([primary, target], [primary.id, target.id])
    }

    tidalAxis.normalize()
    const referenceUp = Math.abs(tidalAxis.y) > 0.82
        ? new Vector3(0, 0, 1)
        : new Vector3(0, 1, 0)
    const lateral = new Vector3().crossVectors(tidalAxis, referenceUp).normalize()
    const vertical = new Vector3().crossVectors(lateral, tidalAxis).normalize()
    const center = targetPosition.clone().lerp(primaryPosition, 0.44 + pushIn * 0.28)
    const primaryVisualRadius = primary.hasAccretionDisk && primary.accretionDiskConfig
        ? primary.radius * primary.accretionDiskConfig.outerRadius
        : primary.radius * 6.5
    const streamExtent = Math.max(separation * 0.9, target.radius * 4.2)
    const visualExtent = Math.max(primaryVisualRadius, streamExtent)
    const frameDistance = Math.max(
        visualExtent * (1.72 - pushIn * 0.45),
        separation * (1.48 - pushIn * 0.18),
        34
    )

    return {
        cameraPosition: center.clone()
            .add(lateral.multiplyScalar(frameDistance * 0.62))
            .add(vertical.multiplyScalar(frameDistance * 0.22))
            .add(tidalAxis.clone().multiplyScalar(-frameDistance * (0.24 - pushIn * 0.05))),
        lookAt: center.clone().add(tidalAxis.clone().multiplyScalar(separation * 0.14))
    }
}

export const SupernovaCinematicController: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies)
    const currentSystemId = usePhysicsStore(state => state.currentSystemId)
    const scenario = usePhysicsStore(state => state.scriptedScenario)
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody)
    const setCameraMode = usePhysicsStore(state => state.setCameraMode)
    const advanceScriptedScenario = usePhysicsStore(state => state.advanceScriptedScenario)
    const completeScriptedScenario = usePhysicsStore(state => state.completeScriptedScenario)
    const triggerSupernova = usePhysicsStore(state => state.triggerSupernova)
    const triggerScriptedTidalDisruption = usePhysicsStore(state => state.triggerScriptedTidalDisruption)
    const finalizeScriptedTidalDisruption = usePhysicsStore(state => state.finalizeScriptedTidalDisruption)
    const { camera, controls } = useThree()

    const scenarioConfig = useMemo(() => {
        if (!currentSystemId) {
            return null
        }

        return getPresetById(currentSystemId)?.scenario ?? null
    }, [currentSystemId])

    const lastPhaseRef = React.useRef<string>('idle')

    useFrame(() => {
        if (!scenario.active || !scenario.kind || !scenarioConfig) {
            return
        }

        const evaluation = evaluateScriptedScenarioFrame(
            scenario,
            scenarioConfig,
            bodies,
            performance.now()
        )

        if (evaluation.nextPhase === 'complete') {
            completeScriptedScenario(scenario.outcomeBodyId, {
                ...evaluation.updates,
                focusBodyId: scenario.outcomeBodyId
            })
        } else if (evaluation.nextPhase) {
            advanceScriptedScenario(evaluation.nextPhase, evaluation.updates)
        } else if (evaluation.updates) {
            advanceScriptedScenario(scenario.phase, evaluation.updates)
        }

        for (const effect of evaluation.effects) {
            switch (effect) {
                case 'trigger-supernova':
                    if (scenario.primaryBodyId) {
                        triggerSupernova(scenario.primaryBodyId)
                    }
                    break
                case 'trigger-tidal-disruption':
                    if (
                        scenario.kind === 'tidal-disruption' &&
                        scenario.primaryBodyId &&
                        scenario.targetBodyId &&
                        scenarioConfig.kind === 'tidal-disruption'
                    ) {
                        triggerScriptedTidalDisruption(
                            scenario.primaryBodyId,
                            scenario.targetBodyId,
                            scenarioConfig.disruptionDurationMs
                        )
                    }
                    break
                case 'finalize-tidal-disruption':
                    if (scenario.primaryBodyId && scenario.targetBodyId) {
                        finalizeScriptedTidalDisruption(scenario.primaryBodyId, scenario.targetBodyId)
                    }
                    break
                default:
                    break
            }
        }
    })

    React.useEffect(() => {
        if (!controls || !scenario.active || !scenario.kind) {
            lastPhaseRef.current = 'idle'
            return
        }

        const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
        const primary = scenario.primaryBodyId
            ? bodies.find(body => body.id === scenario.primaryBodyId)
            : null
        const target = scenario.targetBodyId
            ? bodies.find(body => body.id === scenario.targetBodyId)
            : null
        const focus = scenario.focusBodyId
            ? bodies.find(body => body.id === scenario.focusBodyId)
            : null
        const outcome = scenario.outcomeBodyId
            ? bodies.find(body => body.id === scenario.outcomeBodyId)
            : null
        const focusFrame = computeBodiesFrame(
            bodies,
            [scenario.focusBodyId, scenario.targetBodyId, scenario.primaryBodyId].filter(Boolean) as string[]
        )
        const establishingFrame = computeBodiesFrame(
            bodies,
            bodies.map(body => body.id)
        )
        const interactionFrame = computeBodiesFrame(
            bodies,
            [scenario.primaryBodyId, scenario.targetBodyId].filter(Boolean) as string[]
        )
        const breachFrame = primary && target
            ? computeTidalStreamFrame(primary, target, 0.08)
            : null
        const captureFrame = primary && target
            ? computeTidalStreamFrame(primary, target, 0.24)
            : null
        const tidalApproachWide = scenario.kind === 'tidal-disruption'
            && scenario.phase === 'approach'
            && (scenario.metricValue ?? Infinity) <= TIDAL_APPROACH_WIDE_RATIO
        const cameraCue = scenario.kind === 'tidal-disruption'
            ? `${scenario.kind}:${scenario.phase}:${tidalApproachWide ? 'wide' : 'track'}`
            : `${scenario.kind}:${scenario.phase}`

        if (lastPhaseRef.current === cameraCue) {
            return
        }

        lastPhaseRef.current = cameraCue

        if (scenario.kind === 'supernova') {
            switch (scenario.phase) {
                case 'intro':
                    if (focus) {
                        setFollowingBody(focus.id)
                        setCameraMode('sun_lock')
                        transitionToBody(camera, orbitControls, focus.position, focus.radius, {
                            duration: 1.0,
                            ease: 'power3.out'
                        })
                    }
                    break
                case 'countdown':
                    if (focus) {
                        setFollowingBody(focus.id)
                        setCameraMode('sun_lock')
                        transitionToBody(camera, orbitControls, focus.position, focus.radius, {
                            duration: 1.0,
                            ease: 'power2.inOut'
                        })
                        transitionZoom(camera, orbitControls, 0.8, {
                            duration: 1.2,
                            ease: 'power2.out'
                        })
                    }
                    break
                case 'shock-breakout':
                case 'ejecta':
                    if (focusFrame) {
                        setFollowingBody(focus?.id ?? null)
                        setCameraMode('sun_lock')
                        transitionCamera(camera, orbitControls, focusFrame.cameraPosition, focusFrame.lookAt, {
                            duration: 1.3,
                            ease: 'power3.out'
                        })
                    }
                    break
                case 'remnant':
                    if (outcome) {
                        setFollowingBody(outcome.id)
                        setCameraMode('sun_lock')
                        transitionToBody(camera, orbitControls, outcome.position, outcome.radius, {
                            duration: 1.25,
                            ease: 'power3.out'
                        })
                    } else if (focusFrame) {
                        setFollowingBody(null)
                        setCameraMode('free')
                        transitionToHome(camera, orbitControls, focusFrame.cameraPosition, focusFrame.lookAt, {
                            duration: 1.4,
                            ease: 'power3.out'
                        })
                    }
                    break
                case 'complete':
                    if (!outcome && focusFrame) {
                        setFollowingBody(null)
                        setCameraMode('free')
                        transitionToHome(camera, orbitControls, focusFrame.cameraPosition, focusFrame.lookAt, {
                            duration: 1.2,
                            ease: 'power2.out'
                        })
                    }
                    break
                default:
                    break
            }

            return
        }

        switch (scenario.phase) {
            case 'intro':
                if (establishingFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionCamera(camera, orbitControls, establishingFrame.cameraPosition, establishingFrame.lookAt, {
                        duration: 1.25,
                        ease: 'power3.out'
                    })
                }
                break
            case 'approach':
                if (tidalApproachWide && breachFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionCamera(camera, orbitControls, breachFrame.cameraPosition, breachFrame.lookAt, {
                        duration: 1.1,
                        ease: 'power3.out'
                    })
                } else if (target) {
                    setFollowingBody(target.id)
                    setCameraMode('sun_lock')
                    transitionToBody(camera, orbitControls, target.position, target.radius, {
                        duration: 0.95,
                        ease: 'power2.out'
                    })
                }
                break
            case 'breach':
                if (breachFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionCamera(camera, orbitControls, breachFrame.cameraPosition, breachFrame.lookAt, {
                        duration: 1.3,
                        ease: 'power3.out'
                    })
                }
                break
            case 'debris-capture':
                if (captureFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionCamera(camera, orbitControls, captureFrame.cameraPosition, captureFrame.lookAt, {
                        duration: 1.2,
                        ease: 'power3.out'
                    })
                } else if (interactionFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionCamera(camera, orbitControls, interactionFrame.cameraPosition, interactionFrame.lookAt, {
                        duration: 1.2,
                        ease: 'power3.out'
                    })
                }
                break
            case 'aftermath':
            case 'complete':
                if (outcome ?? primary) {
                    const compactBody = outcome ?? primary
                    if (compactBody) {
                        const wideFrame = computeWideBodyFrame(
                            compactBody,
                            camera.position.distanceTo(compactBody.position)
                        )

                        setFollowingBody(null)
                        setCameraMode('free')
                        transitionCamera(camera, orbitControls, wideFrame.cameraPosition, wideFrame.lookAt, {
                            duration: 1.15,
                            ease: 'power3.out'
                        })
                    }
                } else if (interactionFrame) {
                    setFollowingBody(null)
                    setCameraMode('free')
                    transitionToHome(camera, orbitControls, interactionFrame.cameraPosition, interactionFrame.lookAt, {
                        duration: 1.1,
                        ease: 'power2.out'
                    })
                }
                break
            default:
                break
        }
    }, [
        advanceScriptedScenario,
        bodies,
        camera,
        completeScriptedScenario,
        controls,
        finalizeScriptedTidalDisruption,
        scenario.active,
        scenario.focusBodyId,
        scenario.kind,
        scenario.outcomeBodyId,
        scenario.phase,
        scenario.metricValue,
        scenario.primaryBodyId,
        scenario.targetBodyId,
        setCameraMode,
        setFollowingBody,
        triggerScriptedTidalDisruption,
        triggerSupernova
    ])

    return null
}
