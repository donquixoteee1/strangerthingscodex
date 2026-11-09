import { expect,test,vi,afterEach } from 'vitest';
import { IdleScheduler } from '../src/core/IdleScheduler';
afterEach(()=>vi.useRealTimers());
test('activity replaces idle timer; idle reset happens once; stop releases timers',()=>{vi.useFakeTimers();const reset=vi.fn();const s=new IdleScheduler(()=>{},reset);s.start();s.start();expect(vi.getTimerCount()).toBe(2);vi.advanceTimersByTime(19000);s.activity();vi.advanceTimersByTime(19000);expect(reset).not.toHaveBeenCalled();vi.advanceTimersByTime(1000);expect(reset).toHaveBeenCalledTimes(1);expect(vi.getTimerCount()).toBe(1);s.stop();expect(vi.getTimerCount()).toBe(0);});
