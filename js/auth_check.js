// frontend/js/auth_check.js
// 🔐 This file protects your frontend pages by verifying the session with the database.

// This function now runs immediately to protect the page as fast as possible.
(async function protectPage() {
    // Determine the path to the root from the current page.
    const path = window.location.pathname;
    // Goes up one level for each '/' in the path after the initial one.
    const depth = (path.match(/\//g) || []).length - 1;
    const rootPath = depth > 0 ? '../'.repeat(depth) : './';
    const loginPage = `${rootPath}index.html`;

    // We don't need to check on the login page itself.
    if (path.endsWith('/') || path.endsWith('/index.html')) {
        return;
    }

    try {
        const response = await fetch('https://landahan-5.onrender.com/api/verify-session', {
            method: 'GET',
            credentials: 'include' // This is crucial for sending the session cookie
        });
        
        // If the server says the session is not valid (e.g., 401, 404), redirect.
        if (!response.ok) {
            console.error('Session verification failed. Redirecting to login.');
            alert('Your session has expired or is invalid. Please log in again.');
            window.location.href = loginPage;
            return;
        }

        const data = await response.json();
        
        // The /verify-session route returns { "valid": true, ... }
        if (!data.valid) {
            console.error('Session data invalid. Redirecting to login.');
            alert('Your session is invalid. Please log in again.');
            window.location.href = loginPage;
            return;
        }
        
        // If we reach here, the user is authenticated and valid.
        console.log('Session verified for user:', data.user.name);

    } catch (error) {
        console.error('Critical auth check failed:', error);
        alert('Could not verify authentication. Please log in.');
        window.location.href = loginPage;
    }
})();


// You can keep a separate logout function if you call it from a button
async function logout() {
    // Determine the path to the root from the current page.
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    const rootPath = depth > 0 ? '../'.repeat(depth) : './';
    const loginPage = `${rootPath}index.html`;

    try {
        await fetch('https://landahan-5.onrender.com/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout request failed but proceeding with redirect:', error);
    } finally {
        // Always redirect after attempting logout
        alert('You have been logged out.');
        window.location.href = loginPage;
    }
}
