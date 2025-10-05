// 확장프로그램 아이콘 클릭 시
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const toolbar = document.getElementById('custom-toolbar');
      
      if (toolbar) {
        // 이미 있으면 제거
        toolbar.remove();

        //툴바 스타일 제거
        const toolbarStyles = document.querySelectorAll('style');
        toolbarStyles.forEach(style => {
          if (style.textContent.includes('#custom-toolbar')) {
            style.remove();
          }
        });

        document.body.style.paddingTop = '';
        // 폰트 크기 스타일 제거
        const fontStyle = document.getElementById('custom-font-style');
        if (fontStyle) fontStyle.remove();
      } else {
        // 없으면 생성
        let currentSize = 100;
        let currentLineHeight = 1.5;
        let currentLetterSpacing = 0;
        let currentWidth = 100;
        let currentAlign = 'left';
        let currentFont = 'default';
        
        const newToolbar = document.createElement('div');
        newToolbar.id = 'custom-toolbar';
        newToolbar.innerHTML = `
          <div class="toolbar-content">
            <!-- 오른쪽 버튼 -->
            <div class="right-btns">
              <button id="extract-btn" class="action-btn">📄 본문 추출</button>
              <button id="reader-btn" class="action-btn">🕮 집중모드</button>
            </div>

            <button id="edit-icon" title="편집">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            
            <div id="settings-panel" style="display: none;">

              <div class="setting-item">
              <span class="setting-label">Font</span>
              <select id="font-select" class="font-dropdown">
                <option value="default">기본 (Noto Sans KR)</option>
                <option value="lexend">Lexend (읽기 쉬움)</option>
                <option value="pretendard">Pretendard (깔끔)</option>
                <option value="comic">Comic Sans (어린이용)</option>
                <option value="malgun">맑은 고딕</option>
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
                  <button class="align-btn active" data-align="left" title="왼쪽 정렬">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="15" y2="12"></line>
                      <line x1="3" y1="18" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button class="align-btn" data-align="center" title="가운데 정렬">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="6" y1="12" x2="18" y2="12"></line>
                      <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                  </button>
                  <button class="align-btn" data-align="right" title="오른쪽 정렬">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="9" y1="12" x2="21" y2="12"></line>
                      <line x1="6" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                  <button class="align-btn" data-align="justify" title="양쪽 정렬">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          #custom-toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 999999;
            border-bottom: 1px solid #e5e7eb;
          }

          .toolbar-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .right-btns {
            display: flex;
            gap: 8px;
            margin-left: auto;
          }

          .action-btn {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
          }

          .action-btn:hover {
            background: #f3f4f6;
          }

          #edit-icon {
            background: white;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            transition: all 0.2s;
          }

          #edit-icon:hover {
            background: #f3f4f6;
          }

          body {
            padding-top: 70px !important;
          }
        `;

        document.head.appendChild(style);
        document.body.insertBefore(newToolbar, document.body.firstChild);

        // 기존 버튼 이벤트 유지
        document.getElementById("extract-btn").addEventListener("click", () => {
          window.postMessage({ type: "CAU_EXTRACT_START" }, "*");
        });

        document.getElementById("reader-btn").addEventListener("click", () => {
          const dtoRaw = localStorage.getItem("CAU_READER_DTO");
          if (!dtoRaw) {
            alert("먼저 본문을 추출하세요 📄");
            return;
          }
          const dto = JSON.parse(dtoRaw);
          window.postMessage({ type: "CAU_READER_MODE_START", dto }, "*");
        });
      }
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Reader Mode Extractor installed.");
});
