import {expect,test,vi} from 'vitest';
import {IdleScheduler} from '../src/core/IdleScheduler';
test('ten lifecycle cycles leave no timers',()=>{vi.useFakeTimers();const s=new IdleScheduler(()=>{},()=>{});for(let i=0;i<10;i++){s.start();s.stop();expect(vi.getTimerCount()).toBe(0);}vi.useRealTimers();});
