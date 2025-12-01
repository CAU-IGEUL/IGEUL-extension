// src/modules/readingRecommendations.js
import { apiService } from './api.js';

const API_BASE_URL = 'https://us-central1-igeul-66a16.cloudfunctions.net';

/* ===================================
   더 읽을 콘텐츠 추천 초기화
=================================== */
export function initReadingRecommendations() {
  console.log('📚 더 읽을 콘텐츠 추천 기능 초기화');
  
  setupToggleListener();
  
  setTimeout(async () => {
    console.log('📄 추천 콘텐츠 로드 시작');
    await loadRecommendations();
  }, 1000);

}

  /* ===================================
   토글 이벤트 리스너 설정
=================================== */
function setupToggleListener() {
  const toggle = document.getElementById('recommendations-toggle');
  if (toggle) {
    toggle.addEventListener('change', async (e) => {
      const isEnabled = e.target.checked;
      const section = document.getElementById('recommendations-section');
      
      console.log(`Recommendation toggle changed to: ${isEnabled}`);
      
      try {
        // Call the new API to update the setting
        await apiService.updateRecommendationSettings(isEnabled);
        console.log(`Successfully updated recommendation setting to ${isEnabled}`);
      } catch (error) {
        console.error('Failed to update recommendation setting:', error);
        // Revert the toggle on failure to reflect the actual state
        e.target.checked = !isEnabled;
        alert('설정 변경에 실패했습니다. 다시 시도해주세요.');
        return; // Stop further execution
      }

      // Hide or show the section based on the new state
      if (section) {
        section.style.display = isEnabled ? 'block' : 'none';
      }
      
      // If user toggles it on, and there are no recommendations, fetch them.
      if (isEnabled && (!section || section.children.length === 1)) { // children.length === 1 because of h2 title
         await loadRecommendations();
      }
    });
  }
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
   현재 페이지 본문 가져오기
=================================== */
function getCurrentPageContent() {
  const focusContent = document.querySelector('.focus-content');
  if (!focusContent) {
    console.error('본문 영역(.focus-content)을 찾을 수 없습니다.');
    return null;
  }

  const paragraphs = Array.from(focusContent.querySelectorAll('p'));
  
  if (paragraphs.length === 0) {
    console.error('본문 문단이 없습니다.');
    return null;
  }

  return paragraphs.map((p, index) => ({
    id: index + 1,
    text: p.textContent.trim()
  })).filter(p => p.text.length > 0);
}

/* ===================================
   추천 콘텐츠 API 호출
=================================== */
async function fetchRecommendations(paragraphs) {
  try {
    const token = await getAuthToken();

    console.log('📤 추천 콘텐츠 API 요청:', { paragraphs });

    const response = await fetch(`${API_BASE_URL}/getReadingRecommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paragraphs: paragraphs
      })
    });

    console.log('📥 추천 콘텐츠 API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `추천 콘텐츠 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 추천 콘텐츠 결과:', result);

    return result;
  } catch (error) {
    console.error('❌ 추천 콘텐츠 조회 오류:', error);
    throw error;
  }
}

/* ===================================
   추천 콘텐츠 로드 및 표시
=================================== */
async function loadRecommendations() {
  const recommendationsSection = document.getElementById('recommendations-section');
  const toggle = document.getElementById('recommendations-toggle');

  try {
    // Get user profile to check the setting
    const profile = await apiService._getFromLocalStorage();
    const shouldFetch = profile?.getRecommendations !== false;

    // Sync toggle state with profile setting
    if (toggle) {
      toggle.checked = shouldFetch;
    }
    
    // If the setting is false, ensure the section is hidden and stop.
    if (!shouldFetch) {
      console.log('User has disabled reading recommendations.');
      if (recommendationsSection) {
        recommendationsSection.style.display = 'none';
      }
      return;
    }

    // 본문 가져오기
    const paragraphs = getCurrentPageContent();
    
    if (!paragraphs || paragraphs.length === 0) {
      console.log('추천 콘텐츠를 표시할 본문이 없습니다.');
      return;
    }

    // API 호출
    const result = await fetchRecommendations(paragraphs);

    if (result.status === 'success' && result.recommendations && result.recommendations.length > 0) {
      displayRecommendations(result.recommendations);
    } else {
      console.log('추천 콘텐츠가 없습니다.');
      // If no recommendations are returned, hide the section.
      if (recommendationsSection) {
        recommendationsSection.style.display = 'none';
      }
    }
    
  } catch (error) {
    console.error('❌ 추천 콘텐츠 로드 오류:', error);
    // On error, hide the section.
    if (recommendationsSection) {
        recommendationsSection.style.display = 'none';
    }
  }
}

/* ===================================
   추천 콘텐츠 UI 표시
=================================== */
function displayRecommendations(recommendations) {
  // 기존 추천 섹션 제거
  let existingSection = document.getElementById('recommendations-section');
  if (existingSection) {
    existingSection.remove();
  }

  // 본문 컨테이너 찾기
  const focusReader = document.getElementById('focus-reader');
  if (!focusReader) {
    console.error('본문 컨테이너를 찾을 수 없습니다.');
    return;
  }

  // 토글 상태 확인
  const toggle = document.getElementById('recommendations-toggle');
  const isVisible = toggle ? toggle.checked : true;

  // 추천 섹션 생성
  const recommendationsHTML = `
    <div id="recommendations-section" class="recommendations-section" style="display: ${isVisible ? 'block' : 'none'};">
      <h2 class="recommendations-title">더 읽을 콘텐츠</h2>
      <div class="recommendations-grid">
        ${recommendations.map(rec => `
          <a href="${rec.link}" target="_blank" class="recommendation-card">
            ${rec.image ? `<img src="${rec.image}" alt="${rec.title}" class="recommendation-image" onerror="this.style.display='none'">` : ''}
            <div class="recommendation-content">
              <h3 class="recommendation-title">${rec.title}</h3>
              <p class="recommendation-snippet">${rec.snippet}</p>
              <span class="recommendation-link">${new URL(rec.link).hostname}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // 본문 끝에 추가
  focusReader.insertAdjacentHTML('beforeend', recommendationsHTML);
  
  console.log('✅ 추천 콘텐츠 표시 완료:', recommendations.length, '개');
}