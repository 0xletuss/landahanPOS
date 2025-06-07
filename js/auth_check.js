// frontend/js/auth_check.js
// 🔐 This file protects your frontend pages

async function checkAuthentication() {
    try {
        const response = await fetch('https://landahan-5.onrender.com/api/auth-status', {
            method: 'GET',
            credentials: 'include'  // Include cookies/sessions
        });
        
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirect to login if not authenticated
            alert('Please log in to access this page');
            window.location.href = '../index.html'; // index.html is your login page

            return false;
        }
        
        // Optional: Display user info
        if (data.user_name) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = data.user_name;
            }
        }
        
        return data;
    } catch (error) {
        console.error('Auth check failed:', error);
        alert('Authentication check failed. Please log in.');
        window.location.href = '../index.html'; // index.html is your login page

        return false;
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('https://landahan-5.onrender.com/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Logged out successfully');
           window.location.href = '../index.html'; // index.html is your login page

        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed');
    }
}

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only check auth if we're not on public pages
    const currentPage = window.location.pathname;
    const publicPages = ['/index.html', '/pages/register.html', '/pages/forgot_password.html'];

    
    const isPublicPage = publicPages.includes(currentPage);

    
    if (!isPublicPage) {
        checkAuthentication();
    }
});
