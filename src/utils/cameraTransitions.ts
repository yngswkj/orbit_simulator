import { Vector3, Camera } from 'three';
import gsap from 'gsap';

/**
 * Interface for OrbitControls (subset of properties we need)
 */
interface OrbitControlsLike {
  target: Vector3;
  update: () => void;
}

/**
 * Options for camera transition animations
 */
export interface CameraTransitionOptions {
  /** Duration of the transition in seconds (default: 0.8) */
  duration?: number;
  /** Easing function (default: 'power2.inOut') */
  ease?: string;
  /** Callback function called when transition completes */
  onComplete?: () => void;
  /** Delay before starting the transition in seconds (default: 0) */
  delay?: number;
  /** Optional callback that returns dynamic target position (for tracking moving bodies) */
  dynamicTarget?: () => Vector3;
}

/**
 * Smoothly transition camera position and target using GSAP
 *
 * @param camera - Three.js Camera instance
 * @param controls - OrbitControls instance (must have 'target' property)
 * @param targetPosition - Target position for camera
 * @param targetLookAt - Target position for controls.target (what camera looks at)
 * @param options - Animation options
 * @returns GSAP Timeline for the animation (can be controlled/cancelled)
 *
 * @example
 * ```typescript
 * transitionCamera(
 *   camera,
 *   controls,
 *   new Vector3(100, 50, 100),
 *   new Vector3(0, 0, 0),
 *   { duration: 1.2, ease: 'power3.out' }
 * );
 * ```
 */
export function transitionCamera(
  camera: Camera,
  controls: OrbitControlsLike,
  targetPosition: Vector3,
  targetLookAt: Vector3,
  options: CameraTransitionOptions = {}
): gsap.core.Timeline {
  const {
    duration = 0.8,
    ease = 'power2.inOut',
    onComplete,
    delay = 0,
    dynamicTarget
  } = options;

  // Create intermediate objects to animate (GSAP can't directly animate Vector3)
  const currentPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const currentTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };

  // Create a timeline to synchronize both animations
  const timeline = gsap.timeline({
    delay,
    onComplete
  });

  // Animate camera position
  timeline.to(currentPos, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration,
    ease,
    onUpdate: () => {
      camera.position.set(currentPos.x, currentPos.y, currentPos.z);
    }
  }, 0); // Start at time 0

  // Animate controls target (simultaneously)
  timeline.to(currentTarget, {
    x: targetLookAt.x,
    y: targetLookAt.y,
    z: targetLookAt.z,
    duration,
    ease,
    onUpdate: () => {
      // If dynamicTarget callback is provided, use current body position
      if (dynamicTarget) {
        const currentBodyPos = dynamicTarget();
        controls.target.copy(currentBodyPos);
      } else {
        controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
      }
      controls.update();
    }
  }, 0); // Start at time 0 (parallel animation)

  return timeline;
}

/**
 * Calculate ideal camera position to view a celestial body
 * Places camera at a distance proportional to body radius with good viewing angle
 *
 * @param bodyPosition - Position of the body to view
 * @param bodyRadius - Radius of the body
 * @param distanceMultiplier - How many radii away to place camera (default: 5)
 * @returns Object with camera position and lookAt target
 */
export function calculateBodyViewPosition(
  bodyPosition: Vector3,
  bodyRadius: number,
  distanceMultiplier: number = 5
): { position: Vector3; lookAt: Vector3 } {
  // Default offset direction (diagonal view from above-right-front)
  const offsetDirection = new Vector3(1, 0.8, 1).normalize();
  const distance = Math.max(bodyRadius * distanceMultiplier, 10); // Minimum distance of 10 units

  const position = bodyPosition.clone().add(
    offsetDirection.multiplyScalar(distance)
  );

  return {
    position,
    lookAt: bodyPosition.clone()
  };
}

/**
 * Transition camera to focus on a specific celestial body
 * Automatically calculates optimal viewing position
 *
 * @param camera - Three.js Camera instance
 * @param controls - OrbitControls instance
 * @param bodyPosition - Position of the body
 * @param bodyRadius - Radius of the body
 * @param options - Animation options
 * @returns GSAP Timeline
 */
export function transitionToBody(
  camera: Camera,
  controls: OrbitControlsLike,
  bodyPosition: Vector3,
  bodyRadius: number,
  options: CameraTransitionOptions = {}
): gsap.core.Timeline {
  const { position, lookAt } = calculateBodyViewPosition(bodyPosition, bodyRadius);

  return transitionCamera(camera, controls, position, lookAt, options);
}

/**
 * Transition camera to a preset "home" view
 * Useful for "Reset Camera" functionality
 *
 * @param camera - Three.js Camera instance
 * @param controls - OrbitControls instance
 * @param homePosition - Home camera position (default: diagonal view)
 * @param homeTarget - Home look-at target (default: origin)
 * @param options - Animation options
 * @returns GSAP Timeline
 */
export function transitionToHome(
  camera: Camera,
  controls: OrbitControlsLike,
  homePosition: Vector3 = new Vector3(100, 80, 100),
  homeTarget: Vector3 = new Vector3(0, 0, 0),
  options: CameraTransitionOptions = {}
): gsap.core.Timeline {
  return transitionCamera(camera, controls, homePosition, homeTarget, {
    duration: 1.0,
    ease: 'power3.out',
    ...options
  });
}

/**
 * Smoothly zoom in/out by a factor
 * Maintains current look-at direction
 *
 * @param camera - Three.js Camera instance
 * @param controls - OrbitControls instance
 * @param zoomFactor - Multiplier for distance (< 1 = zoom in, > 1 = zoom out)
 * @param options - Animation options
 * @returns GSAP Timeline
 */
export function transitionZoom(
  camera: Camera,
  controls: OrbitControlsLike,
  zoomFactor: number,
  options: CameraTransitionOptions = {}
): gsap.core.Timeline {
  const currentPos = camera.position.clone();
  const targetPos = controls.target.clone();

  // Calculate direction from target to camera
  const direction = currentPos.clone().sub(targetPos);
  const newDistance = direction.length() * zoomFactor;

  // New camera position maintaining direction
  const newPosition = targetPos.clone().add(
    direction.normalize().multiplyScalar(newDistance)
  );

  return transitionCamera(camera, controls, newPosition, targetPos, {
    duration: 0.6,
    ease: 'power2.out',
    ...options
  });
}
