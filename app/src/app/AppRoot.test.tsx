import {describe, expect, it} from 'vitest';
import {APP_NAME} from './AppRoot';

describe('AppRoot', () => {
  it('exposes the new product identity without legacy naming dependencies', () => {
    expect(APP_NAME).toBe('S.kosif');
  });
});
