import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { computeCollisionCloseUpFrame } from './collisionCamera'

describe('collision camera framing', () => {
    it('tightens distant shots around the collision point', () => {
        const frame = computeCollisionCloseUpFrame({
            collisionPoint: new Vector3(0, 0, 0),
            currentCameraPosition: new Vector3(0, 0, 120),
            impactRadius: 1
        })

        expect(frame.distance).toBe(14)
        expect(frame.cameraPosition.z).toBeCloseTo(14)
    })

    it('does not pull farther back than the current camera distance', () => {
        const frame = computeCollisionCloseUpFrame({
            collisionPoint: new Vector3(0, 0, 0),
            currentCameraPosition: new Vector3(0, 0, 12),
            impactRadius: 4
        })

        expect(frame.distance).toBe(12)
    })

    it('uses the survivor position as the look target when available', () => {
        const frame = computeCollisionCloseUpFrame({
            collisionPoint: new Vector3(0, 0, 0),
            currentCameraPosition: new Vector3(10, 5, 20),
            impactRadius: 2,
            focusPosition: new Vector3(3, 1, -2)
        })

        expect(frame.lookAt.x).toBe(3)
        expect(frame.lookAt.y).toBe(1)
        expect(frame.lookAt.z).toBe(-2)
    })
})
