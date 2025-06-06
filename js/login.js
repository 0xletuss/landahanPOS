// frontend/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch("https://landahan-5.onrender.com/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email,
    password: password
  })
})


  const data = await res.json();
  document.getElementById('message').textContent = data.message;

  if (res.ok) {
    alert('Login successful! Redirecting to homepage...');
    window.location.href = "home.html"; // Replace with actual homepage later
  }
});
