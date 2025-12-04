// src/background.js

import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth/web-extension';

// API 주소 설정
const API_BASE_URL = 'https://us-central1-igeul-66a16.cloudfunctions.net';

// Firebase Auth가 초기화되고 사용자의 로그인 상태가 확정될 때 resolve되는 Promise
const authReady = new Promise(resolve => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    // 이 리스너는 계속 유지되어야 하므로 unsubscribe()는 호출하지 않습니다.
    resolve(user);
  });
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    handleGoogleLogin();
    return true; // Indicates an asynchronous response
  } 
  else if (request.action === 'logout') {
    handleGoogleLogout();
    return true; // Indicates an asynchronous response
  } 
  else if (request.action === 'getAuthStatus') {
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
  // 4. 토큰 발급 요청 처리 (수정됨)
  else if (request.action === 'getAuthToken') {
    authReady.then(() => {
      if (auth.currentUser) {
        auth.currentUser.getIdToken() // true 제거
          .then(token => sendResponse({ token: token }))
          .catch(error => sendResponse({ error: error.message }));
      } else {
        sendResponse({ error: 'User not logged in' });
      }
    });
    return true;
  }
  // 5. 프로필 저장 대행
  else if (request.action === 'saveProfileProxy') {
    handleSaveProfile(request.data, sendResponse);
    return true; // 비동기 응답 필수
  }
});

// 프로필 저장 처리 함수
async function handleSaveProfile(profileData, sendResponse) {
  console.log('[(1) 백그라운드] 프로필 저장 요청 시작:', profileData);

  try {
    // 1. 로그인 체크
    if (!auth.currentUser) {
      console.error('[(2) 에러] 로그인되지 않음');
      sendResponse({ status: 'fail', message: '로그인이 필요합니다.' });
      return;
    }

    // 2. 토큰 획득
    console.log('[(3) 진행] 토큰 요청 중...');
    const token = await auth.currentUser.getIdToken();
    
    // 3. 데이터 변환
    const apiData = {
      readingProfile: {
        sentence: Number(profileData.sentence),
        vocabulary: Number(profileData.vocabulary)
      },
      knownTopics: profileData.knownTopics || []
    };

    // 4. 서버 요청
    const requestUrl = `${API_BASE_URL}/createUserProfile`;
    console.log(`[(4) 전송] POST 요청 보냄: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiData)
    });

    console.log(`[(5) 응답] 상태 코드: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`서버 오류 (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('[(6) 성공] 서버 응답:', result);
    
    sendResponse({ status: 'success', data: result });
    
  } catch (error) {
    // [중요] 여기가 잘리면 에러가 납니다!
    console.error('[(7) 최종 에러] handleSaveProfile 실패:', error);
    sendResponse({ status: 'fail', message: error.message });
  }
}

// Handle Google Login using the correct method for extensions
function handleGoogleLogin() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.error('Could not get auth token:', chrome.runtime.lastError?.message);
      return;
    }

    const credential = GoogleAuthProvider.credential(null, token);

    signInWithCredential(auth, credential)
      .then((result) => {
        const user = result.user;
        console.log('Login Successful (via credential):', user.displayName, user.email);

        user.getIdToken().then((idToken) => {

          fetch(`${API_BASE_URL}/getUserProfile`, {
            headers: { 'Authorization': 'Bearer ' + idToken }
          })
          .then(res => res.text())
          .then(data => {

            // 🔥 showResponseInPopup → popup으로 메시지 전달하게 수정
            chrome.runtime.sendMessage({
              action: "showProfile",
              data
            });

          })
          .catch(err => console.error('Error fetching user profile:', err));
        });
      })
      .catch((error) => {
        console.error('Firebase signInWithCredential error:', error);
        // This error can occur if the user revokes permissions from their Google account.
        // The token cached by Chrome becomes invalid. We can try to remove it.
        if (error.code === 'auth/internal-error' && error.message.includes('Unsuccessful check authorization response')) {
            console.log('Removing potentially invalid cached auth token due to auth error.');
            chrome.identity.removeCachedAuthToken({ token: token }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Could not remove cached token:", chrome.runtime.lastError.message);
                } else {
                    console.log("Cached token removed. Please ask the user to try logging in again.");
                }
            });
        }
      });
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