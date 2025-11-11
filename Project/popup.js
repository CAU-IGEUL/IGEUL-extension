// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const extractBtn = document.getElementById('extract-btn');
  const profileBtn = document.getElementById('profile-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  
  const userInfoDiv = document.getElementById('user-info');
  const userPhoto = document.getElementById('user-photo');
  const userDisplayName = document.getElementById('user-display-name');
  const userEmail = document.getElementById('user-email');
  const statusMessage = document.getElementById('status-message');
  
  const profileSelection = document.getElementById('profile-selection');
  const mainButtons = document.getElementById('main-buttons');

  // 프로필 저장 여부 확인 함수
  async function checkProfileSaved() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        resolve(!!result.userProfile);
      });
    });
  }

  // 프로필 불러오기 함수
  async function loadProfile() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        resolve(result.userProfile || null);
      });
    });
  }

  // 프로필 선택 영역에 저장된 값 표시
  async function displaySavedProfile() {
    const profile = await loadProfile();
    if (profile) {
      // 읽기 특성 선택
      if (profile.readingProfile && Array.isArray(profile.readingProfile)) {
        profile.readingProfile.forEach(value => {
          const checkbox = document.querySelector(`input[name="reading-profile"][value="${value}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }

      // 학습 분야 선택
      if (profile.knownTopics && Array.isArray(profile.knownTopics)) {
        profile.knownTopics.forEach(topic => {
          const topicCheckbox = document.querySelector(`input[name="known-topics"][value="${topic}"]`);
          if (topicCheckbox) topicCheckbox.checked = true;
        });
      }
    }
  }

  // 프로필 선택 모드 설정 (처음 설정인지, 변경인지)
  function setProfileMode(isInitialSetup) {
    if (isInitialSetup) {
      // 처음 설정: 전체 화면 중앙 모드
      document.body.classList.add('initial-profile-setup');
    } else {
      // 변경: 일반 팝업 모드
      document.body.classList.remove('initial-profile-setup');
    }
  }

  // updateUI 함수에서 프로필이 없을 때 부분만 수정
  async function updateUI(user) {
    if (user) {
      // 로그인 상태
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      profileBtn.style.display = 'block';
      userInfoDiv.style.display = 'flex';
      statusMessage.textContent = '로그인되었습니다.';

      userPhoto.src = user.photoURL || 'default_profile.png';
      userDisplayName.textContent = user.displayName || '사용자';
      userEmail.textContent = user.email || '';

      // 프로필 저장 여부 확인
      const isProfileSaved = await checkProfileSaved();
      
      if (!isProfileSaved) {
        // 프로필이 저장되지 않았으면 현재 탭에 오버레이 표시
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'showProfileSetup',
            userData: user
          });
        }
      } else {
        // 프로필이 이미 저장되어 있으면 메인 화면 표시
        profileSelection.style.display = 'none';
        mainButtons.style.display = 'block';
      }
    } else {
      // 로그아웃 상태
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      profileBtn.style.display = 'none';
      userInfoDiv.style.display = 'none';
      profileSelection.style.display = 'none';
      mainButtons.style.display = 'block';
      statusMessage.textContent = '로그인하여 더 많은 기능을 사용하세요.';
    }
  }

  // 프로필 저장 버튼 클릭
  saveProfileBtn.addEventListener('click', async () => {
    // 선택된 읽기 특성
    const selectedReadingProfile = Array.from(
      document.querySelectorAll('input[name="reading-profile"]:checked')
    ).map(checkbox => checkbox.value);
    
    // 선택된 학습 분야
    const selectedKnownTopics = Array.from(
      document.querySelectorAll('input[name="known-topics"]:checked')
    ).map(checkbox => checkbox.value);

    // 프로필 저장
    const profile = {
      readingProfile: selectedReadingProfile,
      knownTopics: selectedKnownTopics
    };

    chrome.storage.local.set({ userProfile: profile }, () => {
      console.log('프로필 저장 완료:', profile);
      
      // 일반 모드로 전환
      setProfileMode(false);
      
      // 프로필 선택 화면 숨기고 메인 화면 표시
      profileSelection.style.display = 'none';
      mainButtons.style.display = 'block';
    });
  });

  // 프로필 변경 버튼 클릭
  profileBtn.addEventListener('click', async () => {
    // 저장된 프로필 불러와서 표시
    await displaySavedProfile();
    
    // 일반 팝업 모드 유지
    setProfileMode(false);
    
    // 메인 화면 숨기고 프로필 선택 화면 표시
    mainButtons.style.display = 'none';
    profileSelection.style.display = 'block';
  });

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
    }
  });
});