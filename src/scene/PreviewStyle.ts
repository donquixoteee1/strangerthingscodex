import { sceneAsset } from './assets';
type Pair = {overlay: HTMLImageElement; source: HTMLImageElement; pixels?: ImageData; phase: number};
/** Rebuild only on controls, source load, or the existing sparse animation tick. */
export class PreviewStyle {
  private density = 7;
  private abort = new AbortController();
  private observer: MutationObserver;
  private pairs = new Map<HTMLImageElement, Pair>();
  constructor(private host: HTMLElement) {
    const signal = this.abort.signal;
    this.host.querySelector<HTMLInputElement>('#pixel-size')!.addEventListener('input', event => {
      const value=Number((event.target as HTMLInputElement).value);
      this.density=value;
      this.update();this.render();
    }, {signal});
    this.observer = new MutationObserver(() => this.connect());
    this.observer.observe(host, {childList:true, subtree:true, attributes:true, attributeFilter:['style','data-frame']});
    this.connect(); this.update();
  }
  private render(){for(const pair of this.pairs.values())this.sample(pair);}
  private connect() {
    for (const [original,pair] of this.pairs) {
      if (!original.isConnected) { pair.overlay.remove(); this.pairs.delete(original); }
      else {
        if(pair.overlay.style.cssText !== original.style.cssText) pair.overlay.style.cssText = original.style.cssText;
        const phase=Number(original.dataset.frame??0);
        if(phase!==pair.phase){pair.phase=phase;this.sample(pair);}
      }
    }
    const names = {'alphabet-art':'alphabet', 'ascii-sofa':'sofa', 'ascii-title':'title'};
    for (const [className,name] of Object.entries(names)) {
      this.host.querySelectorAll<HTMLImageElement>(`img.${className}:not(.pixel-art)`).forEach(original => {
        if (this.pairs.has(original)) return;
        const overlay = original.cloneNode(false) as HTMLImageElement;
        overlay.removeAttribute('src'); overlay.removeAttribute('data-frame');overlay.classList.add('pixel-art'); overlay.alt=''; overlay.setAttribute('aria-hidden','true');
        const source = new Image(); const pair:Pair = {overlay,source,phase:0}; this.pairs.set(original,pair);
        source.onload = () => {
          if(!overlay.isConnected)return;
          const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
          const ctx=canvas.getContext('2d')!;ctx.drawImage(source,0,0);pair.pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
          this.sample(pair);
        }; source.src=sceneAsset(`pixel-${name}.png`);
        original.after(overlay);
      });
    }
  }
  private sample({overlay,pixels,phase}: Pair) {
    if(!pixels)return;
    const {width,height,data}=pixels;
      const step=13-this.density;
      const rows:string[]=[];
      for(let y=0;y<height;y+=step){
        const groups=new Map<string,{xs:number[];chars:string[]}>();
        for(let x=0;x<width;x+=step){
          const i=(y*width+x)*4;if(data[i+3]<128)continue;
          const light=(data[i]+data[i+1]+data[i+2])/3;
          const color=overlay.classList.contains('ascii-sofa')?(light>140?'#c4a17a':light>80?'#a47b56':'#78543b'):overlay.classList.contains('ascii-title')?'#d4d2cb':'#d8bc99';
          const group=groups.get(color)??{xs:[],chars:[]};
          group.xs.push(x);group.chars.push(overlay.classList.contains('alphabet-art')&&((x+y)%3===0)?['*','+','/'][phase%3]:'.:+*'[Math.min(3,Math.floor(light/64))]);groups.set(color,group);
        }
        for(const [color,g] of groups)rows.push(`<text x="${g.xs.join(' ')}" y="${y}" fill="${color}">${g.chars.join('')}</text>`);
      }
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g font-family="monospace" font-size="${step*.95}" style="white-space:pre;font-variant-ligatures:none">${rows.join('')}</g></svg>`;
      overlay.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  private update() {
    this.host.dataset.preview='ascii';
    const root=this.host.getRootNode();
    const stage=this.host.closest<HTMLElement>('#stage') ?? (root instanceof ShadowRoot ? root.host.parentElement : null);
    if(stage instanceof HTMLElement) stage.dataset.strangerTheme='black';
    const slider=this.host.querySelector<HTMLInputElement>('#pixel-size')!;
    slider.min='1';slider.max='10';slider.value=String(this.density);
    this.host.querySelector('#detail-label')!.textContent='Size';
    this.host.querySelector<HTMLOutputElement>('#pixel-value')!.value=`${this.density}/10`;

  }
  dispose() { this.abort.abort();this.observer.disconnect();for(const pair of this.pairs.values())pair.overlay.remove();this.pairs.clear(); }
}
