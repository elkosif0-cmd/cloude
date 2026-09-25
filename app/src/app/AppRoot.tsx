import {ThemeProvider} from '../design/ThemeProvider';
import {AppShell} from '../shell/AppShell';
import {CommandCenter} from '../domains/home/CommandCenter';

export const APP_NAME = 'S.kosif';

export function AppRoot(){
  return <ThemeProvider><AppShell><CommandCenter/></AppShell></ThemeProvider>;
}
