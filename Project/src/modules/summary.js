// src/modules/summary.js
// 본문 요약 기능 전용 모듈

const API_BASE_URL = 'https://us-central1-igeul-66a16.cloudfunctions.net';

export function initSummary() {
  console.log("✅ initSummary() 실행됨");

  /* ===================================
     모달 열기/닫기 함수
  =================================== */
  function openSummaryModal() {
    const modal = document.getElementById('summary-modal');
    const summaryToggle = document.getElementById('summary-toggle');
    
    if (modal) {
      modal.style.display = 'flex';
      summaryToggle?.classList.add('active');
      
      // API 호출 시작
      fetchSummary();
    }
  }

  function closeSummaryModal() {
    const modal = document.getElementById('summary-modal');
    const summaryToggle = document.getElementById('summary-toggle');
    
    if (modal) {
      modal.style.display = 'none';
      summaryToggle?.classList.remove('active');
    }
  }

  /* ===================================
     상태 표시 함수
  =================================== */
  function showLoading() {
    document.getElementById('summary-loading').style.display = 'flex';
    document.getElementById('summary-content').style.display = 'none';
    document.getElementById('summary-error').style.display = 'none';
  }

  function showSummaryContent(text) {
    document.getElementById('summary-loading').style.display = 'none';
    document.getElementById('summary-content').style.display = 'block';
    document.getElementById('summary-error').style.display = 'none';
    
    const summaryText = document.querySelector('.summary-text');
    if (summaryText) {
      summaryText.textContent = text;
    }
  }

  function showError(message = '요약을 생성하는 중 오류가 발생했습니다.') {
    document.getElementById('summary-loading').style.display = 'none';
    document.getElementById('summary-content').style.display = 'none';
    document.getElementById('summary-error').style.display = 'flex';
    
    const errorText = document.querySelector('.summary-error p');
    if (errorText) {
      errorText.textContent = message;
    }
  }

  /* ===================================
     현재 화면의 본문 가져오기 (DOM에서 직접)
  =================================== */
  function getCurrentPageContent() {
    // 읽기 모드로 렌더링된 본문의 <p> 태그들을 가져옴
    const focusContent = document.querySelector('.focus-content');
    
    if (!focusContent) {
      console.error('본문 컨테이너를 찾을 수 없습니다.');
      return null;
    }

    // 제목 제외, p 태그만 가져오기
    const paragraphs = Array.from(focusContent.querySelectorAll('p'));
    
    if (paragraphs.length === 0) {
      console.error('본문 문단이 없습니다.');
      return null;
    }

    // API 형식에 맞게 변환
    const paragraphsForAPI = paragraphs.map((p, index) => ({
      id: index + 1,
      text: p.textContent.trim()
    })).filter(p => p.text.length > 0); // 빈 문단 제외

    return paragraphsForAPI;
  }

  /* ===================================
     인증 토큰 가져오기
  =================================== */
  async function getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.token) {
          resolve(response.token);
        } else {
          reject(new Error('인증 토큰을 가져올 수 없습니다.'));
        }
      });
    });
  }

  /* ===================================
     API 호출 함수
  =================================== */
  async function fetchSummary() {
    try {
      showLoading();
      
      // 1. 현재 화면의 본문 가져오기 (DOM에서)
      const paragraphsForAPI = getCurrentPageContent();
      
      if (!paragraphsForAPI || paragraphsForAPI.length === 0) {
        showError('요약할 본문이 없습니다. 먼저 본문을 추출해주세요.');
        return;
      }

      console.log('📤 요약 API 요청 데이터:', { paragraphs: paragraphsForAPI });

      // 2. 인증 토큰 가져오기
      const token = await getAuthToken();

      // 3. API 호출
      const response = await fetch(`${API_BASE_URL}/summarizeText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paragraphs: paragraphsForAPI
        })
      });

      console.log('📥 요약 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `요약 생성 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ 요약 결과:', result);

      if (result.status === 'success' && result.summary) {
        showSummaryContent(result.summary);
      } else {
        throw new Error('요약 데이터가 올바르지 않습니다.');
      }
      
    } catch (error) {
      console.error('❌ 요약 생성 오류:', error);
      
      if (error.message.includes('인증')) {
        showError('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      } else if (error.message.includes('본문')) {
        showError('요약할 본문이 없습니다. 먼저 본문을 추출해주세요.');
      } else {
        showError('요약 생성 중 오류가 발생했습니다.');
      }
    }
  }

  /* ===================================
     이벤트 리스너 등록
  =================================== */
  
  // 요약 버튼 클릭
  document.getElementById('summary-toggle')?.addEventListener('click', () => {
    openSummaryModal();
  });

  // 모달 닫기 버튼
  document.getElementById('summary-modal-close')?.addEventListener('click', () => {
    closeSummaryModal();
  });

  // 모달 배경 클릭 시 닫기
  document.querySelector('.summary-modal-backdrop')?.addEventListener('click', () => {
    closeSummaryModal();
  });

  // 재시도 버튼
  document.getElementById('summary-retry-btn')?.addEventListener('click', () => {
    fetchSummary();
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('summary-modal');
      if (modal && modal.style.display === 'flex') {
        closeSummaryModal();
      }
    }
  });
}