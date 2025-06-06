// frontend/js/register.js
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  message.textContent = '';

  try {
    const res = await fetch("https://landahan-5.onrender.com/api/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      alert('Registered successfully! Redirecting to login...');
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error('Registration error:', err);
    message.textContent = "Network error. Please try again.";
  }
});
