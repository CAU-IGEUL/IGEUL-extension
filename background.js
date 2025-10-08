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
                  <line x1="3" y1="6" x2="21" y2="6" opacity="0.3"></line>
                  <line x1="3" y1="18" x2="21" y2="18" opacity="0.3"></line>
                </svg>
              </button>
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
          }

          .toolbar-buttons {
            display: flex;
            gap: 10px;
          }

          #edit-icon, #reading-guide-toggle {
            background: white;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            transition: all 0.2s;
          }

          #edit-icon:hover, #reading-guide-toggle:hover {
            background: #f3f4f6;
          }

          #settings-panel {
            margin-top: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .setting-item {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
          }

          .setting-item:last-child {
            margin-bottom: 0;
          }

          .setting-label {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
            min-width: 100px;
          }

          #size-slider, #lineheight-slider, #letterspacing-slider, #width-slider {
            flex: 1;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
          }

          #size-slider::-webkit-slider-thumb,
          #lineheight-slider::-webkit-slider-thumb,
          #letterspacing-slider::-webkit-slider-thumb,
          #width-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #3b82f6;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #size-slider::-moz-range-thumb,
          #lineheight-slider::-moz-range-thumb,
          #letterspacing-slider::-moz-range-thumb,
          #width-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #3b82f6;
            cursor: pointer;
            border-radius: 50%;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #size-value, #lineheight-value, #letterspacing-value, #width-value {
            font-size: 14px;
            color: #374151;
            font-weight: 600;
            min-width: 50px;
          }

          .align-buttons {
            display: flex;
            gap: 8px;
          }

          .align-btn {
            background: white;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .align-btn:hover {
            background: #f3f4f6;
          }

          .align-btn.active {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
          }

          .align-btn.active svg {
            stroke: white;
          }
          
          .font-dropdown {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            font-size: 14px;
            cursor: pointer;
            outline: none;
          }
          
          .font-dropdown:hover {
            border-color: #3b82f6;
          }
          
          .font-dropdown:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          body {
            padding-top: 70px !important;
          }

           /* 읽기 가이드 패널 */
          #guide-panel {
            margin-top: 15px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .guide-setting-item {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
          }

          .guide-setting-item:last-child {
            margin-bottom: 0;
          }

          .checkbox-container {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
          }

          .checkbox-container input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          .checkbox-label {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }

          .guide-label {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
            min-width: 100px;
          }

          #guide-color-picker {
            flex: 1;
            height: 40px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
          }

          #guide-color-picker::-webkit-color-swatch-wrapper {
            padding: 4px;
          }

          #guide-color-picker::-webkit-color-swatch {
            border: none;
            border-radius: 4px;
          }

          #guide-opacity-slider {
            flex: 1;
            height: 6px;
            background: linear-gradient(to right, transparent, currentColor);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
            margin-bottom: 10px;
          }

          #guide-opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #111827;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #guide-opacity-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #111827;
            cursor: pointer;
            border-radius: 50%;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #guide-opacity-value {
            font-size: 14px;
            color: #374151;
            font-weight: 600;
            min-width: 50px;
          }

          #reading-guide-toggle.active {
            background: #3b82f6;
            border-color: #3b82f6;
          }

          #reading-guide-toggle.active svg {
            stroke: white;
          }

          #guide-height-slider, #guide-position-slider {
            flex: 1;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
            margin-bottom: 10px;
          }

          #guide-height-slider::-webkit-slider-thumb,
          #guide-position-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #111827;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #guide-height-slider::-moz-range-thumb,
          #guide-position-slider::-moz-range-thumb{
            width: 18px;
            height: 18px;
            background: #111827;
            cursor: pointer;
            border-radius: 50%;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          #guide-height-value, #guide-position-value {
            font-size: 14px;
            color: #374151;
            font-weight: 600;
            min-width: 50px;
          }

          .guide-hint {
            font-size: 12px;
            color: #6b7280;
            margin-top: -8px;
            margin-bottom: 12px;
            padding-left: 115px;
            font-style: italic;
          }

          /* 리딩 가이드 막대 */
          #reading-guide {
            position: fixed;
            left: 0;
            right: 0;
            height: 60px;
            cursor: grab;
            z-index: 999998;
            transition: top 0.1s ease-out;
          }
        `;

        document.head.appendChild(style);
        document.body.insertBefore(newToolbar, document.body.firstChild);

        const readingGuide = document.createElement('div');
        readingGuide.id = 'reading-guide';
        readingGuide.style.display = 'none';
        document.body.appendChild(readingGuide);

        
        //웹폰트 로드 추가
        const fontLinks = [
          'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Lexend:wght@400;600&display=swap',
          'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
        ];

        const customFontStyle = document.createElement('style');
        customFontStyle.textContent = `
          @font-face {
            font-family: 'PeachMarket';
            src: url('${chrome.runtime.getURL('fonts/PeachMarket-Regular.ttf')}') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `;
          document.head.appendChild(customFontStyle);
        
        fontLinks.forEach(href => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        });


        // 폰트 크기 조절용 스타일 엘리먼트 생성
        const fontStyleElement = document.createElement('style');
        fontStyleElement.id = 'custom-font-style';
        document.head.appendChild(fontStyleElement);

                
        // 폰트 설정 함수
        function getFontFamily(fontKey) {
          const fontMap = {
            'default': '"Noto Sans KR"',
            'lexend': 'Lexend',
            'pretendard': 'Pretendard',
            'malgun': '"Malgun Gothic"',
            'peachmarket': 'PeachMarket',
          };
          return fontMap[fontKey] || fontMap['default'];
        }


        function updateStyles() {
          const baseFontSize = 16 * (currentSize / 100);
          const selectedFont = getFontFamily(currentFont);

          fontStyleElement.textContent = `
            
            body {
              background: #f5f5f5 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* 본문 컨테이너 */
            article, main, .content, #content {
              width: ${currentWidth}% !important;
              max-width: 720px !important;
              margin: 0 auto !important;
              padding: 60px 40px !important;
              background: white !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            }
            
            /* 텍스트 기본값 */
            * {
              font-family: ${selectedFont} !important;
              font-size: ${baseFontSize}px !important;
              line-height: ${currentLineHeight} !important;
              letter-spacing: ${currentLetterSpacing}px !important;
              text-align: ${currentAlign} !important;
              color: #222 !important;
            }
            
            /* 제목 크기 */
            h1 { font-size: ${baseFontSize * 1.75}px !important; margin: 1.5em 0 0.5em !important; }
            h2 { font-size: ${baseFontSize * 1.5}px !important; margin: 1.3em 0 0.5em !important; }
            h3 { font-size: ${baseFontSize * 1.25}px !important; margin: 1.2em 0 0.5em !important; }
            
            p { margin-bottom: 1em !important; }
            
            /* 툴바 제외 */
            #custom-toolbar, #custom-toolbar * {
              font-family: -apple-system, sans-serif !important;
              font-size: 14px !important;
              line-height: 1.5 !important;
              letter-spacing: 0 !important;
              text-align: left !important;
              color: #374151 !important;
            }
          `;
        }


        // 편집 아이콘 클릭 시 패널 토글
        document.getElementById('edit-icon').addEventListener('click', () => {
          const panel = document.getElementById('settings-panel');
          if (panel.style.display === 'none') {
            panel.style.display = 'block';
            document.body.style.paddingTop = '270px';
          } else {
            panel.style.display = 'none';
            document.body.style.paddingTop = '70px';
          }
        });

        // Text Size 슬라이더 조절
        document.getElementById('size-slider').addEventListener('input', (e) => {
          currentSize = e.target.value;
          updateStyles();
          document.getElementById('size-value').textContent = currentSize + '%';
        });

        // Line Height 슬라이더 조절
        document.getElementById('lineheight-slider').addEventListener('input', (e) => {
          currentLineHeight = e.target.value;
          updateStyles();
          document.getElementById('lineheight-value').textContent = currentLineHeight;
        });

        // Letter Spacing 슬라이더 조절
        document.getElementById('letterspacing-slider').addEventListener('input', (e) => {
          currentLetterSpacing = e.target.value;
          updateStyles();
          document.getElementById('letterspacing-value').textContent = currentLetterSpacing + 'px';
        });

        // Width 슬라이더 조절
        document.getElementById('width-slider').addEventListener('input', (e) => {
          currentWidth = e.target.value;
          updateStyles();
          document.getElementById('width-value').textContent = currentWidth + '%';
        });

        // 폰트 선택 변경
        document.getElementById('font-select').addEventListener('change', (e) => {
          currentFont = e.target.value;
          updateStyles();
        });

        // Text Align 버튼 클릭
        document.querySelectorAll('.align-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            // 모든 버튼에서 active 클래스 제거
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            btn.classList.add('active');
            // 정렬 값 업데이트
            currentAlign = btn.getAttribute('data-align');
            updateStyles();
          });
        });

        // 리딩 가이드 변수
        let readingGuideEnabled = false;
        let readingGuidePosition = window.innerHeight / 2;
        let guideColor = '#7a7d81ff'; 
        let guideOpacity = 15;
        let guideHeight = 60; 

        // 리딩 가이드 스타일 업데이트 함수
        function updateReadingGuideStyle() {
          const guide = document.getElementById('reading-guide');
          if (!guide) return;
          
          // hex 색상을 rgb로 변환
          const r = parseInt(guideColor.slice(1, 3), 16);
          const g = parseInt(guideColor.slice(3, 5), 16);
          const b = parseInt(guideColor.slice(5, 7), 16);
          
          // 배경 색상 적용
          guide.style.background = `rgba(${r}, ${g}, ${b}, ${guideOpacity / 100})`;

          //높이 적용
          guide.style.height = `${guideHeight}px`;
        }

        // 리딩 가이드 위치 업데이트
        function updateReadingGuidePosition() {
          if (!readingGuideEnabled) return;
          
          const guide = document.getElementById('reading-guide');
          guide.style.top = readingGuidePosition + 'px';
        }

        // 리딩 가이드 토글 버튼
        document.getElementById('reading-guide-toggle').addEventListener('click', () => {
          const guidePanel = document.getElementById('guide-panel');
          const settingsPanel = document.getElementById('settings-panel');
          const toggleBtn = document.getElementById('reading-guide-toggle');
          
          if (guidePanel.style.display === 'none') {
            guidePanel.style.display = 'block';
            settingsPanel.style.display = 'none';  // 편집 패널 숨김
            toggleBtn.classList.add('active');
            document.body.style.paddingTop = '270px';
          } else {
            guidePanel.style.display = 'none';
            toggleBtn.classList.remove('active');
            document.body.style.paddingTop = '70px';
          }
        });

        // 체크박스로 가이드 ON/OFF
        document.getElementById('display-ruler-checkbox').addEventListener('change', (e) => {
          const guide = document.getElementById('reading-guide');
          readingGuideEnabled = e.target.checked;
          
          if (readingGuideEnabled) {
            guide.style.display = 'block';

            // 슬라이더 최대값을 화면 높이에서 가이드 높이를 뺀 값으로 설정
            const maxPosition = window.innerHeight - guideHeight;
            document.getElementById('guide-position-slider').max = maxPosition;

            // 초기 위치를 현재 화면 중앙으로 설정
            readingGuidePosition = window.innerHeight / 2;
            document.getElementById('guide-position-slider').value = readingGuidePosition;
            document.getElementById('guide-position-value').textContent = Math.round(readingGuidePosition) + 'px';
            
            updateReadingGuideStyle();
            updateReadingGuidePosition();
          } else {
            guide.style.display = 'none';
          }
        });

        // 색상 선택
        document.getElementById('guide-color-picker').addEventListener('input', (e) => {
          guideColor = e.target.value;
          updateReadingGuideStyle();
        });

        // 투명도 조절
        document.getElementById('guide-opacity-slider').addEventListener('input', (e) => {
          guideOpacity = e.target.value;
          document.getElementById('guide-opacity-value').textContent = guideOpacity + '%';
          updateReadingGuideStyle();
        });

        // 높이 조절
        document.getElementById('guide-height-slider').addEventListener('input', (e) => {
          guideHeight = e.target.value;
          document.getElementById('guide-height-value').textContent = guideHeight + 'px';

           // 슬라이더 최대값 업데이트
          if (readingGuideEnabled) {
            const maxPosition = window.innerHeight - guideHeight;
            document.getElementById('guide-position-slider').max = maxPosition;
            
            // 현재 위치가 최대값을 초과하면 조정
            if (readingGuidePosition > maxPosition) {
              readingGuidePosition = maxPosition;
              document.getElementById('guide-position-slider').value = readingGuidePosition;
              document.getElementById('guide-position-value').textContent = Math.round(readingGuidePosition) + 'px';
              updateReadingGuidePosition();
            }
          }

          updateReadingGuideStyle();
        });

        // 위치 조절 (추가)
        document.getElementById('guide-position-slider').addEventListener('input', (e) => {
          readingGuidePosition = parseInt(e.target.value);
          document.getElementById('guide-position-value').textContent = readingGuidePosition + 'px';
          updateReadingGuidePosition();
        });

        // 마우스 휠로 리딩 가이드 위치 조절
        document.addEventListener('wheel', (e) => {
          if (!readingGuideEnabled) return;
          
          if (e.ctrlKey) {
            e.preventDefault();
            readingGuidePosition += e.deltaY * 0.3;
            
            const minPos = 100;
            const maxPos = window.innerHeight - guideHeight;
            readingGuidePosition = Math.max(minPos, Math.min(maxPos, readingGuidePosition));
            
            // 슬라이더 값도 업데이트
            document.getElementById('guide-position-slider').value = readingGuidePosition;
            document.getElementById('guide-position-value').textContent = Math.round(readingGuidePosition) + 'px';
            
            updateReadingGuidePosition();
          }
        }, { passive: false });

        // 창 크기 변경 시 위치 재조정
        window.addEventListener('resize', () => {
          if (readingGuideEnabled) {
            const maxPosition = window.innerHeight - guideHeight;
            document.getElementById('guide-position-slider').max = maxPosition;
            
            readingGuidePosition = Math.min(readingGuidePosition, maxPosition);
            document.getElementById('guide-position-slider').value = readingGuidePosition;
            document.getElementById('guide-position-value').textContent = Math.round(readingGuidePosition) + 'px';
    
            updateReadingGuidePosition();
          }
        });

        // 초기 위치 설정
        updateReadingGuidePosition();
      }
    }
  });
});