import { expect, test } from 'vitest';
import { countLetters, StateStore } from '../src/core/StateStore';
test('ASCII-only case-insensitive repeated letters',()=>{const c=countLetters('HeLLo 世界 é K');expect(c.L).toBe(2);expect(c.H).toBe(1);expect(c.K).toBe(0);});
test('remaining duplicate stays on and unchanged state is not painted',()=>{const s=new StateStore([{id:'L',letter:'L',x:0,y:0,color:'red'}]);s.reconcile('LL');expect(s.reconcile('L')[0].selectedCount).toBe(1);expect(s.reconcile('L')).toHaveLength(0);expect(s.reconcile('')[0].selectedCount).toBe(0);});
