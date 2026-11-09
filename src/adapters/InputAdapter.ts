export interface Selection { start: number; end: number }
export interface InputAdapter {
  readonly canWrite: boolean;
  findComposer(): HTMLElement | null;
  readText(): string;
  readSelection(): Selection | null;
  insertLetter(letter: string): boolean;
  observeChanges(callback: () => void): () => void;
  dispose(): void;
}
