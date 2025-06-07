// frontend/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');
  
  message.textContent = '';
  
  try {
    const res = await fetch("https://landahan-5.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include', // 🔐 CRITICAL: This enables sessions/cookies
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    message.textContent = data.message;
    
    if (res.ok) {
      alert('Login successful! Redirecting...');
      // Redirect to your protected page
      window.location.href = "home.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    message.textContent = "Network error. Please try again.";
  }
});

// Optional: Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch("https://landahan-5.onrender.com/api/auth-status", {
      method: "GET",
      credentials: 'include'
    });
    
    const data = await res.json();
    
    if (data.authenticated) {
      // User is already logged in, redirect to home
  window.location.href = "./pages/home.html";

    }
  } catch (err) {
    console.log("Auth check failed:", err);
    // User is not logged in, stay on login page
  }
});

