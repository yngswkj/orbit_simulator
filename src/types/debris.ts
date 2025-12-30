export interface DebrisParticle {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    size: number;
    color: string;
    createdAt: number;
    lifetime: number; // ms
}

export interface DebrisCloud {
    id: string;
    sourceBodyId: string;
    particles: DebrisParticle[];
    createdAt: number;
}
