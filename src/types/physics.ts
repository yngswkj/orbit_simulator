import { Vector3 } from 'three';

export interface CelestialBody {
  id: string;
  name: string;
  mass: number;
  radius: number;
  position: Vector3;
  velocity: Vector3;
  color: string;
  isFixed?: boolean; // For sun-like objects that shouldn't move
}

export type SimulationState = 'running' | 'paused';
