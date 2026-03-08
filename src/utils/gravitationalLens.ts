import { PerspectiveCamera, Vector2, Vector3 } from 'three'

export interface LensViewportSize {
    width: number
    height: number
}

export interface GravitationalLensProjection {
    screenUV: Vector2
    screenRadius: number
    distance: number
    visible: boolean
}

const HIDDEN_SCREEN_UV = new Vector2(0.5, 0.5)

export const projectGravitationalLens = (
    camera: PerspectiveCamera,
    blackHolePosition: Vector3,
    worldRadius: number,
    viewportSize: LensViewportSize
): GravitationalLensProjection => {
    const distance = camera.position.distanceTo(blackHolePosition)
    const width = viewportSize.width
    const height = viewportSize.height

    if (worldRadius <= 0 || width <= 0 || height <= 0) {
        return {
            screenUV: HIDDEN_SCREEN_UV.clone(),
            screenRadius: 0,
            distance,
            visible: false
        }
    }

    const screenPos = blackHolePosition.clone().project(camera)
    const screenUV = new Vector2(
        (screenPos.x + 1) / 2,
        (screenPos.y + 1) / 2
    )

    const visible = (
        screenPos.z >= -1 &&
        screenPos.z <= 1 &&
        screenUV.x >= 0 &&
        screenUV.x <= 1 &&
        screenUV.y >= 0 &&
        screenUV.y <= 1
    )

    if (!visible) {
        return {
            screenUV,
            screenRadius: 0,
            distance,
            visible: false
        }
    }

    const cameraRight = new Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .normalize()
    const radiusWorldPosition = blackHolePosition.clone().add(
        cameraRight.multiplyScalar(worldRadius)
    )
    const radiusScreenPos = radiusWorldPosition.project(camera)
    const radiusUV = new Vector2(
        (radiusScreenPos.x + 1) / 2,
        (radiusScreenPos.y + 1) / 2
    )
    const aspectRatio = width / height
    const screenRadius = Math.min(
        0.3,
        Math.hypot(
            (radiusUV.x - screenUV.x) * aspectRatio,
            radiusUV.y - screenUV.y
        )
    )

    return {
        screenUV,
        screenRadius: Number.isFinite(screenRadius) ? screenRadius : 0,
        distance,
        visible: Number.isFinite(screenRadius) && screenRadius > 0
    }
}
