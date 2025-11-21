export function loadFonts() {
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Lexend:wght@400;600&display=swap',
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
  ];

  const customFontStyle = document.createElement('style');
  const fontURL = typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('fonts/PeachMarket-Regular.ttf')
    : 'fonts/PeachMarket-Regular.ttf'; // fallback
  customFontStyle.textContent = `
    @font-face {
      font-family: 'PeachMarket';
      src: url('${fontURL}') format('truetype');
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
}

export function getFontFamily(fontKey) {
  const fontMap = {
    'default': '"Noto Sans KR"',
    'lexend': 'Lexend',
    'pretendard': 'Pretendard',
    'malgun': '"Malgun Gothic"',
    'peachmarket': 'PeachMarket',
  };
  return fontMap[fontKey] || fontMap['default'];
}

export function initFontController() {
  console.log("✅ initFontController() 실행됨");

  // 폰트 상태 변수
  let currentSize = 100;
  let currentLineHeight = 1.5;
  let currentLetterSpacing = 0;
  let currentWidth = 100;
  let currentAlign = 'left';
  let currentFont = 'default';

  // 폰트 스타일 엘리먼트 생성
  const fontStyleElement = document.createElement('style');
  fontStyleElement.id = 'custom-font-style';
  document.head.appendChild(fontStyleElement);

  // 스타일 업데이트 함수
  function updateStyles() {
    const baseFontSize = 16 * (currentSize / 100);
    const selectedFont = getFontFamily(currentFont);

    fontStyleElement.textContent = `
      /* 배경 설정 */
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


  // 🎚 폰트 크기 슬라이더
  document.getElementById('size-slider')?.addEventListener('input', (e) => {
    currentSize = e.target.value;
    updateStyles();
    document.getElementById('size-value').textContent = `${currentSize}%`;
  });

  // 🎚 줄간격 슬라이더
  document.getElementById('lineheight-slider')?.addEventListener('input', (e) => {
    currentLineHeight = e.target.value;
    updateStyles();
    document.getElementById('lineheight-value').textContent = currentLineHeight;
  });

  // 🎚 자간 슬라이더
  document.getElementById('letterspacing-slider')?.addEventListener('input', (e) => {
    currentLetterSpacing = e.target.value;
    updateStyles();
    document.getElementById('letterspacing-value').textContent = `${currentLetterSpacing}px`;
  });

  // 🎚 너비 슬라이더
  document.getElementById('width-slider')?.addEventListener('input', (e) => {
    currentWidth = e.target.value;
    updateStyles();
    document.getElementById('width-value').textContent = `${currentWidth}%`;
  });

  // ✏️ 폰트 변경
  document.getElementById('font-select')?.addEventListener('change', (e) => {
    currentFont = e.target.value;
    updateStyles();
  });

  // 📏 정렬 버튼
  document.querySelectorAll('.align-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlign = btn.getAttribute('data-align');
      updateStyles();
    });
  });

  // 초기 스타일 반영
  updateStyles();
}