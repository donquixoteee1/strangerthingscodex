import type { InputAdapter } from '../adapters/InputAdapter';
export class InputSync {
  english = false;
  composing = false;
  private off: () => void = () => {};
  private abort = new AbortController();
  private pending = false;
  private disposed = false;
  private previous: string | undefined;
  constructor(private adapter: InputAdapter, private onText: (text: string, changed: boolean) => void) {}
  start() {
    this.off = this.adapter.observeChanges(() => { if (!this.composing) this.refresh(); });
    const editor = this.adapter.findComposer();
    const opts = { signal: this.abort.signal };
    editor?.addEventListener('compositionstart', () => { this.composing = true; }, opts);
    editor?.addEventListener('compositionupdate', () => { this.composing = true; }, opts);
    editor?.addEventListener('compositionend', () => {
      // Block same-task lamp activation until the browser commits composition input.
      if (this.pending) return;
      this.pending = true;
      queueMicrotask(() => { this.pending = false; if (this.disposed) return; this.composing = false; this.refresh(); });
    }, opts);
    this.refresh();
  }
  refresh() { const text = this.adapter.readText(); const changed = this.previous !== undefined && text !== this.previous; this.previous = text; this.onText(text, changed); }
  insert(letter: string) {
    if (!this.english || this.composing || this.pending || !this.adapter.canWrite) return false;
    const ok = this.adapter.insertLetter(letter);
    if (ok) this.refresh();
    return ok;
  }
  dispose() { this.disposed = true; this.off(); this.abort.abort(); }
}
