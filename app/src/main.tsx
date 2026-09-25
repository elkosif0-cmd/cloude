import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AppRoot} from './app/AppRoot';
import {logClientError} from './governance/error-log';
import './design/base.css';

window.addEventListener('error',(event)=>{
  logClientError(window.localStorage,event.error??event.message,'window.error');
});
window.addEventListener('unhandledrejection',(event)=>{
  logClientError(window.localStorage,event.reason,'unhandledrejection');
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch((error)=>logClientError(window.localStorage,error,'service-worker'));});
}

const root = document.getElementById('root');
if (!root) throw new Error('S.kosif root element is missing');

createRoot(root).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
