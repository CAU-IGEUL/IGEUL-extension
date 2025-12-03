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

  // 기본값 정의
  const DEFAULTS = {
    size: 100,
    lineHeight: 1.5,
    letterSpacing: 0,
    widthPercent: 100,
    align: 'left',
    font: 'default',
    textColor: '#222222',
    contentBgColor: '#FFFFFF',
  };

  // 폰트 상태 변수
  let currentSize = DEFAULTS.size;
  let currentLineHeight = DEFAULTS.lineHeight;
  let currentLetterSpacing = DEFAULTS.letterSpacing;
  let currentWidth; // 초기 너비는 슬라이더 핸들러에서 계산
  let currentAlign = DEFAULTS.align;
  let currentFont = DEFAULTS.font;
  let currentTextColor = DEFAULTS.textColor;
  let currentContentBgColor = DEFAULTS.contentBgColor;

  // 프리셋 정의
  const presets = {
    'large-text': {
      size: 125,
      widthPercent: 110,
    },
    'dark-mode': {
      textColor: '#e0e0e0',
      bgColor: '#1e1e1e',
    },
    'eye-saver': {
      textColor: '#335033',
      bgColor: '#e9f5e9',
    },
  };


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
      article, main, .content, #content, .focus-content {
        width: ${currentWidth}px !important;
        max-width: none !important;
        margin: 0 auto !important;
        padding: 60px 40px !important;
        background: ${currentContentBgColor} !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
      }
      
      /* 텍스트 기본값 */
      .focus-content * {
        font-family: ${selectedFont} !important;
        font-size: ${baseFontSize}px !important;
        line-height: ${currentLineHeight} !important;
        letter-spacing: ${currentLetterSpacing}px !important;
        text-align: ${currentAlign} !important;
        color: ${currentTextColor} !important;
      }

      /* 제목 색상 오버라이드 */
      .focus-content .focus-title {
        color: ${currentTextColor} !important;
      }

      /* 제목 크기 */
      .focus-content h1 { font-size: ${baseFontSize * 1.75}px !important; margin: 1.5em 0 0.5em !important; }
      .focus-content h2 { font-size: ${baseFontSize * 1.5}px !important; margin: 1.3em 0 0.5em !important; }
      .focus-content h3 { font-size: ${baseFontSize * 1.25}px !important; margin: 1.2em 0 0.5em !important; }

      .focus-content p { margin-bottom: 1em !important; }

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
  
  // 스타일 초기화 함수
  function resetStyles() {
    // Dispatch events on controls to reset them to default values
    const sizeSlider = document.getElementById('size-slider');
    sizeSlider.value = DEFAULTS.size;
    sizeSlider.dispatchEvent(new Event('input', { bubbles: true }));

    const lineHeightSlider = document.getElementById('lineheight-slider');
    lineHeightSlider.value = DEFAULTS.lineHeight;
    lineHeightSlider.dispatchEvent(new Event('input', { bubbles: true }));

    const letterSpacingSlider = document.getElementById('letterspacing-slider');
    letterSpacingSlider.value = DEFAULTS.letterSpacing;
    letterSpacingSlider.dispatchEvent(new Event('input', { bubbles: true }));
    
    const widthSlider = document.getElementById('width-slider');
    widthSlider.value = DEFAULTS.widthPercent;
    widthSlider.dispatchEvent(new Event('input', { bubbles: true }));
    
    const textColorPicker = document.getElementById('text-color-picker');
    textColorPicker.value = DEFAULTS.textColor;
    textColorPicker.dispatchEvent(new Event('input', { bubbles: true }));

    const bgColorPicker = document.getElementById('bg-color-picker');
    bgColorPicker.value = DEFAULTS.contentBgColor;
    bgColorPicker.dispatchEvent(new Event('input', { bubbles: true }));
    
    const fontSelect = document.getElementById('font-select');
    fontSelect.value = DEFAULTS.font;
    fontSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    document.querySelectorAll('.align-btn').forEach(btn => {
        const isActive = btn.dataset.align === DEFAULTS.align;
        btn.classList.toggle('active', isActive);
        if(isActive) {
           currentAlign = DEFAULTS.align;
        }
    });
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
    const percent = Number(e.target.value);  // 50~120

    const sliderMin = 50;
    const sliderMax = 120;

    // 0~1 비율로 정규화
    const ratio = (percent - sliderMin) / (sliderMax - sliderMin);

    const minWidth = 300;
    const maxWidth = 960;

    // 실제 width(px)
    currentWidth = minWidth + ratio * (maxWidth - minWidth);

    updateStyles();

    // UI에는 퍼센트 그대로 표시
    document.getElementById('width-value').textContent = `${percent}%`;
});


  // ✏️ 폰트 변경
  document.getElementById('font-select')?.addEventListener('change', (e) => {
    currentFont = e.target.value;
    updateStyles();
  });

  // 🎨 텍스트 색상 변경
  document.getElementById('text-color-picker')?.addEventListener('input', (e) => {
    currentTextColor = e.target.value;
    updateStyles();
  });

  // 🎨 배경 색상 변경
  document.getElementById('bg-color-picker')?.addEventListener('input', (e) => {
    currentContentBgColor = e.target.value;
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

  // ✨ 프리셋 버튼
  document.querySelectorAll('.preset-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
      resetStyles(); // 먼저 모든 스타일을 기본값으로 초기화

      const presetName = btn.dataset.preset;
      const preset = presets[presetName];
      if (!preset) return;

      // 선택된 프리셋의 값들만 다시 적용
      if (preset.size !== undefined) {
        const slider = document.getElementById('size-slider');
        slider.value = preset.size;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (preset.widthPercent !== undefined) {
        const slider = document.getElementById('width-slider');
        slider.value = preset.widthPercent;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (preset.textColor !== undefined) {
        const picker = document.getElementById('text-color-picker');
        picker.value = preset.textColor;
        picker.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (preset.bgColor !== undefined) {
        const picker = document.getElementById('bg-color-picker');
        picker.value = preset.bgColor;
        picker.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  // 초기 스타일 반영
  // 너비 슬라이더의 초기값을 수동으로 한 번 호출하여 currentWidth를 설정
  document.getElementById('width-slider').dispatchEvent(new Event('input', { bubbles: true }));
  updateStyles();
}