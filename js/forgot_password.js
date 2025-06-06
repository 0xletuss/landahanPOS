import { showLoader, hideLoader } from './loader.js';

let step = 1;

document.getElementById('otpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const otp = document.getElementById('otp').value;
  const newPassword = document.getElementById('new_password').value;
  const message = document.getElementById('message');
  const button = document.getElementById('submitBtn');
  const otpField = document.getElementById('otp');
  const passwordField = document.getElementById('new_password');
  const passwordSection = document.getElementById('passwordSection');

  // Clear previous messages
  message.textContent = '';
  message.className = '';

  // Show loader and disable button
  showLoader('main-container');
  button.disabled = true;

  try {
    if (step === 1) {
      // Step 1: Request OTP
      const res = await fetch('http://127.0.0.1:5000/api/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        step = 2;
        otpField.classList.remove('hidden');
        otpField.required = true;
        button.textContent = 'Verify OTP';
        message.textContent = data.message || 'OTP sent to your email!';
        message.className = 'success';
      } else {
        message.textContent = data.message || 'Failed to send OTP';
        button.textContent = 'Request OTP';
      }

    } else if (step === 2) {
      // Step 2: Validate OTP
      const res = await fetch('http://127.0.0.1:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        step = 3;
        passwordSection.classList.remove('hidden');
        passwordField.disabled = false;
        passwordField.required = true;
        button.textContent = 'Reset Password';
        message.textContent = "OTP verified! Please enter your new password.";
        message.className = 'success';
      } else {
        message.textContent = data.message || "Invalid OTP. Please try again.";
        button.textContent = 'Verify OTP';
      }

    } else if (step === 3) {
      // Step 3: Submit new password
      const res = await fetch('http://127.0.0.1:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        message.textContent = data.message || "Password reset successful!";
        message.className = 'success';
        
        // Redirect after a short delay
        setTimeout(() => {
          alert("Password reset successful. Redirecting to login.");
          window.location.href = "login.html";
        }, 1500);
        
        return; // Don't re-enable button since we're redirecting
      } else {
        message.textContent = data.message || "Failed to reset password";
        button.textContent = 'Reset Password';
      }
    }
  } catch (err) {
    message.textContent = "Network error. Please check your connection and try again.";
    console.error('Error:', err);
    
    // Reset button text based on current step
    if (step === 1) button.textContent = 'Request OTP';
    else if (step === 2) button.textContent = 'Verify OTP';
    else if (step === 3) button.textContent = 'Reset Password';
  } finally {
    // Hide loader and re-enable button
    hideLoader();
    button.disabled = false;
  }
});

// Toggle show/hide password
window.togglePassword = function() {
  const pwdField = document.getElementById('new_password');
  const toggleText = document.querySelector('.toggle-password');
  if (pwdField.type === 'password') {
    pwdField.type = 'text';
    toggleText.textContent = 'Hide';
  } else {
    pwdField.type = 'password';
    toggleText.textContent = 'Show';
  }
}