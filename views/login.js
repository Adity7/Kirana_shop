document.addEventListener('DOMContentLoaded', function () {
  // Get references to form elements for the LOGIN form
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const messageBox = document.getElementById('error');

  
  if (!loginForm || !emailInput || !passwordInput || !messageBox) {
    console.error("One or more login form elements not found. Please check your HTML IDs.");
    return;
  }

  
  const LOGIN_API_URL = '/api/users/login';

  /**
   * Displays a message in the message box.
   * @param {string} message - The message to display.
   * @param {'success' | 'error' | 'info'} type - Type determines styling.
   */
  function showMessage(message, type = 'error') {
    messageBox.textContent = message;

    // Remove previous styles
    messageBox.classList.remove('hidden', 'success', 'error', 'info');
    messageBox.classList.add('block');

    // Apply specific styles based on message type
    messageBox.style.color = '';
    messageBox.style.backgroundColor = '';

    if (type === 'success') {
      messageBox.style.color = 'green';
      messageBox.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    } else if (type === 'error') {
      messageBox.style.color = 'red';
      messageBox.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    } else {
      messageBox.style.color = 'blue';
      messageBox.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
    }
  }

  /**
   * Hides the message box.
   */
  function hideMessage() {
    if (messageBox) {
      messageBox.textContent = '';
      messageBox.classList.add('hidden');
      messageBox.style.color = '';
      messageBox.style.backgroundColor = '';
    }
  }

  // Add event listener for form submission
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    hideMessage(); // Clear previous messages

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validation for login
    if (!email || !password) {
      showMessage('Please enter both email and password.', 'error');
      return;
    }

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Needed if using session cookies
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        showMessage('Something went wrong – check console.', 'error');
        return;
      }

      const data = await response.json();

      if (response.ok && data.redirect) {
        window.location.href = data.redirect;
      } else if (data.message) {
        showMessage(data.message, 'error');
      } else {
        showMessage('Login failed. Please try again.', 'error');
      }

    } catch (error) {
      console.error("Error during login fetch:", error);
      showMessage('An error occurred. Please try again later.', 'error');
    }
  });
});