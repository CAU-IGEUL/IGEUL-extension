// src/modules/profileSettings.js
// 툴바 내 프로필 설정 모달 전용 모듈
import { apiService } from './api.js';

export function initProfileSettings() {
  console.log("initProfileSettings() 실행됨");

  if (!window.apiService) {
    window.apiService = apiService;
  }

  /* ===================================
      모달 열기/닫기 함수
  =================================== */
  function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const profileToggle = document.getElementById('profile-toggle');
    
    if (modal) {
      modal.style.display = 'flex';
      profileToggle?.classList.add('active');
      
      // 모달 열 때 프로필 최신화해서 불러오기
      loadProfile();
    }
  }

  function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    const profileToggle = document.getElementById('profile-toggle');
    
    if (modal) {
      modal.style.display = 'none';
      profileToggle?.classList.remove('active');
    }
  }

  /* ===================================
      상태 표시 함수 (로딩/내용/에러)
  =================================== */
  function showLoading() {
    const loadingEl = document.getElementById('profile-loading');
    const contentEl = document.getElementById('profile-content');
    const errorEl = document.getElementById('profile-error');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showProfileContent() {
    const loadingEl = document.getElementById('profile-loading');
    const contentEl = document.getElementById('profile-content');
    const errorEl = document.getElementById('profile-error');

    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showError() {
    const loadingEl = document.getElementById('profile-loading');
    const contentEl = document.getElementById('profile-content');
    const errorEl = document.getElementById('profile-error');

    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
  }

  /* ===================================
      슬라이더 UI 업데이트 함수
  =================================== */
  function updateSliderDots(slider) {
    const value = parseInt(slider.value);
    const container = slider.closest('.profile-slider-track');
    // .slider-dot 대신 .profile-slider-dot 클래스를 사용한다고 가정 (HTML에 맞게 조정)
    const dots = container ? container.querySelectorAll('.profile-slider-dot') : [];
    
    dots.forEach((dot, index) => {
      if (index === value) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /* ===================================
      [중요] 프로필 데이터 화면에 뿌리기
  =================================== */
  function displayProfile(profile) {
    console.log('화면에 프로필 표시:', profile);
    
    // 1. 문장 레벨 설정
    const sentenceSlider = document.querySelector('#profile-modal input[name="sentence-level"]');
    if (sentenceSlider && profile.sentence !== undefined) {
      sentenceSlider.value = profile.sentence;
      updateSliderDots(sentenceSlider);
    }
    
    // 2. 어휘 레벨 설정
    const vocabSlider = document.querySelector('#profile-modal input[name="vocab-level"]');
    if (vocabSlider && profile.vocabulary !== undefined) {
      vocabSlider.value = profile.vocabulary;
      updateSliderDots(vocabSlider);
    }
    
    // 3. 체크박스 초기화 (모두 해제했다가 다시 체크)
    document.querySelectorAll('#profile-modal input[name="known-topics"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // 4. 저장된 학습 분야 체크하기
    if (profile.knownTopics && Array.isArray(profile.knownTopics)) {
      profile.knownTopics.forEach(topic => {
        // value가 일치하는 체크박스 찾기
        const checkbox = document.querySelector(`#profile-modal input[name="known-topics"][value="${topic}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
  }

  /* ===================================
      [중요] 프로필 불러오기 (popup.js 로직 반영)
  =================================== */
  async function loadProfile() {
    try {
      showLoading();
      
      if (!window.apiService) {
        throw new Error("ApiService가 없습니다.");
      }

      // 1. 서버에서 최신 데이터 가져오기 시도
      // api.js의 getProfile은 성공 시 자동으로 로컬 스토리지(chrome.storage.local)를 업데이트합니다.
      await window.apiService.getProfile().catch(e => {
          console.warn('서버 연결 실패, 로컬 데이터만 사용합니다.', e);
      });

      // 2. 로컬 스토리지에서 데이터 읽어오기 (이것이 가장 최신 상태임)
      const localProfile = await window.apiService._getFromLocalStorage();
      
      if (localProfile) {
        displayProfile(localProfile);
        showProfileContent();
      } else {
        // 저장된 게 없으면 기본값(0, 0, 빈 배열) 표시
        displayProfile({ sentence: 0, vocabulary: 0, knownTopics: [] });
        showProfileContent();
      }

    } catch (error) {
      console.error('프로필 불러오기 오류:', error);
      showError();
    }
  }

  /* ===================================
      [핵심] 프로필 저장하기 (popup.js와 동일 로직)
  =================================== */
  async function saveProfile() {
    const saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';
    }

    try {
      // 1. 슬라이더 값 가져오기
      const sentenceSlider = document.querySelector('#profile-modal input[name="sentence-level"]');
      const sentenceLevel = sentenceSlider ? parseInt(sentenceSlider.value) : 0;

      const vocabSlider = document.querySelector('#profile-modal input[name="vocab-level"]');
      const vocabLevel = vocabSlider ? parseInt(vocabSlider.value) : 0;

      // 2. 체크박스 값 가져오기 (배열로 변환)
      const selectedKnownTopics = [];
      document.querySelectorAll('#profile-modal input[name="known-topics"]:checked').forEach(checkbox => {
        selectedKnownTopics.push(checkbox.value);
      });

      // 3. 전송할 객체 만들기 (popup.js와 똑같은 모양)
      const profileData = {
        sentence: sentenceLevel,
        vocabulary: vocabLevel,
        knownTopics: selectedKnownTopics
      };

      console.log('저장할 프로필 데이터:', profileData);

      // 4. API로 전송 (api.js 사용)
      if (window.apiService) {
        await window.apiService.saveProfile(profileData);
        alert('프로필이 성공적으로 수정되었습니다!');
        closeProfileModal();
      } else {
        throw new Error('ApiService 연결 실패');
      }

    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('저장하지 못했습니다. 다시 시도해주세요.');
    } finally {
        // 버튼 상태 원상복구
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '저장';
        }
    }
  }

  /* ===================================
      이벤트 리스너 등록
  =================================== */
  
  // 1. 프로필 아이콘 클릭 (열기)
  document.getElementById('profile-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    openProfileModal();
  });

  // 2. 닫기 버튼 (X)
  document.getElementById('profile-modal-close')?.addEventListener('click', () => {
    closeProfileModal();
  });

  // 3. 배경 클릭 시 닫기
  document.querySelector('.profile-modal-backdrop')?.addEventListener('click', () => {
    closeProfileModal();
  });

  // 4. [중요] 저장 버튼 클릭
  document.getElementById('profile-save-btn')?.addEventListener('click', () => {
    saveProfile();
  });

  // 5. 슬라이더 움직일 때 점(dot) 색칠하기
  document.querySelectorAll('#profile-modal .profile-level-slider').forEach(slider => {
    // 처음 로딩 시 상태 업데이트
    updateSliderDots(slider);
    
    // 움직일 때마다 업데이트
    slider.addEventListener('input', (e) => {
      updateSliderDots(e.target);
    });
  });

  // 6. ESC 키 누르면 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('profile-modal');
      if (modal && modal.style.display === 'flex') {
        closeProfileModal();
      }
    }
  });
}