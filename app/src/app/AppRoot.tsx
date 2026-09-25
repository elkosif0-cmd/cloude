import {ThemeProvider} from '../design/ThemeProvider';
import {ErrorBoundary} from '../governance/ErrorBoundary';
import {AppShell} from '../shell/AppShell';
import {CommandCenter} from '../domains/home/CommandCenter';

export const APP_NAME = 'S.kosif';

export function AppRoot(){
  return <ErrorBoundary><ThemeProvider><AppShell><CommandCenter/></AppShell></ThemeProvider></ErrorBoundary>;
}
