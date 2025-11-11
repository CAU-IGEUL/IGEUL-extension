// 프로필 설정 오버레이 표시 함수
function showProfileSetupOverlay(userData) {
  // 이미 오버레이가 있으면 제거
  const existingOverlay = document.getElementById('cau-igeul-profile-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 오버레이 컨테이너 생성
  const overlay = document.createElement('div');
  overlay.id = 'cau-igeul-profile-overlay';
  overlay.innerHTML = `
    <div class="cau-igeul-overlay-backdrop"></div>
    <div class="cau-igeul-overlay-content">
      <div class="cau-igeul-setup-container">
        <h1>CAU IGEUL</h1>
        
        <!-- 사용자 정보 -->
        <div class="cau-igeul-user-info">
          <img src="${userData.photoURL || ''}" alt="User Photo" class="cau-igeul-user-photo">
          <div class="cau-igeul-user-details">
            <span class="cau-igeul-user-name">${userData.displayName || '사용자'}</span>
            <span class="cau-igeul-user-email">${userData.email || ''}</span>
          </div>
        </div>

        <h2>프로필 설정</h2>
        <p>학습을 시작하기 전에 프로필을 설정해주세요.</p>
        
        <!-- 읽기 특성 선택 -->
        <div class="cau-igeul-profile-section">
          <label class="cau-igeul-section-title">해당하는 읽기 특성을 선택해주세요.</label>
          <div class="cau-igeul-checkbox-group">
            <label class="cau-igeul-checkbox-label">
              <input type="checkbox" value="문장">
              <span>긴 문장을 이해하기 어려워합니다.</span>
            </label>
            <label class="cau-igeul-checkbox-label">
              <input type="checkbox" value="어휘">
              <span>어휘력이 다소 부족한 편입니다.</span>
            </label>
          </div>
        </div>

        <!-- 학습 분야 선택 -->
        <div class="cau-igeul-profile-section">
          <label class="cau-igeul-section-title">추가로 학습이 필요하다고 느끼는 분야를 선택해주세요.</label>
          <div class="cau-igeul-tag-group">
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="정치">
              <span>정치</span>
            </label>
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="경제">
              <span>경제</span>
            </label>
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="사회">
              <span>사회</span>
            </label>
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="생활/문화">
              <span>생활/문화</span>
            </label>
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="IT">
              <span>IT</span>
            </label>
            <label class="cau-igeul-tag-label">
              <input type="checkbox" value="과학">
              <span>과학</span>
            </label>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <button id="cau-igeul-save-profile" class="cau-igeul-btn cau-igeul-save-btn">💾 저장하기</button>
      </div>
    </div>
  `;

  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    #cau-igeul-profile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .cau-igeul-overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
    }

    .cau-igeul-overlay-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-height: 90vh;
      overflow-y: auto;
      z-index: 1000000;
    }

    .cau-igeul-setup-container {
      background-color: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90vw;
      text-align: center;
      animation: cau-igeul-slideIn 0.3s ease-out;
    }

    @keyframes cau-igeul-slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cau-igeul-setup-container h1 {
      font-size: 32px;
      margin: 0 0 20px 0;
      color: #333;
      font-weight: 700;
    }

    .cau-igeul-setup-container h2 {
      font-size: 24px;
      margin: 20px 0 10px 0;
      color: #333;
    }

    .cau-igeul-setup-container p {
      font-size: 14px;
      color: #666;
      margin: 0 0 30px 0;
    }

    .cau-igeul-user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      padding: 16px;
      background-color: #e8f0fe;
      border-radius: 12px;
    }

    .cau-igeul-user-photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 15px;
      border: 3px solid #4285F4;
    }

    .cau-igeul-user-details {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .cau-igeul-user-name {
      font-weight: bold;
      color: #333;
      font-size: 16px;
    }

    .cau-igeul-user-email {
      font-size: 13px;
      color: #666;
    }

    .cau-igeul-profile-section {
      margin-bottom: 30px;
      text-align: left;
    }

    .cau-igeul-section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      display: block;
    }

    .cau-igeul-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cau-igeul-checkbox-label {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      background-color: #f0f0f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 15px;
    }

    .cau-igeul-checkbox-label input[type="checkbox"] {
      margin-right: 12px;
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .cau-igeul-checkbox-label:hover {
      background-color: #e0e0e0;
    }

    .cau-igeul-checkbox-label:has(input[type="checkbox"]:checked) {
      background-color: #e8f0fe;
      border: 2px solid #4285F4;
    }

    .cau-igeul-checkbox-label input[type="checkbox"]:checked + span {
      font-weight: 600;
      color: #4285F4;
    }

    .cau-igeul-tag-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .cau-igeul-tag-label {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      background-color: #f0f0f0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .cau-igeul-tag-label input[type="checkbox"] {
      display: none;
    }

    .cau-igeul-tag-label:hover {
      background-color: #e0e0e0;
      transform: translateY(-2px);
    }

    .cau-igeul-tag-label input[type="checkbox"]:checked + span {
      font-weight: 600;
      color: white;
    }

    .cau-igeul-tag-label:has(input[type="checkbox"]:checked) {
      background-color: #4285F4;
      color: white;
    }

    .cau-igeul-btn {
      padding: 16px 32px;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      margin-top: 20px;
    }

    .cau-igeul-save-btn {
      background-color: #4285F4;
      color: white;
    }

    .cau-igeul-save-btn:hover {
      background-color: #357ae8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
    }
  `;

  // DOM에 추가
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // 저장 버튼 이벤트
  const saveBtn = document.getElementById('cau-igeul-save-profile');
  saveBtn.addEventListener('click', () => {
    const selectedReadingProfile = Array.from(
      document.querySelectorAll('.cau-igeul-checkbox-label input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    const selectedKnownTopics = Array.from(
      document.querySelectorAll('.cau-igeul-tag-label input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    const profile = {
      readingProfile: selectedReadingProfile,
      knownTopics: selectedKnownTopics
    };

    chrome.storage.local.set({ userProfile: profile }, () => {
      console.log('프로필 저장 완료:', profile);
      // 오버레이 제거
      overlay.remove();
      style.remove();
    });
  });

  // 배경 클릭 시 닫기 방지 (선택사항)
  // const backdrop = overlay.querySelector('.cau-igeul-overlay-backdrop');
  // backdrop.addEventListener('click', () => {
  //   overlay.remove();
  //   style.remove();
  // });
}

// 메시지 리스너에 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    extractContent();
  } else if (request.action === 'showProfileSetup') {
    showProfileSetupOverlay(request.userData);
  }
});