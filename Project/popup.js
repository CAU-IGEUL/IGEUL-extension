// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const extractBtn = document.getElementById('extract-btn');
  const userInfoDiv = document.getElementById('user-info');
  const userPhoto = document.getElementById('user-photo');
  const userDisplayName = document.getElementById('user-display-name');
  const userEmail = document.getElementById('user-email');
  const statusMessage = document.getElementById('status-message');

  // Function to update UI based on auth status
  function updateUI(user) {
    if (user) {
      // Logged in
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      userInfoDiv.style.display = 'flex'; // Use flex to align items
      statusMessage.textContent = '로그인되었습니다.';

      userPhoto.src = user.photoURL || 'default_profile.png'; // Use a default image if photoURL is null
      userDisplayName.textContent = user.displayName || '사용자';
      userEmail.textContent = user.email || '';
    } else {
      // Logged out
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      userInfoDiv.style.display = 'none';
      statusMessage.textContent = '로그인하여 더 많은 기능을 사용하세요.';
    }
  }

  // Listen for auth status messages from background.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'authStatus') {
      updateUI(request.user);
    }
  });

  // Request initial auth status from background.js when popup opens
  chrome.runtime.sendMessage({ action: 'getAuthStatus' }, (response) => {
    if (response && response.action === 'authStatus') {
      updateUI(response.user);
    }
  });

  // Login button click
  loginBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'login' });
  });

  // Logout button click
  logoutBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'logout' });
  });

  // Extract button click
  extractBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
      window.close();
    }
  });
});