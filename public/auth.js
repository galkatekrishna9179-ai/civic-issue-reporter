const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showLoginBtn = document.getElementById('show-login');
const showSignupBtn = document.getElementById('show-signup');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Toggle between login and signup forms
showLoginBtn.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  showLoginBtn.classList.add('active');
  showSignupBtn.classList.remove('active');
});

showSignupBtn.addEventListener('click', () => {
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  showSignupBtn.classList.add('active');
  showLoginBtn.classList.remove('active');
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      loginError.textContent = data.error;
      return;
    }

    // Save token and user info, then redirect to main page
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'index.html';

  } catch (err) {
    loginError.textContent = 'Something went wrong. Try again.';
  }
});

// Handle signup form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.textContent = '';

  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      signupError.textContent = data.error;
      return;
    }

    // Signup successful - switch to login tab automatically
    alert('Account created! Please log in.');
    showLoginBtn.click();

  } catch (err) {
    signupError.textContent = 'Something went wrong. Try again.';
  }
});