import { config } from '../config';
/** Exactly one ambient timeout and one inactivity timeout; both cleared on pause. */
export class IdleScheduler {
  private ambient?: ReturnType<typeof setTimeout>;
  private idle?: ReturnType<typeof setTimeout>;
  private running = false;
  constructor(private onAmbient: () => void, private onIdle: () => void, private idleMs = config.idleMs, private nextDelay = () => config.ambientMs + Math.random() * 1800) {}
  start() { if (this.running) return; this.running = true; this.activity(); this.schedule(); }
  activity() { clearTimeout(this.idle); if (this.running) this.idle = setTimeout(() => { this.idle = undefined; this.onIdle(); }, this.idleMs); }
  private schedule() { if (!this.running) return; this.ambient = setTimeout(() => { this.onAmbient(); this.schedule(); }, this.nextDelay()); }
  stop() { this.running = false; clearTimeout(this.ambient); clearTimeout(this.idle); this.ambient = this.idle = undefined; }
  get activeTimers() { return Number(this.ambient !== undefined) + Number(this.idle !== undefined); }
}
