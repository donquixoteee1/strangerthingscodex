import type { InputAdapter } from '../adapters/InputAdapter';
import type { Layout } from '../config';
import { StateStore } from './StateStore';
import { InputSync } from './InputSync';
import { LightController } from './LightController';
import { IdleScheduler } from './IdleScheduler';
import { SceneRenderer } from '../scene/SceneRenderer';
import { SceneLayout } from '../scene/SceneLayout';
export class SkinEngine {
  private renderer?: SceneRenderer;
  private layout?: SceneLayout;
  private sync?: InputSync;
  private lights?: LightController;
  private scheduler?: IdleScheduler;
  private abort?: AbortController;
  private media = matchMedia('(prefers-reduced-motion: reduce)');
  private manuallyPaused = false;
  private introduced = false;
  english = false;
  motion = true;
  resets = 0;
  constructor(private host: HTMLElement, private composer: HTMLElement, private adapter: InputAdapter, private scene: Layout) {}
  mount() {
    if(this.renderer) return;
    try {
      this.abort = new AbortController();
      this.renderer=new SceneRenderer(this.scene,this.host);
      this.sync=new InputSync(this.adapter,(text,changed)=>{this.lights?.sync(text);if(changed)this.scheduler?.activity();});
      this.sync.english=this.english;
      this.lights=new LightController(new StateStore(this.scene.lights),this.renderer.buttons,l=>{const ok=this.sync!.insert(l);if(ok)this.scheduler?.activity();return ok;}, !this.introduced);
      this.introduced = true;
      this.scheduler=new IdleScheduler(()=>{this.lights?.ambient();this.renderer?.advanceAlphabet();},()=>{this.resets++;this.lights?.reset();}, undefined, () => this.lights?.nextDelay() ?? 2400);
      this.layout=new SceneLayout(this.host,this.composer,this.renderer.sofa,this.scene.sofaRatio);
      this.sync.start();
      document.addEventListener('visibilitychange',()=>this.refreshMotion(),{signal:this.abort.signal});
      this.media.addEventListener('change',()=>this.refreshMotion(),{signal:this.abort.signal});
      this.setEnglish(this.english); this.refreshMotion();
    } catch(error) {this.unmount();console.error('Skin safely removed',error);}
  }
  setEnglish(value: boolean) {this.english=value;if(this.sync)this.sync.english=value;this.renderer?.root.classList.toggle('read-only',!value||!this.adapter.canWrite); for(const b of this.renderer?.buttons.values()??[])b.setAttribute('aria-disabled',String(!value||!this.adapter.canWrite));this.scheduler?.activity();}
  setMotion(value: boolean) {this.motion=value;this.refreshMotion();}
  private refreshMotion() {
    const paused=this.manuallyPaused||!this.motion||this.media.matches||document.hidden;
    this.renderer?.root.classList.toggle('motion-off',paused);
    if(paused){this.scheduler?.stop();this.lights?.reset();}else this.scheduler?.start();
  }
  pause() {this.manuallyPaused=true;this.refreshMotion();}
  resume() {this.manuallyPaused=false;this.sync?.refresh();this.refreshMotion();}
  unmount() {this.scheduler?.stop();this.sync?.dispose();this.lights?.dispose();this.layout?.dispose();this.abort?.abort();this.renderer?.dispose();this.adapter.dispose();this.renderer=undefined;this.sync=undefined;this.lights=undefined;this.layout=undefined;this.scheduler=undefined;}
  get diagnostics() {return {mounted:!!this.renderer,timers:this.scheduler?.activeTimers??0,resets:this.resets,canWrite:this.adapter.canWrite,composing:this.sync?.composing??false};}
}
