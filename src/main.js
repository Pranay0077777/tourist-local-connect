import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from "./components/theme-provider";
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(ThemeProvider, { defaultTheme: "system", storageKey: "vite-ui-theme", children: _jsx(ErrorBoundary, { children: _jsx(App, {}) }) }) }));
