import {describe,expect,it} from 'vitest';
import {createDeviceSession,readDeviceSession,SESSION_TTL_MS} from './session';

describe('device session',()=>{
  it('expires after 24 hours',()=>{
    const start=1_000_000;
    const session=createDeviceSession({userId:'u1',role:'admin'},start);
    expect(readDeviceSession(JSON.stringify(session),start+SESSION_TTL_MS+1)).toBeNull();
  });
  it('does not contain password fields',()=>{
    const raw=JSON.stringify(createDeviceSession({userId:'u1',role:'admin'},1_000_000)).toLowerCase();
    expect(raw.includes('password')).toBe(false);
  });
});
