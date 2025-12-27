import { Vector3 } from 'three';

export interface CelestialBody {
  id: string;
  name: string;
  mass: number;
  radius: number;
  position: Vector3;
  velocity: Vector3;
  color: string;
  texturePath?: string;
  isFixed?: boolean; // For sun-like objects that shouldn't move
  axialTilt?: number; // In degrees
  rotationSpeed?: number; // Multiplier relative to Earth (1.0)
}

export type SimulationState = 'running' | 'paused';

export type CameraMode = 'free' | 'sun_lock' | 'surface_lock';

/**
 * Structure of Arrays (SoA) state for optimized physics calculations.
 * x, y, z components are interleaved in the Float64Arrays [x0, y0, z0, x1, y1, z1, ...]
 */
export interface PhysicsState {
  count: number;
  maxCount: number;
  positions: Float64Array;
  velocities: Float64Array;
  accelerations: Float64Array;
  masses: Float64Array;
  radii: Float64Array;
  // Map internal index to entity ID
  ids: string[];
  // Map entity ID to internal index
  idToIndex: Map<string, number>;
}
