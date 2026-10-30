import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import { PublicSite } from './PublicSite';
import { AdminApp } from './AdminApp';
import './styles.css';

const rootElement = document.getElementById('root')!;
const isAdmin = rootElement.dataset.app === 'admin';

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <PublicSite />}
  </React.StrictMode>,
);
