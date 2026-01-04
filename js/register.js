// frontend/js/register.js - Updated with OTP verification

let verificationToken = null;
let userEmail = null;
let userName = null;

// Step 1: Initial registration form submission
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  message.textContent = '';

  // Store for later use
  userEmail = email;
  userName = name;
  
  // Store password temporarily (in production, consider security implications)
  sessionStorage.setItem('temp_password', password);

  try {
    const res = await fetch("https://landahan-5.onrender.com/api/request-registration-otp", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (res.ok) {
      message.style.color = 'green';
      message.textContent = 'OTP sent to your email! Please check your inbox.';
      
      // Show OTP verification section
      showOTPVerification();
      
    } else {
      message.style.color = 'red';
      message.textContent = data.error || 'Failed to send OTP';
    }

  } catch (err) {
    console.error('OTP request error:', err);
    message.style.color = 'red';
    message.textContent = "Network error. Please try again.";
  }
});

function showOTPVerification() {
  // Hide registration form
  document.getElementById('register').style.display = 'none';
  
  // Show OTP verification section
  const otpSection = document.getElementById('otp-section');
  if (!otpSection) {
    createOTPSection();
  } else {
    otpSection.style.display = 'block';
  }
  
  startCountdown();
}

function createOTPSection() {
  const container = document.querySelector('.form-container') || document.body;
  
  const otpHTML = `
    <div id="otp-section" style="margin-top: 20px;">
      <h3 style="text-align: center; color: #2D2D2D;">Verify Your Email</h3>
      <p style="text-align: center; color: #666; font-size: 14px;">
        We've sent a 6-digit code to <strong>${userEmail}</strong>
      </p>
      
      <form id="otp-form" style="margin-top: 20px;">
        <div class="form-group">
          <label for="otp-input">Enter OTP Code</label>
          <input 
            type="text" 
            id="otp-input" 
            maxlength="6" 
            pattern="[0-9]{6}" 
            placeholder="000000"
            style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: 'Courier New', monospace;"
            required
          >
        </div>
        
        <div id="otp-message" style="margin: 10px 0; text-align: center;"></div>
        
        <button type="submit" class="btn-primary" style="width: 100%;">
          Verify OTP
        </button>
        
        <div style="margin-top: 15px; text-align: center;">
          <p style="color: #666; font-size: 14px;">
            Didn't receive the code? 
            <button type="button" id="resend-otp" class="btn-link" disabled>
              Resend OTP (<span id="countdown">60</span>s)
            </button>
          </p>
          <button type="button" id="back-to-register" class="btn-link" style="margin-top: 10px;">
            ← Back to Registration
          </button>
        </div>
      </form>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', otpHTML);
  
  // Add event listeners
  document.getElementById('otp-form').addEventListener('submit', verifyOTP);
  document.getElementById('resend-otp').addEventListener('click', resendOTP);
  document.getElementById('back-to-register').addEventListener('click', backToRegistration);
}

let countdownInterval = null;

function startCountdown() {
  let seconds = 60;
  const countdownEl = document.getElementById('countdown');
  const resendBtn = document.getElementById('resend-otp');
  
  if (countdownInterval) clearInterval(countdownInterval);
  
  resendBtn.disabled = true;
  
  countdownInterval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    
    if (seconds <= 0) {
      clearInterval(countdownInterval);
      resendBtn.disabled = false;
      resendBtn.innerHTML = 'Resend OTP';
    }
  }, 1000);
}

async function verifyOTP(e) {
  e.preventDefault();
  
  const otpInput = document.getElementById('otp-input').value.trim();
  const message = document.getElementById('otp-message');
  
  message.textContent = '';
  
  if (otpInput.length !== 6) {
    message.style.color = 'red';
    message.textContent = 'Please enter a 6-digit code';
    return;
  }
  
  try {
    const res = await fetch("https://landahan-5.onrender.com/api/verify-registration-otp", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail, 
        otp: otpInput 
      })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      message.style.color = 'green';
      message.textContent = 'OTP verified! Completing registration...';
      
      verificationToken = data.verification_token;
      
      // Complete registration
      await completeRegistration();
      
    } else {
      message.style.color = 'red';
      message.textContent = data.error || 'Invalid OTP';
      document.getElementById('otp-input').value = '';
      document.getElementById('otp-input').focus();
    }
    
  } catch (err) {
    console.error('OTP verification error:', err);
    message.style.color = 'red';
    message.textContent = "Network error. Please try again.";
  }
}

async function completeRegistration() {
  const password = sessionStorage.getItem('temp_password');
  const message = document.getElementById('otp-message');
  
  if (!password || !verificationToken) {
    message.style.color = 'red';
    message.textContent = 'Session expired. Please start again.';
    setTimeout(() => backToRegistration(), 2000);
    return;
  }
  
  try {
    const res = await fetch("https://landahan-5.onrender.com/api/register-with-otp", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail,
        password: password,
        verification_token: verificationToken
      })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // Clear temporary data
      sessionStorage.removeItem('temp_password');
      
      message.style.color = 'green';
      message.textContent = 'Registration successful! Redirecting to login...';
      
      setTimeout(() => {
        window.location.href = "/pages/login.html";
      }, 2000);
      
    } else {
      message.style.color = 'red';
      message.textContent = data.error || 'Registration failed';
    }
    
  } catch (err) {
    console.error('Registration completion error:', err);
    message.style.color = 'red';
    message.textContent = "Network error. Please try again.";
  }
}

async function resendOTP() {
  const message = document.getElementById('otp-message');
  message.textContent = '';
  
  try {
    const res = await fetch("https://landahan-5.onrender.com/api/resend-registration-otp", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      message.style.color = 'green';
      message.textContent = 'New OTP sent to your email!';
      document.getElementById('otp-input').value = '';
      startCountdown();
    } else {
      message.style.color = 'red';
      message.textContent = data.error || 'Failed to resend OTP';
    }
    
  } catch (err) {
    console.error('Resend OTP error:', err);
    message.style.color = 'red';
    message.textContent = "Network error. Please try again.";
  }
}

function backToRegistration() {
  // Clear temporary data
  sessionStorage.removeItem('temp_password');
  verificationToken = null;
  
  // Clear countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  // Hide OTP section
  const otpSection = document.getElementById('otp-section');
  if (otpSection) {
    otpSection.style.display = 'none';
  }
  
  // Show registration form
  document.getElementById('register').style.display = 'block';
  
  // Clear form
  document.getElementById('register').reset();
  document.getElementById('message').textContent = '';
}