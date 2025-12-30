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
  isStar?: boolean; // For star objects (affects rendering glow)
  axialTilt?: number; // In degrees
  rotationSpeed?: number; // Multiplier relative to Earth (1.0)

  // Phase 2: Destruction State
  isBeingDestroyed?: boolean;
  destructionProgress?: number; // 0-1
  destructionStartTime?: number;
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

// 破壊イベント
export interface TidalDisruptionEvent {
  bodyId: string;
  primaryId: string;
  position: { x: number; y: number; z: number };
  startTime: number;
  duration: number;
}

export interface CollisionEvent {
  id: string;
  position: { x: number; y: number; z: number };
  startTime: number;
  color: string;
}
