import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './shared/ui/error/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary title="Aegis Forge Application Engine">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
