// src/styles/toolbarHTML.js
// 툴바 HTML 구조만 담당

export function getToolbarHTML() {
  return `
    <div class="toolbar-content">
      <div class="toolbar-buttons">
        <button id="edit-icon" title="편집">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button id="reading-guide-toggle" title="읽기 가이드">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6"  x2="21" y2="6"  opacity="0.3"></line>
            <line x1="3" y1="18" x2="21" y2="18" opacity="0.3"></line>
          </svg>
        </button>
      </div>

      <div class="right-btns">
        <button id="extract-btn" class="action-btn">📄 본문 추출</button>
        <button id="reader-btn"  class="action-btn">🕮 집중모드</button>
        <button id="simplify-btn" class="action-btn">🪄 문장순화</button>
        <button id="vocab-btn" class="action-btn">📘 단어장</button>
        <button id="exit-reader" class="action-btn" style="display:none; background:#ef4444; color:white; border:none;">✖ 닫기</button>
      </div>

      <div id="settings-panel" style="display: none;">
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

      <div id="guide-panel" style="display: none;">
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
  `;
}