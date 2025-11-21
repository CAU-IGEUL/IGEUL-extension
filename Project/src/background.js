// src/background.js

import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth/web-extension';

// API 주소 설정
const API_BASE_URL = 'https://us-central1-igeul-66a16.cloudfunctions.net';

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. 로그인 처리
  if (request.action === 'login') {
    handleGoogleLogin();
    return true;
  } 
  // 2. 로그아웃 처리
  else if (request.action === 'logout') {
    handleGoogleLogout();
    return true;
  } 
  // 3. 인증 상태 확인
  else if (request.action === 'getAuthStatus') {
    const currentUser = auth.currentUser;
    sendResponse({
      action: 'authStatus',
      status: currentUser ? 'loggedIn' : 'loggedOut',
      user: currentUser ? {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      } : null
    });
    return true;
  }
  // 4. 토큰 발급 요청 처리
  else if (request.action === 'getAuthToken') {
    if (auth.currentUser) {
      auth.currentUser.getIdToken(true)
        .then(token => sendResponse({ token: token }))
        .catch(error => sendResponse({ error: error.message }));
    } else {
      sendResponse({ error: 'User not logged in' });
    }
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
    
    // 5. 로컬 스토리지 저장
    const profileToSave = (result.profile) ? {
        sentence: result.profile.readingProfile.sentence,
        vocabulary: result.profile.readingProfile.vocabulary,
        knownTopics: result.profile.knownTopics
    } : profileData;

    await chrome.storage.local.set({ userProfile: profileToSave });
    
    sendResponse({ status: 'success', data: result });
    
  } catch (error) {
    // [중요] 여기가 잘리면 에러가 납니다!
    console.error('[(7) 최종 에러] handleSaveProfile 실패:', error);
    sendResponse({ status: 'fail', message: error.message });
  }
}

// 구글 로그인 처리
function handleGoogleLogin() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.error('Could not get auth token:', chrome.runtime.lastError?.message);
      return;
    }

    const credential = GoogleAuthProvider.credential(null, token);

    signInWithCredential(auth, credential)
      .then((result) => {
        console.log('Login Successful:', result.user.email);
      })
      .catch((error) => {
        console.error('Firebase signInWithCredential error:', error);
      });
  });
}

// 구글 로그아웃 처리
function handleGoogleLogout() {
  signOut(auth)
    .then(() => {
      console.log('User signed out successfully.');
    })
    .catch((error) => {
      console.error('Logout Error:', error);
    });
}

// 인증 상태 변경 감지
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
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
    chrome.runtime.sendMessage({
      action: 'authStatus',
      status: 'loggedOut'
    });
  }
});