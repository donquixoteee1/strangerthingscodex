import type { InputAdapter, Selection } from './InputAdapter';
/** Native Chromium editing transaction preserves undo/redo; no synthetic input writes. */
export class PreviewAdapter implements InputAdapter {
  private cleanups = new Set<() => void>();
  constructor(private editor: HTMLTextAreaElement) {}
  get canWrite() { return this.editor.isConnected && document.queryCommandSupported('insertText'); }
  findComposer() { return this.editor.isConnected ? this.editor : null; }
  readText() { return this.findComposer()?.value ?? ''; }
  readSelection(): Selection | null { return this.findComposer() ? { start: this.editor.selectionStart, end: this.editor.selectionEnd } : null; }
  insertLetter(letter: string) {
    if (!this.canWrite || !/^[A-Z]$/.test(letter)) return false;
    const range = this.readSelection()!;
    this.editor.focus({ preventScroll: true });
    this.editor.setSelectionRange(range.start, range.end);
    return document.execCommand('insertText', false, letter);
  }
  observeChanges(callback: () => void) {
    this.editor.addEventListener('input', callback);
    const off = () => { this.editor.removeEventListener('input', callback); this.cleanups.delete(off); };
    this.cleanups.add(off); return off;
  }
  dispose() { for (const off of [...this.cleanups]) off(); }
}
