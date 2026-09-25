import {describe,expect,it} from 'vitest';
import {THEMES,themeIds} from './themes';

describe('theme matrix',()=>{
  it('contains five complete themes',()=>{
    expect(themeIds()).toHaveLength(5);
    for(const theme of Object.values(THEMES)){
      expect(theme.typography.ui).toBeTruthy();
      expect(theme.typography.display).toBeTruthy();
      expect(theme.typography.numeric).toBeTruthy();
      expect(theme.color.background).toBeTruthy();
      expect(theme.color.surface).toBeTruthy();
      expect(theme.motion.duration).toBeTruthy();
    }
  });
  it('keeps numeric text separate in notebook mode',()=>{
    expect(THEMES['handwritten-notebook'].typography.numeric).not.toBe(THEMES['handwritten-notebook'].typography.display);
  });
});
