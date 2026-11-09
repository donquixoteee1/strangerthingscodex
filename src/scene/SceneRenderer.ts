import { sceneAsset } from './assets';
import type { Layout } from '../config';
export class SceneRenderer {
  root = document.createElement('div');
  buttons = new Map<string, HTMLButtonElement>();
  sofa = document.createElement('img');
  private alphabetArt = document.createElement('img');
  private frame = 0;
  private lastFrame = performance.now();
  private frames = [sceneAsset('alphabet.svg'),sceneAsset('alphabet-1.svg'),sceneAsset('alphabet-2.svg')];
  private cachedFrames: HTMLImageElement[] = [];
  constructor(layout: Layout, host: HTMLElement) {
    this.root.className = 'stranger-scene'; this.root.dataset.skin = 'stranger';
    const wall = document.createElement('img'); wall.src = sceneAsset('wall.svg'); wall.className = 'ascii-wall'; wall.alt = ''; wall.setAttribute('aria-hidden','true');
    const alphabet = document.createElement('div'); alphabet.className = 'alphabet'; alphabet.style.aspectRatio = `${layout.width}/${layout.height}`;
    const art = this.alphabetArt; art.className='alphabet-art'; art.dataset.frame='0'; art.src = this.frames[0];
    this.cachedFrames = this.frames.map(src => { const image = new Image(); image.src = src; return image; }); art.alt = ''; art.setAttribute('aria-hidden','true'); alphabet.append(art);
    const ns = 'http://www.w3.org/2000/svg'; const wire = document.createElementNS(ns,'svg'); wire.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`); wire.classList.add('wires'); wire.setAttribute('aria-hidden','true');
    for (const d of layout.wires ?? []) {
      const path = document.createElementNS(ns,'path');
      path.setAttribute('d',d); wire.append(path);
    }
    alphabet.append(wire);
    for (const light of layout.lights) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'light'; b.dataset.letter = light.letter;
      b.style.width = `${44/layout.width*100}%`; b.style.height = `${64/layout.height*100}%`; b.style.left = `${light.x/layout.width*100}%`; b.style.top = `${light.y/layout.height*100}%`; b.style.setProperty('--light',light.color);
      b.setAttribute('aria-label',`Insert ${light.letter}`); b.innerHTML = '<span class="bulb" aria-hidden="true"> :|: \n .#. \n:+@+:\n :#: \n  .  </span><span class="ascii-halo" aria-hidden="true">      .      \n  .   :   .  \n    : + :    \n . + :*: + . \n.:+*     *+:.\n . + :*: + . \n    : + :    \n  .   :   .  \n      .      </span><span class="letter-label" aria-hidden="true">'+light.letter+'</span>';
      alphabet.append(b); this.buttons.set(light.letter,b);
    }
    this.sofa.src=sceneAsset('sofa.svg'); this.sofa.className='ascii-sofa'; this.sofa.alt='ASCII vintage sofa with cushions and a knitted throw';
    this.root.append(wall,alphabet,this.sofa); host.prepend(this.root);
  }
  advanceAlphabet() {
    if (performance.now() - this.lastFrame < 1800) return;
    const next = (this.frame + 1) % this.frames.length;
    if (!this.cachedFrames[next]?.complete || !this.cachedFrames[next].naturalWidth) return;
    this.frame = next;
    this.alphabetArt.src = this.frames[next];
    this.alphabetArt.dataset.frame = String(next);
    this.lastFrame = performance.now();
  }
  dispose() { this.cachedFrames = []; this.root.remove(); this.buttons.clear(); }
}
