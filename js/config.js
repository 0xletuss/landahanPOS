// Frontend API Configuration
// This file allows easy switching between local development and production backends

const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // Log for debugging
    console.log(`🔌 Environment Detection:`, {
        hostname,
        port,
        isLocalhost
    });

    // Development: Use local Flask backend on localhost:5000
    if (isLocalhost) {
        console.log('✅ Using LOCAL backend: http://localhost:5000/api');
        return 'http://localhost:5000/api';
    }
    
    // Production: Use Render deployment
    console.log('✅ Using PRODUCTION backend: https://landahan-5.onrender.com/api');
    return 'https://landahan-5.onrender.com/api';
})();

// Make it accessible globally
window.API_BASE_URL = API_BASE_URL;

console.log('🌐 API_BASE_URL is now available globally as window.API_BASE_URL');
