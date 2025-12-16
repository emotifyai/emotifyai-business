import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';
import { initializeTheme, setupSystemThemeListener } from '@/utils/theme';

// Initialize theme system
initializeTheme().then(() => {
  setupSystemThemeListener();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
