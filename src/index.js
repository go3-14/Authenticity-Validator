import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ FIX: Wrap the entire App in BrowserRouter to provide routing context */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

