import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { projectGravitationalLens } from './gravitationalLens'

const createCamera = (
    aspect: number,
    lookAtTarget: [number, number, number] = [0, 0, 0]
) => {
    const camera = new PerspectiveCamera(45, aspect, 0.1, 1000)
    camera.position.set(0, 0, 50)
    camera.lookAt(...lookAtTarget)
    camera.updateMatrixWorld()
    camera.updateProjectionMatrix()
    return camera
}

describe('gravitational lens projection', () => {
    it('projects a visible black hole near screen center', () => {
        const camera = createCamera(16 / 9)
        const projection = projectGravitationalLens(
            camera,
            new Vector3(0, 0, 0),
            2.4,
            { width: 1600, height: 900 }
        )

        expect(projection.visible).toBe(true)
        expect(projection.screenUV.x).toBeCloseTo(0.5, 5)
        expect(projection.screenUV.y).toBeCloseTo(0.5, 5)
        expect(projection.screenRadius).toBeGreaterThan(0)
    })

    it('updates the projected center when the camera rotates horizontally', () => {
        const leftPanCamera = createCamera(16 / 9, [10, 0, 0])
        const rightPanCamera = createCamera(16 / 9, [-10, 0, 0])

        const leftProjection = projectGravitationalLens(
            leftPanCamera,
            new Vector3(0, 0, 0),
            2.4,
            { width: 1600, height: 900 }
        )
        const rightProjection = projectGravitationalLens(
            rightPanCamera,
            new Vector3(0, 0, 0),
            2.4,
            { width: 1600, height: 900 }
        )

        expect(leftProjection.visible).toBe(true)
        expect(rightProjection.visible).toBe(true)
        expect(leftProjection.screenUV.x).toBeLessThan(0.5)
        expect(rightProjection.screenUV.x).toBeGreaterThan(0.5)
        expect(leftProjection.screenRadius).toBeGreaterThan(0)
        expect(rightProjection.screenRadius).toBeGreaterThan(0)
    })

    it('marks the lens as hidden when the black hole is behind the camera', () => {
        const camera = createCamera(16 / 9, [0, 0, 100])
        const projection = projectGravitationalLens(
            camera,
            new Vector3(0, 0, 0),
            2.4,
            { width: 1600, height: 900 }
        )

        expect(projection.visible).toBe(false)
        expect(projection.screenRadius).toBe(0)
    })

    it('reflects canvas aspect changes in the projected position', () => {
        const worldPosition = new Vector3(10, 0, 0)
        const squareCamera = createCamera(1)
        const wideCamera = createCamera(16 / 9)

        const squareProjection = projectGravitationalLens(
            squareCamera,
            worldPosition,
            2.4,
            { width: 1000, height: 1000 }
        )
        const wideProjection = projectGravitationalLens(
            wideCamera,
            worldPosition,
            2.4,
            { width: 1600, height: 900 }
        )

        expect(squareProjection.visible).toBe(true)
        expect(wideProjection.visible).toBe(true)
        expect(squareProjection.screenUV.x).toBeGreaterThan(wideProjection.screenUV.x)
    })
})
