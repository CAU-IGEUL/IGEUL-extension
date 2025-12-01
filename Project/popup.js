// popup.js
import { apiService } from './src/modules/api.js';

window.apiService = apiService;

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

  // 모든 선택 초기화
  function clearAllSelections() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // 슬라이더 초기화
    document.querySelectorAll('.level-slider').forEach(slider => {
      slider.value = 0;
      updateSliderDots(slider);
    });
  }

  // 슬라이더 dot 업데이트 함수
  function updateSliderDots(slider) {
    const value = parseInt(slider.value);
    const container = slider.closest('.slider-track');
    const dots = container.querySelectorAll('.slider-dot');
    
    dots.forEach((dot, index) => {
      if (index === value) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // 프로필 선택 영역에 저장된 값 표시
  async function displaySavedProfile() {
    clearAllSelections();
    
    const profile = await loadProfile();
    console.log('불러온 프로필:', profile);
    
    if (profile) {
      // 1. 문장 레벨 (0, 1, 2)
      if (profile.sentence !== undefined) {
        const slider = document.querySelector('input[name="sentence-level"]');
        if (slider) {
          slider.value = profile.sentence;
          updateSliderDots(slider);
        }
      }

      // 2. 어휘 수준 (0, 1, 2)
      if (profile.vocabulary !== undefined) {
        const slider = document.querySelector('input[name="vocab-level"]');
        if (slider) {
          slider.value = profile.vocabulary;
          updateSliderDots(slider);
        }
      }

      // 3. 학습 분야
      if (profile.knownTopics && Array.isArray(profile.knownTopics)) {
        profile.knownTopics.forEach(topic => {
          const topicCheckbox = document.querySelector(`input[name="known-topics"][value="${topic}"]`);
          if (topicCheckbox) {
            topicCheckbox.checked = true;
          }
        });
      }
    }
  }

  // 프로필 선택 모드 설정
  function setProfileMode(isInitialSetup) {
    if (isInitialSetup) {
      document.body.classList.add('initial-profile-setup');
    } else {
      document.body.classList.remove('initial-profile-setup');
    }
  }

  // updateUI 함수
  async function updateUI(user) {
    if (user) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      profileBtn.style.display = 'block';
      userInfoDiv.style.display = 'flex';
      statusMessage.textContent = '로그인되었습니다.';

      userPhoto.src = user.photoURL || 'default_profile.png';
      userDisplayName.textContent = user.displayName || '사용자';
      userEmail.textContent = user.email || '';

      const isProfileSaved = await checkProfileSaved();
      
      if (!isProfileSaved) {
        statusMessage.textContent = '프로필 설정 화면을 확인해주세요!';
        statusMessage.style.color = '#4285F4';
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          chrome.tabs.sendMessage(
            tab.id, 
            { 
              action: 'showProfileSetup',
              userData: user
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log('메시지 전송 오류:', chrome.runtime.lastError);
              } else {
                console.log('오버레이 응답:', response);
              }
            }
          );
        }
      } 
      
      profileSelection.style.display = 'none';
      mainButtons.style.display = 'block';
    } else {
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      profileBtn.style.display = 'none';
      userInfoDiv.style.display = 'none';
      profileSelection.style.display = 'none';
      mainButtons.style.display = 'block';
      statusMessage.textContent = '로그인하여 더 많은 기능을 사용하세요.';
      statusMessage.style.color = '';
    }
  }

  // 프로필 저장 버튼 클릭
  // 프로필 저장 버튼 클릭 부분 수정
saveProfileBtn.addEventListener('click', async () => {
  try {
    // 1. 문장 레벨 (0, 1, 2)
    const sentenceSlider = document.querySelector('input[name="sentence-level"]');
    const sentenceLevel = sentenceSlider ? parseInt(sentenceSlider.value) : 0;
    
    // 2. 어휘 수준 (0, 1, 2)
    const vocabSlider = document.querySelector('input[name="vocab-level"]');
    const vocabLevel = vocabSlider ? parseInt(vocabSlider.value) : 0;
    
    // 3. 학습 분야 (선택사항)
    const selectedKnownTopics = Array.from(
      document.querySelectorAll('input[name="known-topics"]:checked')
    ).map(checkbox => checkbox.value);

    // 프로필 객체
    const profile = {
      sentence: sentenceLevel,
      vocabulary: vocabLevel,
      knownTopics: selectedKnownTopics
    };

    // 저장 버튼 비활성화 및 로딩 표시
    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = '저장 중...';

    // API로 프로필 저장
    const result = await apiService.saveProfile(profile);
    
    console.log('프로필 저장 완료:', result);
    
    // 성공 메시지 표시
    statusMessage.textContent = '프로필이 저장되었습니다!';
    statusMessage.style.color = '#34a853';
    
    setProfileMode(false);
    profileSelection.style.display = 'none';
    mainButtons.style.display = 'block';
    
  } catch (error) {
    console.error('프로필 저장 실패:', error);
    
    // 에러 메시지 표시
    statusMessage.textContent = '프로필 저장에 실패했습니다. 다시 시도해주세요.';
    statusMessage.style.color = '#ea4335';
    
  } finally {
    // 버튼 복원
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = '저장';
  }
});

// 프로필 변경 버튼 클릭 부분 수정
profileBtn.addEventListener('click', async () => {
  console.log('프로필 변경 버튼 클릭됨');
  
  setProfileMode(false);
  mainButtons.style.display = 'none';
  profileSelection.style.display = 'block';
  
  // 서버에서 프로필 불러오기
  try {
    statusMessage.textContent = '프로필을 불러오는 중...';
    const result = await apiService.getProfile();
    
    if (result && result.profile) {
      // API에서 받은 프로필을 로컬 형식으로 변환하여 표시
      const localProfile = {
        sentence: result.profile.readingProfile.sentence,
        vocabulary: result.profile.readingProfile.vocabulary,
        knownTopics: result.profile.knownTopics
      };
      
      // 로컬 스토리지에 임시 저장
      await new Promise(resolve => {
        chrome.storage.local.set({ userProfile: localProfile }, resolve);
      });
      
      statusMessage.textContent = '';
    }
  } catch (error) {
    console.error('프로필 불러오기 실패:', error);
    statusMessage.textContent = '프로필을 불러오는데 실패했습니다.';
    statusMessage.style.color = '#ea4335';
  }
  
  setTimeout(async () => {
    await displaySavedProfile();
  }, 50);
});

  // 슬라이더 이벤트 리스너 추가
  document.querySelectorAll('.level-slider').forEach(slider => {
    // 초기 dot 상태 설정
    updateSliderDots(slider);
    
    // 슬라이더 변경 시 dot 업데이트
    slider.addEventListener('input', (e) => {
      updateSliderDots(e.target);
    });
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
      chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, (response) => {
        // Optional: Check response before closing, though closing immediately is fine for this request
        if (chrome.runtime.lastError) {
          console.error("Error sending message to content script:", chrome.runtime.lastError);
        }
        window.close(); // Close the popup window
      });
    } else {
      console.warn("No active tab found to send message to.");
      window.close(); // Close even if no tab found, as there's nothing else to do.
    }
  });
});