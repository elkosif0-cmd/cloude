import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AppRoot} from './app/AppRoot';
import './design/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('S.kosif root element is missing');

createRoot(root).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
