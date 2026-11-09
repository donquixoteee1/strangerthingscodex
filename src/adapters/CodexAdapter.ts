import type { InputAdapter } from './InputAdapter';
/** Read-only boundary. No guessed selectors, React internals, synthetic writes or injection. */
export class CodexAdapter implements InputAdapter {
  readonly canWrite = false;
  private observers = new Set<() => void>();
  constructor(private resolveComposer: () => HTMLElement | null = () => null) {}
  findComposer() { try { const node = this.resolveComposer(); return node?.isConnected ? node : null; } catch { return null; } }
  readText() { const n = this.findComposer(); return n instanceof HTMLTextAreaElement ? n.value : n?.innerText ?? ''; }
  readSelection() { return null; }
  insertLetter(_letter: string) { return false; }
  observeChanges(callback: () => void) {
    const node = this.findComposer();
    if (!node) return () => {};
    node.addEventListener('input', callback);
    const observer = new MutationObserver(callback);
    observer.observe(node, { subtree: true, characterData: true, childList: true });
    const off = () => { observer.disconnect(); node.removeEventListener('input', callback); this.observers.delete(off); };
    this.observers.add(off); return off;
  }
  dispose() { for (const off of [...this.observers]) off(); }
}
