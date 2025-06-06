// frontend/js/register.js
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch("https://landahan-5.onrender.com/api/login", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  document.getElementById('message').textContent = data.message;

  if (res.ok) {
    alert('Registered successfully! Redirecting to login...');
    window.location.href = "login.html";
  }
});
