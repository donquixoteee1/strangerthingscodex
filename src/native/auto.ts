import { mount, unmount } from './entry';
type NativeState={stop:()=>void;status:()=>{active:boolean;reason:string}};
const target=window as Window & {__STRANGER_AUTO__?:NativeState;__GENESIS_DREAM_SKIN__?:unknown;__CODEX_DREAM_SKIN_STATE__?:unknown};
target.__STRANGER_AUTO__?.stop();
let handle:ReturnType<typeof mount>|undefined;
let current:HTMLElement|undefined;let currentEditor:HTMLElement|undefined;
let timer:ReturnType<typeof setTimeout>|undefined;let stopped=false;let reason='waiting-for-new-chat';
let oldPosition='';let positioned=false;
let raised:HTMLElement[]=[];
let styledComposer:HTMLElement|undefined;let composerStyle:string|null=null;let hiddenTitles:HTMLElement[]=[];
const css=document.createElement('style');css.dataset.strangerHostStyle='';
css.textContent='main[data-stranger-active] [data-stranger-front]{z-index:2!important;position:relative;pointer-events:none}main[data-stranger-active] [data-stranger-front] button,main[data-stranger-active] [data-stranger-front] a{pointer-events:auto} main[data-stranger-active]{isolation:isolate;background:#080808!important}main[data-stranger-active] [data-testid="home-icon"]{visibility:hidden}main[data-stranger-active] [data-stranger-heading]{visibility:hidden!important}';document.head.append(css);
function clear(){for(const n of raised)n.removeAttribute("data-stranger-front");raised=[];for(const title of hiddenTitles)title.removeAttribute('data-stranger-heading');hiddenTitles=[];if(styledComposer){if(composerStyle===null)styledComposer.removeAttribute('style');else styledComposer.setAttribute('style',composerStyle);}styledComposer=undefined;handle?.unmount();handle=undefined;current?.removeAttribute('data-stranger-active');if(positioned&&current?.style.position==='relative')current.style.position=oldPosition;positioned=false;current=undefined;currentEditor=undefined;}
function sync(){
 timer=undefined;if(stopped)return;
 if(target.__GENESIS_DREAM_SKIN__||target.__CODEX_DREAM_SKIN_STATE__){clear();reason='another-skin-active';return;}
 const home=document.querySelector('[data-testid="home-icon"]');
 const main=home?.closest<HTMLElement>('main');
 if(!main){clear();reason='waiting-for-new-chat';return;}
 const composers=main.querySelectorAll<HTMLElement>('[class*="_ComposerLayoutRoot_"],.composer-surface-chrome,[data-composer-surface-variant][data-composer-radius-variant]');
 const candidates=Array.from(composers).filter(n=>n.getBoundingClientRect().height>0&&n.querySelector('textarea,[contenteditable="true"]'));
 const composer=candidates[0];const editors=composer?.querySelectorAll<HTMLElement>('textarea,[contenteditable="true"]');
 if(candidates.length!==1||editors?.length!==1){clear();reason='unsupported-or-ambiguous-composer';return;}
 const editor=editors[0];
 if(current===main&&currentEditor===editor&&handle?.diagnostics.mounted)return;
 clear();current=main;currentEditor=editor;oldPosition=main.style.position;
 if(getComputedStyle(main).position==='static'){main.style.position='relative';positioned=true;}
 main.dataset.strangerActive='';
 const matches=Array.from(main.querySelectorAll<HTMLElement>('h1,h2,p,div,span')).filter(n=>!n.contains(composer)&&!composer.contains(n)&&/(?:你|您)想让我们.*构建|what would you like.*build|what should we build/i.test(n.textContent||''));
 hiddenTitles=matches.filter(n=>!matches.some(other=>other!==n&&n.contains(other)));
 for(const title of hiddenTitles)title.dataset.strangerHeading='';
 // Raise the entire ancestor chain: a child z-index cannot escape a parent stacking context.
 for(let n:HTMLElement|null=composer;n&&n!==main;n=n.parentElement){n.dataset.strangerFront='';raised.push(n);}
 styledComposer=composer;composerStyle=composer.getAttribute('style');
 composer.style.pointerEvents='auto';composer.style.position='relative';composer.style.zIndex='2';

 try{handle=mount({container:main,composer,editor});reason='active-read-only';
}catch(e){clear();reason=e instanceof Error?e.message:'mount-failed';}
}
const observer=new MutationObserver(()=>{if(!stopped&&!timer)timer=setTimeout(sync,150);});
observer.observe(document.body,{childList:true,subtree:true});
function stop(){stopped=true;clearTimeout(timer);observer.disconnect();clear();unmount();css.remove();window.removeEventListener('pagehide',stop);document.removeEventListener('stranger-remove-request',stop);if(target.__STRANGER_AUTO__===api)delete target.__STRANGER_AUTO__;}
const api:NativeState={stop,status:()=>({active:!!handle?.diagnostics.mounted,reason})};target.__STRANGER_AUTO__=api;
document.addEventListener('stranger-remove-request',stop);window.addEventListener('pagehide',stop,{once:true});sync();
