import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import RebuiltApp from './rebuild/RebuiltApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode><RebuiltApp/></StrictMode>
);
