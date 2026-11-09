export class SceneLayout {
  private observer: ResizeObserver;
  private abort = new AbortController();
  constructor(private host: HTMLElement, private composer: HTMLElement, private sofa: HTMLElement, private ratio: number) {
    this.observer = new ResizeObserver(() => this.update()); this.observer.observe(host); this.observer.observe(composer);
    window.addEventListener('resize', () => this.update(), { signal: this.abort.signal });
    this.update();
  }
  update() {
    if (!this.composer.isConnected) return;
    const parent=this.host.getBoundingClientRect(), box=this.composer.getBoundingClientRect();
    this.sofa.style.width=`${box.width*this.ratio}px`;
    this.sofa.style.left=`${box.left-parent.left+box.width/2}px`;
    this.sofa.style.top=`${box.top-parent.top+28}px`;
  }
  dispose() { this.observer.disconnect(); this.abort.abort(); }
}
