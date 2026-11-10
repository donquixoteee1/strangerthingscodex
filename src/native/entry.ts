import { SkinEngine } from '../core/SkinEngine';
import { CodexAdapter } from '../adapters/CodexAdapter';
import { PreviewStyle } from '../scene/PreviewStyle';
import layout from '../../public/scene/scene-layout.json';
import sceneCss from '../styles/scene.css?inline';
import lightsCss from '../styles/lights.css?inline';
import previewCss from '../styles/preview.css?inline';

let cleanup: (() => void) | undefined;
/** Experimental host bridge. Targets must be verified by the host integration. Never writes to Codex. */
export function mount({container,composer,editor}: {container: HTMLElement;composer: HTMLElement;editor: HTMLElement}) {
  if(![container,composer,editor].every(n=>n instanceof HTMLElement&&n.isConnected))throw new Error('Connected, verified host targets required');
  if(!container.contains(composer)||!composer.contains(editor))throw new Error('Editor must belong to the supplied composer and container');
  if(getComputedStyle(container).position==='static')throw new Error('Host container must already be positioned; native styles will not be modified');
  if(container.getBoundingClientRect().height<300)throw new Error('Host container has no usable scene area');
  unmount();
  const outer=document.createElement('div');outer.dataset.strangerNative='';outer.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0';
  const shadow=outer.attachShadow({mode:'open'});const host=document.createElement('div');host.style.cssText='position:absolute;inset:0';
  const style=document.createElement('style');style.textContent=sceneCss+lightsCss+previewCss+`.alphabet{top:clamp(100px,15vh,160px);width:min(756px,94%)}.preview-toolbar{pointer-events:auto;top:12px}.light{pointer-events:none}.native-controls{position:absolute;top:65px;left:50%;transform:translateX(-50%);pointer-events:auto;color:#aaa;font:11px monospace}.native-controls button{margin-left:12px;color:inherit;background:#222;border:1px solid #444;border-radius:4px;padding:4px 8px}`;
  host.innerHTML='<div class="preview-toolbar" aria-label="Skin appearance"><label id="detail-label" for="pixel-size">Size</label><input id="pixel-size" type="range" min="2" max="12" value="4"><output id="pixel-value">4 px</output></div><div class="native-controls"><label><input type="checkbox" id="native-motion" checked> Motion</label><button id="native-remove" type="button">Remove skin</button></div>';
  shadow.append(style,host);container.append(outer);
  const engine=new SkinEngine(host,composer,new CodexAdapter(()=>editor),layout);
  let preview:PreviewStyle|undefined;let observer:MutationObserver|undefined;
  const off=()=>{observer?.disconnect();preview?.dispose();engine.unmount();outer.remove();if(cleanup===off)cleanup=undefined;};
  cleanup=off;
  try{
    engine.mount();if(!engine.diagnostics.mounted)throw new Error('Skin mount failed');
    host.querySelector<HTMLElement>('.alphabet')!.inert=true;
    preview=new PreviewStyle(host);
    host.querySelector('#native-motion')!.addEventListener('change',e=>engine.setMotion((e.target as HTMLInputElement).checked));
    host.querySelector('#native-remove')!.addEventListener('click',()=>{outer.dispatchEvent(new CustomEvent('stranger-remove-request',{bubbles:true,composed:true}));off();});
    observer=new MutationObserver(()=>{if(!editor.isConnected||!composer.isConnected||!container.isConnected)off();});
    observer.observe(document.body,{childList:true,subtree:true});
    return {unmount:off,get diagnostics(){return {...engine.diagnostics,readOnly:true};}};
  }catch(error){off();throw error;}
}
export function unmount(){cleanup?.();}
export const compatibility = {status:'experimental-unverified-native', writesToEditor:false, requiresVerifiedTargets:true};
