import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove splash loader once React mounts with a 4 second delay
const loader = document.getElementById('app-loader');
if (loader) {
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 400); // matches transition speed
  }, 4000); // 4 seconds delay
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
