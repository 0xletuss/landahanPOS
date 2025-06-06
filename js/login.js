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
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      alert('Login successful! Redirecting...');
      window.location.href = "home.html"; // Replace with your real homepage
    }

  } catch (err) {
    console.error("Login error:", err);
    message.textContent = "Network error. Please try again.";
  }
});

