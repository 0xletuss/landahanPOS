
// 🔐 Add this to check authentication on protected pages

async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth-status', {
            method: 'GET',
            credentials: 'include'  // Include cookies/sessions
        });
        
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirect to login if not authenticated
            window.location.href = '/pages/login.html';
            return false;
        }
        
        return data;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/pages/login.html';
        return false;
    }
}

// Call this on every protected page
document.addEventListener('DOMContentLoaded', function() {
    // Only check auth if we're not on login/register pages
    const currentPage = window.location.pathname;
    const publicPages = ['/pages/login.html', '/pages/register.html', '/pages/forgot_password.html'];
    
    if (!publicPages.some(page => currentPage.includes(page))) {
        checkAuthentication();
    }
});

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}
