import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove splash loader once React mounts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.remove();
  }, 400); // matches transition speed
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
