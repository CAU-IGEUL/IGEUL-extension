// src/background.js

import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth/web-extension';

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    handleGoogleLogin();
    return true; // Indicates an asynchronous response
  } else if (request.action === 'logout') {
    handleGoogleLogout();
    return true; // Indicates an asynchronous response
  } else if (request.action === 'getAuthStatus') {
    // Respond with current auth status
    // onAuthStateChanged already sets the user in 'auth' object
    const currentUser = auth.currentUser; // Get current user from auth instance
    sendResponse({
      action: 'authStatus',
      status: currentUser ? 'loggedIn' : 'loggedOut',
      user: currentUser ? {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      } : null
    });
    return true; // Indicates an asynchronous response
  }
});

// Handle Google Login using the correct method for extensions
function handleGoogleLogin() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.error('Could not get auth token:', chrome.runtime.lastError?.message);
      return;
    }

    // Create a Firebase credential with the Google access token.
    const credential = GoogleAuthProvider.credential(null, token);

    // Sign-in to Firebase with the credential
    signInWithCredential(auth, credential)
      .then((result) => {
        const user = result.user;
        console.log('Login Successful (via credential):', user.displayName, user.email);
        user.getIdToken().then((idToken) => {
          console.log('Firebase ID Token:', idToken);
          fetch('https://us-central1-igeul-66a16.cloudfunctions.net/getUserProfile', {
            headers: {
              'Authorization': 'Bearer ' + idToken
            }
          })
          .then(response => response.text())
          .then(data => {
            showResponseInPopup(data);
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
          });
        });
      })
      .catch((error) => {
        console.error('Firebase signInWithCredential error:', error);
      });
  });
}

function showResponseInPopup(data) {
  chrome.windows.create({
    url: 'data:text/html;charset=utf-8,' + encodeURIComponent(`<html><body><pre>${data}</pre></body></html>`),
    type: 'popup',
    width: 400,
    height: 300
  });
}

// Handle Google Logout
function handleGoogleLogout() {
  signOut(auth)
    .then(() => {
      console.log('User signed out successfully.');
      // No need to send message to popup here, onAuthStateChanged will handle it
    })
    .catch((error) => {
      console.error('Logout Error:', error);
    });
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.displayName, user.email);
    // Send message to popup to update UI
    chrome.runtime.sendMessage({
      action: 'authStatus',
      status: 'loggedIn',
      user: {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }
    });
  } else {
    console.log('User is signed out.');
    // Send message to popup to update UI
    chrome.runtime.sendMessage({
      action: 'authStatus',
      status: 'loggedOut'
    });
  }
});