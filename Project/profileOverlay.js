// profileOverlay.js - 전체 수정 버전

let currentStep = 1;
const totalSteps = 3;

// 프로필 설정 오버레이 표시 함수
function showProfileSetupOverlay(userData) {
  console.log('👉 [오버레이] 생성 시작');

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
        
        <div class="cau-igeul-user-info">
          <img src="${userData.photoURL || ''}" alt="User Photo" class="cau-igeul-user-photo">
          <div class="cau-igeul-user-details">
            <span class="cau-igeul-user-name">${userData.displayName || '사용자'}</span>
            <span class="cau-igeul-user-email">${userData.email || ''}</span>
          </div>
        </div>

        <h2>프로필 설정</h2>
        <p>읽기를 시작하기 전에 프로필을 설정해주세요.</p>
        
        <div class="cau-igeul-progress-indicator">
          <div class="cau-igeul-progress-step active" data-step="1">1</div>
          <div class="cau-igeul-progress-line"></div>
          <div class="cau-igeul-progress-step" data-step="2">2</div>
          <div class="cau-igeul-progress-line"></div>
          <div class="cau-igeul-progress-step" data-step="3">3</div>
        </div>

        <div id="cau-igeul-step-1" class="cau-igeul-profile-step active">
          <div class="cau-igeul-profile-section">
            <label class="cau-igeul-step-question">다음 문장을 가장 편하게 읽을 수 있는 문장 분해 정도를 선택해주세요.</label>
            
            <div class="cau-igeul-example-box">
              <div class="cau-igeul-example-label">원문</div>
              <div class="cau-igeul-example-text">이 도시의 상징인, 수백 년의 역사를 간직한 채 강가에 서 있는 그 시계탑은 많은 관광객들의 사랑을 받는다.</div>
            </div>
            
            <div class="cau-igeul-sentence-level-group">
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="sentence-level" value="0">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 0</span>
                    <span class="cau-igeul-level-badge cau-igeul-original-badge">원문</span>
                  </div>
                  <div class="cau-igeul-example-text">이 도시의 상징인, 수백 년의 역사를 간직한 채 강가에 서 있는 그 시계탑은 많은 관광객들의 사랑을 받는다.</div>
                </div>
              </label>
              
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="sentence-level" value="1">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 1</span>
                    <span class="cau-igeul-level-badge">약간 나눔</span>
                  </div>
                  <div class="cau-igeul-example-text">이 도시의 상징인 시계탑은 수백 년의 역사를 간직하고 있다. 그 시계탑은 강가에 서 있으며 많은 관광객들의 사랑을 받는다.</div>
                </div>
              </label>
              
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="sentence-level" value="2">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 2</span>
                    <span class="cau-igeul-level-badge">많이 나눔</span>
                  </div>
                  <div class="cau-igeul-example-text">이 도시의 상징은 수백 년의 역사를 간직한 시계탑이다. 시계탑은 강가에 서 있다. 많은 관광객들이 시계탑을 사랑한다.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div id="cau-igeul-step-2" class="cau-igeul-profile-step">
          <div class="cau-igeul-profile-section">
            <label class="cau-igeul-step-question">다음 문장을 가장 편하게 읽을 수 있는 어휘 정도를 선택해주세요.</label>
            
            <div class="cau-igeul-example-box">
              <div class="cau-igeul-example-label">원문</div>
              <div class="cau-igeul-example-text">모두가 그의 성공을 의심했지만, 그는 보란 듯이 재기하여 회의론자들의 코를 납작하게 만들었습니다.</div>
            </div>
            
            <div class="cau-igeul-sentence-level-group">
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="vocab-level" value="0">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 0</span>
                    <span class="cau-igeul-level-badge cau-igeul-original-badge">원문</span>
                  </div>
                  <div class="cau-igeul-example-text">모두가 그의 성공을 의심했지만, 그는 보란 듯이 재기하여 회의론자들의 코를 납작하게 만들었습니다.</div>
                </div>
              </label>
              
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="vocab-level" value="1">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 1</span>
                    <span class="cau-igeul-level-badge">쉬운 어휘</span>
                  </div>
                  <div class="cau-igeul-example-text">모두가 그의 성공을 의심했지만, 그는 확실히 다시 일어나 회의론자들을 놀라게 했습니다.</div>
                </div>
              </label>
              
              <label class="cau-igeul-sentence-level-btn">
                <input type="radio" name="vocab-level" value="2">
                <div class="cau-igeul-level-content">
                  <div class="cau-igeul-level-header">
                    <span class="cau-igeul-level-number">레벨 2</span>
                    <span class="cau-igeul-level-badge">더 쉬운 어휘</span>
                  </div>
                  <div class="cau-igeul-example-text">많은 사람들이 그의 성공을 의심했지만, 그는 결국 성공하여 비판자들을 당황하게 만들었습니다.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div id="cau-igeul-step-3" class="cau-igeul-profile-step">
          <div class="cau-igeul-profile-section">
            <label class="cau-igeul-step-question">배우고 싶은 분야를 선택해주세요.<br>선택한 분야에 맞춰 관련 단어를 집중적으로 제공합니다.</label>
            <div class="cau-igeul-tag-group">
              <label class="cau-igeul-tag-label"><input type="checkbox" value="정치"><span>정치</span></label>
              <label class="cau-igeul-tag-label"><input type="checkbox" value="경제"><span>경제</span></label>
              <label class="cau-igeul-tag-label"><input type="checkbox" value="사회"><span>사회</span></label>
              <label class="cau-igeul-tag-label"><input type="checkbox" value="생활/문화"><span>생활/문화</span></label>
              <label class="cau-igeul-tag-label"><input type="checkbox" value="IT"><span>IT</span></label>
              <label class="cau-igeul-tag-label"><input type="checkbox" value="과학"><span>과학</span></label>
            </div>
          </div>
        </div>

        <div class="cau-igeul-step-navigation">
          <button id="cau-igeul-prev-step" class="cau-igeul-btn cau-igeul-nav-btn" style="display:none;">← 이전</button>
          <button id="cau-igeul-next-step" class="cau-igeul-btn cau-igeul-nav-btn">다음 →</button>
          <button id="cau-igeul-save-profile" class="cau-igeul-btn cau-igeul-save-btn" style="display:none;">저장하기</button>
        </div>
      </div>
    </div>
  `;

  // 스타일 추가 (기존과 동일)
  const style = document.createElement('style');
  style.id = 'cau-igeul-overlay-style';
  style.textContent = `
    #cau-igeul-profile-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .cau-igeul-overlay-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); }
    .cau-igeul-overlay-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-height: 90vh; overflow-y: auto; z-index: 1000000; }
    .cau-igeul-setup-container { background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 600px; width: 90vw; text-align: center; }
    .cau-igeul-user-info { display: flex; align-items: center; justify-content: center; margin-bottom: 30px; padding: 16px; background-color: #e8f0fe; border-radius: 12px; }
    .cau-igeul-user-photo { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; border: 3px solid #4285F4; }
    .cau-igeul-user-details { display: flex; flex-direction: column; text-align: left; }
    .cau-igeul-user-name { font-weight: bold; color: #333; font-size: 16px; }
    .cau-igeul-user-email { font-size: 13px; color: #666; }
    .cau-igeul-progress-indicator { display: flex; align-items: center; justify-content: center; margin: 20px 0 40px 0; gap: 10px; }
    .cau-igeul-progress-step { width: 40px; height: 40px; border-radius: 50%; background-color: #e0e0e0; color: #666; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s; }
    .cau-igeul-progress-step.active { background-color: #4285F4; color: white; transform: scale(1.15); }
    .cau-igeul-progress-step.completed { background-color: #34a853; color: white; }
    .cau-igeul-progress-line { width: 40px; height: 3px; background-color: #e0e0e0; transition: all 0.3s; }
    .cau-igeul-progress-line.completed { background-color: #34a853; }
    .cau-igeul-profile-step { display: none; }
    .cau-igeul-profile-step.active { display: block; }
    .cau-igeul-profile-section { margin-bottom: 30px; text-align: center; }
    .cau-igeul-step-question { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 30px; display: block; line-height: 1.6; }
    .cau-igeul-example-box { background-color: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left; }
    .cau-igeul-example-label { font-size: 12px; font-weight: 600; color: #666; margin-bottom: 8px; }
    .cau-igeul-sentence-level-group { display: flex; flex-direction: column; gap: 15px; }
    .cau-igeul-sentence-level-btn { display: flex; align-items: flex-start; padding: 16px; background-color: #f8f9fa; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 3px solid transparent; text-align: left; }
    .cau-igeul-sentence-level-btn input[type="radio"] { display: none; }
    .cau-igeul-sentence-level-btn .cau-igeul-level-content { display: flex; flex-direction: column; width: 100%; gap: 12px; }
    .cau-igeul-level-header { display: flex; align-items: center; gap: 10px; }
    .cau-igeul-level-badge { font-size: 11px; padding: 3px 10px; border-radius: 12px; background-color: #e3f2fd; color: #1976d2; font-weight: 500; }
    .cau-igeul-original-badge { background-color: #fff3e0; color: #f57c00; }
    .cau-igeul-sentence-level-btn:hover { background-color: #e3f2fd; transform: translateY(-2px); }
    .cau-igeul-sentence-level-btn:has(input[type="radio"]:checked) { background-color: #e8f0fe; border-color: #4285F4; }
    .cau-igeul-tag-group { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .cau-igeul-tag-label { display: flex; align-items: center; padding: 12px 18px; background-color: #f0f0f0; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-size: 15px; }
    .cau-igeul-tag-label input[type="checkbox"] { display: none; }
    .cau-igeul-tag-label:hover { background-color: #e0e0e0; transform: translateY(-2px); }
    .cau-igeul-tag-label:has(input[type="checkbox"]:checked) { background-color: #4285F4; color: white; }
    .cau-igeul-step-navigation { display: flex; gap: 12px; margin-top: 30px; }
    .cau-igeul-btn { padding: 16px 32px; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; }
    .cau-igeul-nav-btn { background-color: #e0e0e0; color: #333; }
    .cau-igeul-nav-btn:hover { background-color: #d5d5d5; }
    .cau-igeul-save-btn { background-color: #4285F4; color: white; }
    .cau-igeul-save-btn:hover { background-color: #357ae8; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4); }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  console.log('👉 [오버레이] DOM 추가 완료');

  // 버튼 요소 찾기 (DOM 추가 후에 실행해야 함 - 에러 방지 핵심)
  const nextBtn = document.getElementById('cau-igeul-next-step');
  const prevBtn = document.getElementById('cau-igeul-prev-step');
  const saveBtn = document.getElementById('cau-igeul-save-profile');

  // 단계 전환 함수
  function showStep(step) {
    document.querySelectorAll('.cau-igeul-profile-step').forEach(el => el.classList.remove('active'));
    const currentStepEl = document.getElementById(`cau-igeul-step-${step}`);
    if (currentStepEl) currentStepEl.classList.add('active');

    document.querySelectorAll('.cau-igeul-progress-step').forEach((el, index) => {
      const stepNum = index + 1;
      if (stepNum < step) {
        el.classList.add('completed');
        el.classList.remove('active');
      } else if (stepNum === step) {
        el.classList.add('active');
        el.classList.remove('completed');
      } else {
        el.classList.remove('active', 'completed');
      }
    });

    document.querySelectorAll('.cau-igeul-progress-line').forEach((el, index) => {
      if (index < step - 1) el.classList.add('completed');
      else el.classList.remove('completed');
    });

    prevBtn.style.display = step > 1 ? 'block' : 'none';
    
    if (step < totalSteps) {
      nextBtn.style.display = 'block';
      saveBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'none';
      saveBtn.style.display = 'block';
    }
    currentStep = step;
  }

  // 유효성 검사
  function validateCurrentStep() {
    if (currentStep === 1) {
      if (!document.querySelector('input[name="sentence-level"]:checked')) {
        alert('문장 수준을 선택해주세요.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!document.querySelector('input[name="vocab-level"]:checked')) {
        alert('어휘 수준을 선택해주세요.');
        return false;
      }
    }
    return true;
  }

  // 이벤트 리스너 연결
  nextBtn.addEventListener('click', () => {
    if (validateCurrentStep() && currentStep < totalSteps) showStep(currentStep + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  // [핵심] 저장 버튼 이벤트 리스너 (수정된 로직 적용)
  saveBtn.addEventListener('click', () => {
    console.log('👉 [오버레이] 저장 버튼 클릭됨');

    const sentenceLevel = document.querySelector('input[name="sentence-level"]:checked')?.value;
    const vocabLevel = document.querySelector('input[name="vocab-level"]:checked')?.value;
    const selectedKnownTopics = Array.from(
      document.querySelectorAll('.cau-igeul-tag-label input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    const profile = {
      sentence: parseInt(sentenceLevel),
      vocabulary: parseInt(vocabLevel),
      knownTopics: selectedKnownTopics
    };

    console.log('👉 [오버레이] 전송할 데이터:', profile);

    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';

    // 백그라운드로 메시지 전송
    chrome.runtime.sendMessage({ 
      action: 'saveProfileProxy', 
      data: profile 
    }, (response) => {
      console.log('👉 [오버레이] 백그라운드 응답:', response);
      
      if (chrome.runtime.lastError) {
        console.error('❌ 통신 에러:', chrome.runtime.lastError);
        alert('오류 발생: 페이지를 새로고침 후 다시 시도해주세요.');
        saveBtn.disabled = false;
        saveBtn.textContent = '저장하기';
        return;
      }

      if (response && response.status === 'success') {
        alert('프로필이 저장되었습니다!');
        overlay.remove();
        style.remove();
      } else {
        alert(`저장 실패: ${response?.message || '알 수 없는 오류'}`);
        saveBtn.disabled = false;
        saveBtn.textContent = '저장하기';
      }
    });
  });

  // 초기화
  showStep(1);
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showProfileSetup') {
    console.log('👉 [오버레이] showProfileSetup 메시지 수신');
    setTimeout(() => {
      showProfileSetupOverlay(request.userData);
      sendResponse({ status: 'success' });
    }, 100);
    return true;
  }
});