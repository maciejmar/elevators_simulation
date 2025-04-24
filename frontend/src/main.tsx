import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

console.log('🔥 main.tsx loaded');   // <-- add this

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);