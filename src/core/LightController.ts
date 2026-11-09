import type { StateStore, LightState } from './StateStore';
export class LightController {
  private abort = new AbortController();
  private opening: string[] = [];
  private ambientLights = new Set<string>();
  constructor(private store: StateStore, private buttons: Map<string, HTMLButtonElement>, insert: (letter: string) => boolean, introduce = true) {
    if (introduce) {
      this.opening = store.lights.map(l => l.letter);
      for (let i = this.opening.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.opening[i], this.opening[j]] = [this.opening[j], this.opening[i]];
      }
    }
    const opts={ signal:this.abort.signal };
    for (const l of store.lights) {
      const b=buttons.get(l.letter)!;
      b.addEventListener('pointerenter',()=>{l.hovered=true;this.paint(l);},opts);
      b.addEventListener('pointerleave',()=>{l.hovered=false;this.paint(l);},opts);
      b.addEventListener('pointerdown',e=>{ e.preventDefault(); },opts);
      b.addEventListener('click',()=>{insert(l.letter);},opts);
      b.addEventListener('animationend',e=>{if(e.animationName==='signal-halo')b.classList.remove('igniting');},opts);
      this.paint(l);
    }
  }
  paint(l: LightState) {
    const b=this.buttons.get(l.letter)!;
    b.classList.toggle('selected',l.selectedCount>0); b.classList.toggle('hovered',l.hovered);
    b.style.setProperty('--ambient',String(l.ambientLevel)); b.dataset.count=String(l.selectedCount);
    b.setAttribute('aria-label',`Insert ${l.letter}; ${l.selectedCount} in message`);
  }
  sync(text: string) { for (const l of this.store.reconcile(text)) this.paint(l); }
  nextDelay() { return this.opening.length ? 180 + Math.random() * 300 : 1600 + Math.random() * 1800; }
  ambient() {
    for (const letter of this.ambientLights) this.buttons.get(letter)?.classList.remove('energized');
    this.ambientLights.clear();
    const next = this.opening.shift();
    if (next) {
      this.buttons.get(next)?.classList.add('igniting');
      return;
    }
    const candidates = this.store.lights.filter(l => !l.selectedCount);
    for (let i = 0; i < Math.min(2, candidates.length); i++) {
      const index = Math.floor(Math.random() * candidates.length);
      const [light] = candidates.splice(index, 1);
      this.buttons.get(light.letter)?.classList.add('energized');
      this.ambientLights.add(light.letter);
    }
  }
  reset() { this.opening = []; this.ambientLights.clear(); for (const b of this.buttons.values()) b.classList.remove('igniting','energized'); for (const l of this.store.lights) { l.hovered=false; if(!l.selectedCount) l.ambientLevel=.12+Math.random()*.15; this.paint(l); } }
  dispose() { this.abort.abort(); }
}
