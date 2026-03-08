import { Vector3 } from 'three'

interface CollisionCameraFrameOptions {
    collisionPoint: Vector3
    currentCameraPosition: Vector3
    impactRadius: number
    focusPosition?: Vector3 | null
}

export const computeCollisionCloseUpFrame = ({
    collisionPoint,
    currentCameraPosition,
    impactRadius,
    focusPosition
}: CollisionCameraFrameOptions) => {
    const lookAt = focusPosition?.clone() ?? collisionPoint.clone()
    const direction = currentCameraPosition.clone().sub(collisionPoint)

    if (direction.lengthSq() <= 0.0001) {
        direction.set(1, 0.55, 1)
    }

    direction.normalize()

    const currentDistance = Math.max(currentCameraPosition.distanceTo(collisionPoint), 0.001)
    const closeUpDistance = Math.min(Math.max(Math.max(impactRadius, 1) * 9.5, 14), 70)
    const distance = Math.max(8, Math.min(currentDistance, closeUpDistance))

    return {
        cameraPosition: collisionPoint.clone().add(direction.multiplyScalar(distance)),
        lookAt,
        distance
    }
}
