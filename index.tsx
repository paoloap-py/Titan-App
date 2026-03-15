import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Dashboard from './Dashboard';

console.log("TITAN 133: System Initializing...");

const Router: React.FC = () => {
  const [isDashboard, setIsDashboard] = useState(window.location.hash === '#dashboard');

  useEffect(() => {
    const handleHash = () => setIsDashboard(window.location.hash === '#dashboard');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (isDashboard) {
    // Remove mobile-specific styles for desktop dashboard
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    return <Dashboard />;
  }

  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
