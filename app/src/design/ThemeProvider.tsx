import {createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren} from 'react';
import {THEMES} from './themes';
import type {ThemeId} from './theme-contract';

const ThemeContext=createContext<{theme:ThemeId;setTheme:(id:ThemeId)=>void}>({theme:'aghnam-executive-light',setTheme:()=>{}});

export function ThemeProvider({children}:PropsWithChildren){
  const [theme,setTheme]=useState<ThemeId>('aghnam-executive-light');
  useEffect(()=>{
    const t=THEMES[theme];
    const root=document.documentElement;
    root.dataset.theme=theme;
    root.style.setProperty('--bg',t.color.background);
    root.style.setProperty('--surface',t.color.surface);
    root.style.setProperty('--text',t.color.text);
    root.style.setProperty('--muted',t.color.muted);
    root.style.setProperty('--accent',t.color.accent);
    root.style.setProperty('--accent-2',t.color.accent2);
    root.style.setProperty('--font-ui',t.typography.ui);
    root.style.setProperty('--font-display',t.typography.display);
    root.style.setProperty('--font-numeric',t.typography.numeric);
    root.style.setProperty('--radius-card',t.radius.card);
    root.style.setProperty('--radius-control',t.radius.control);
    root.style.setProperty('--shadow-card',t.shadow.card);
    root.style.setProperty('--motion-duration',t.motion.duration);
    root.style.setProperty('--motion-easing',t.motion.easing);
  },[theme]);
  const value=useMemo(()=>({theme,setTheme}),[theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){return useContext(ThemeContext);}
