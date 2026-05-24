import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import './workspaceSticky.css';
import './commitsLayout.css';
import { startLivePreviewInstaller } from './livePreviewInstaller';

startLivePreviewInstaller();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
