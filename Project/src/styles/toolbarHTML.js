// src/styles/toolbarHTML.js
// 툴바 HTML 구조만 담당

export function getToolbarHTML() {
  return `
    <div class="toolbar-content">
      <div class="toolbar-buttons">
        <div class="dropdown-container">
          <button id="edit-icon" title="편집">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <div id="settings-panel" class="dropdown-menu" style="display: none;">
            <div class="setting-item">
              <span class="setting-label">Font</span>
              <select id="font-select" class="font-dropdown">
                <option value="default">기본 (Noto Sans KR)</option>
                <option value="lexend">Lexend (읽기 쉬움)</option>
                <option value="pretendard">Pretendard (깔끔)</option>
                <option value="malgun">맑은 고딕</option>
                <option value="peachmarket">PeachMarket (난독증 친화)</option>
              </select>
            </div>
            <div class="setting-item">
              <span class="setting-label">Text Color</span>
              <input type="color" id="text-color-picker" value="#222222">
            </div>
            <div class="setting-item">
              <span class="setting-label">Background Color</span>
              <input type="color" id="bg-color-picker" value="#FFFFFF">
            </div>
            <div class="setting-item">
              <span class="setting-label">Text Size</span>
              <input type="range" id="size-slider" min="50" max="150" value="100" step="1">
              <span id="size-value">100%</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Line Height</span>
              <input type="range" id="lineheight-slider" min="1" max="3" value="1.5" step="0.1">
              <span id="lineheight-value">1.5</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Letter Spacing</span>
              <input type="range" id="letterspacing-slider" min="-2" max="10" value="0" step="0.5">
              <span id="letterspacing-value">0px</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Width</span>
              <input type="range" id="width-slider" min="50" max="120" value="100" step="1">
              <span id="width-value">100%</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Text Align</span>
              <div class="align-buttons">
                <button class="align-btn active" data-align="left"  title="왼쪽 정렬">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6"  x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="15" y2="12"></line>
                    <line x1="3" y1="18" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button class="align-btn" data-align="center" title="가운데 정렬">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6"  x2="21" y2="6"></line>
                    <line x1="6" y1="12" x2="18" y2="12"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                  </svg>
                </button>
                <button class="align-btn" data-align="right"  title="오른쪽 정렬">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6"  x2="21" y2="6"></line>
                    <line x1="9" y1="12" x2="21" y2="12"></line>
                    <line x1="6" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <button class="align-btn" data-align="justify" title="양쪽 정렬">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6"  x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="dropdown-container">
          <button id="reading-guide-toggle" title="읽기 가이드">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6"  x2="21" y2="6"  opacity="0.3"></line>
              <line x1="3" y1="18" x2="21" y2="18" opacity="0.3"></line>
            </svg>
          </button>
          <div id="guide-panel" class="dropdown-menu" style="display: none;">
            <div class="guide-setting-item">
              <label class="checkbox-container">
                <input type="checkbox" id="display-ruler-checkbox">
                <span class="checkbox-label">Display Ruler</span>
              </label>
            </div>
            <div class="guide-setting-item">
              <span class="guide-label">Color</span>
              <input type="color" id="guide-color-picker" value="#60616aff">
            </div>
            <div class="guide-setting-item">
              <span class="guide-label">Height</span>
              <input type="range" id="guide-height-slider" min="20" max="200" value="60" step="10">
              <span id="guide-height-value">60px</span>
            </div>
            <div class="guide-setting-item">
              <span class="guide-label">Opacity</span>
              <input type="range" id="guide-opacity-slider" min="0" max="100" value="20" step="5">
              <span id="guide-opacity-value">20%</span>
            </div>
            <div class="guide-setting-item">
              <span class="guide-label">Position</span>
              <input type="range" id="guide-position-slider" min="100" max="800" value="500" step="10">
              <span id="guide-position-value">500px</span>
            </div>
            <div class="guide-hint">
              Ctrl + 마우스휠로 위치 조정 가능합니다
            </div>
          </div>
        </div>
        
        <button id="summary-toggle" title="본문 요약">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
            <line x1="9" y1="9" x2="10" y2="9"></line>
          </svg>
        </button>

        <button id="profile-toggle" title="프로필 설정">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      
          <div class="recommendations-toggle-container" style="display: flex; align-items: center; gap: 8px; margin-left: 12px;">
            <span style="font-size: 12px; color: #6b7280;">더 읽을 콘텐츠</span>
            <label class="toggle-switch">
              <input type="checkbox" id="recommendations-toggle" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
      </div> 

      <div class="right-btns">
        <button id="extract-btn" class="action-btn">📄 본문 추출</button>
        <button id="reader-btn"  class="action-btn">🕮 집중모드</button>
        <button id="simplify-btn" class="action-btn">🪄 문장순화</button>
        <button id="vocab-btn" class="action-btn">📘 단어장</button>
        <button id="exit-reader" class="action-btn" style="display:none; background:#ef4444; color:white; border:none;">✖ 닫기</button>
      </div>
    </div>

    <!-- 요약 모달 -->
    <div id="summary-modal" class="summary-modal" style="display: none;">
      <div class="summary-modal-backdrop"></div>
      <div class="summary-modal-content">
        <div class="summary-modal-header">
          <h3>본문 요약</h3>
          <button id="summary-modal-close" class="summary-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="summary-modal-body">
          <div id="summary-loading" class="summary-loading">
            <div class="summary-spinner"></div>
            <p>요약을 생성하는 중입니다...</p>
          </div>
          <div id="summary-content" class="summary-content" style="display: none;">
            <div class="summary-text">
              여기에 요약된 내용이 표시됩니다.
            </div>
          </div>
          <div id="summary-error" class="summary-error" style="display: none;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>요약을 생성하는 중 오류가 발생했습니다.</p>
            <button id="summary-retry-btn" class="summary-retry-btn">다시 시도</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 프로필 설정 모달 -->
    <div id="profile-modal" class="profile-modal" style="display: none;">
      <div class="profile-modal-backdrop"></div>
      <div class="profile-modal-content">
        <div class="profile-modal-header">
          <h3>프로필 설정</h3>
          <button id="profile-modal-close" class="profile-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="profile-modal-body">
          <div id="profile-loading" class="profile-loading">
            <div class="profile-spinner"></div>
            <p>프로필을 불러오는 중입니다...</p>
          </div>
          
          <div id="profile-content" class="profile-content" style="display: none;">
            <!-- 문장 분해 정도 -->
            <div class="profile-section">
              <label class="profile-section-label">문장 분해 정도를 선택해주세요.</label>
              <div class="profile-slider-container">
                <div class="profile-slider-labels">
                  <span>레벨 0</span>
                  <span>레벨 1</span>
                  <span>레벨 2</span>
                </div>
                <div class="profile-slider-track">
                  <input type="range" name="sentence-level" min="0" max="2" step="1" value="0" class="profile-level-slider">
                  <div class="profile-slider-indicators">
                    <span class="profile-slider-dot" data-value="0"></span>
                    <span class="profile-slider-dot" data-value="1"></span>
                    <span class="profile-slider-dot" data-value="2"></span>
                  </div>
                </div>
                <div class="profile-slider-descriptions">
                  <span>원문</span>
                  <span>약간 나눔</span>
                  <span>많이 나눔</span>
                </div>
              </div>
            </div>

            <!-- 어휘 난이도 -->
            <div class="profile-section">
              <label class="profile-section-label">어휘 난이도 정도를 선택해주세요.</label>
              <div class="profile-slider-container">
                <div class="profile-slider-labels">
                  <span>레벨 0</span>
                  <span>레벨 1</span>
                  <span>레벨 2</span>
                </div>
                <div class="profile-slider-track">
                  <input type="range" name="vocab-level" min="0" max="2" step="1" value="0" class="profile-level-slider">
                  <div class="profile-slider-indicators">
                    <span class="profile-slider-dot" data-value="0"></span>
                    <span class="profile-slider-dot" data-value="1"></span>
                    <span class="profile-slider-dot" data-value="2"></span>
                  </div>
                </div>
                <div class="profile-slider-descriptions">
                  <span>원문</span>
                  <span>약간 쉬움</span>
                  <span>많이 쉬움</span>
                </div>
              </div>
            </div>

            <!-- 학습 분야 -->
            <div class="profile-section">
              <label class="profile-section-label">배우고 싶은 분야를 선택해주세요.</label>
              <div class="profile-tag-group">
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="정치">
                  <span>정치</span>
                </label>
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="경제">
                  <span>경제</span>
                </label>
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="사회">
                  <span>사회</span>
                </label>
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="생활/문화">
                  <span>생활/문화</span>
                </label>
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="IT">
                  <span>IT</span>
                </label>
                <label class="profile-tag-label">
                  <input type="checkbox" name="known-topics" value="과학">
                  <span>과학</span>
                </label>
              </div>
            </div>

            <button id="profile-save-btn" class="profile-save-btn">💾 저장하기</button>
          </div>

          <div id="profile-error" class="profile-error" style="display: none;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>프로필을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}