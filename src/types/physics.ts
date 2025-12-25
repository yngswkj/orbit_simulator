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
