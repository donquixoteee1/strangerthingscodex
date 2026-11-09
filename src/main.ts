import './styles/overlay.css';
import './styles/scene.css';
import './styles/lights.css';
import './styles/preview.css';
import { PreviewStyle } from './scene/PreviewStyle';
import { SkinEngine } from './core/SkinEngine';
import { PreviewAdapter } from './adapters/PreviewAdapter';
import type { Layout } from './config';
const editor=document.querySelector<HTMLTextAreaElement>('#message')!;
const host=document.querySelector<HTMLElement>('#stage')!;
const composer=document.querySelector<HTMLFormElement>('#composer')!;
const feedback=document.querySelector<HTMLElement>('#feedback')!;
try {
 const response=await fetch(`${import.meta.env.BASE_URL}scene/scene-layout.json`); if(!response.ok)throw new Error('Scene unavailable');
 const layout: Layout=await response.json();
 const engine=new SkinEngine(host,composer,new PreviewAdapter(editor),layout);
 engine.mount();
 const previewStyle=new PreviewStyle(host);
 const english=document.querySelector<HTMLInputElement>('#english')!;
 english.addEventListener('change',()=>{engine.setEnglish(english.checked);});
 document.querySelector<HTMLInputElement>('#motion')!.addEventListener('change',e=>engine.setMotion((e.target as HTMLInputElement).checked));
 document.querySelector<HTMLInputElement>('#skin')!.addEventListener('change',e=>(e.target as HTMLInputElement).checked?engine.mount():engine.unmount());
 const clear=()=>{editor.value='';editor.dispatchEvent(new Event('input',{bubbles:true}));editor.focus();};
 composer.addEventListener('submit',e=>{e.preventDefault();if(engine.diagnostics.composing)return;if(editor.value.trim()){feedback.textContent='Message submitted locally. Nothing was sent to Codex.';clear();}});
 document.querySelector('#new-chat')?.addEventListener('click',()=>{clear();feedback.textContent='Started a new local preview.';});
 document.querySelector('#attach')!.addEventListener('click',()=>{feedback.textContent='This preview focuses on light input. Attachments are handled by the native Codex app.';});
 Object.assign(window,{stranger:{engine,editor}});
 window.addEventListener('pagehide',()=>{previewStyle.dispose();engine.unmount();});
} catch(error) {feedback.textContent='The skin could not load. You can still use the message box.';console.error(error);}
