import type { LightSpec } from '../config';
export const countLetters = (text: string): Record<string, number> => {
  const counts = Object.fromEntries(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ', l => [l, 0]));
  for (const char of text) if (/^[a-z]$/i.test(char)) counts[char.toUpperCase()]++;
  return counts;
};
export interface LightState extends LightSpec { selectedCount: number; hovered: boolean; ambientLevel: number }
export class StateStore {
  lights: LightState[];
  constructor(specs: LightSpec[]) { this.lights = specs.map(s => ({ ...s, selectedCount: 0, hovered: false, ambientLevel: .15 })); }
  reconcile(text: string) {
    const counts = countLetters(text);
    return this.lights.filter(l => { if (l.selectedCount === counts[l.letter]) return false; l.selectedCount = counts[l.letter]; return true; });
  }
}
