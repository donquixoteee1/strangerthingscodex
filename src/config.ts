export const config = { idleMs: 20_000, ambientMs: 1800, sofaRatio: .7 };
export interface LightSpec { id: string; letter: string; x: number; y: number; color: string }
export interface Layout { width: number; height: number; sofaRatio: number; lights: LightSpec[]; provenance: string; wires?: string[] }
