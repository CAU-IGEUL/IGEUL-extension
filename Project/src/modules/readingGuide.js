// src/modules/readingGuide.js
// 리딩 가이드 전용 모듈

export function initReadingGuide() {
  console.log("✅ initReadingGuide() 실행됨");

  // 리딩 가이드 상태 변수
  let readingGuideEnabled = false;
  let readingGuidePosition = window.innerHeight / 2;
  let guideColor = '#7a7d81ff';
  let guideOpacity = 15;
  let guideHeight = 60;

  const guide = document.getElementById('reading-guide');
  if (!guide) {
    console.warn('⚠️ reading-guide 요소를 찾을 수 없습니다.');
    return;
  }

  /* ===================================
     스타일 업데이트 함수
  =================================== */
  function updateReadingGuideStyle() {
    const r = parseInt(guideColor.slice(1, 3), 16);
    const g = parseInt(guideColor.slice(3, 5), 16);
    const b = parseInt(guideColor.slice(5, 7), 16);
    guide.style.background = `rgba(${r}, ${g}, ${b}, ${guideOpacity / 100})`;
    guide.style.height = `${guideHeight}px`;
  }

  function updateReadingGuidePosition() {
    if (!readingGuideEnabled) return;
    guide.style.top = `${readingGuidePosition}px`;
  }

  /* ===================================
     이벤트 리스너 등록
  =================================== */

  // ✅ 체크박스 ON/OFF
  document.getElementById('display-ruler-checkbox')?.addEventListener('change', (e) => {
    readingGuideEnabled = e.target.checked;
    guide.style.display = readingGuideEnabled ? 'block' : 'none';

    if (readingGuideEnabled) {
      const maxPosition = window.innerHeight - guideHeight;
      document.getElementById('guide-position-slider').max = maxPosition;

      readingGuidePosition = window.innerHeight / 2;
      document.getElementById('guide-position-slider').value = readingGuidePosition;
      document.getElementById('guide-position-value').textContent = `${Math.round(readingGuidePosition)}px`;

      updateReadingGuideStyle();
      updateReadingGuidePosition();
    }
  });

  // 🎨 색상 선택
  document.getElementById('guide-color-picker')?.addEventListener('input', (e) => {
    guideColor = e.target.value;
    updateReadingGuideStyle();
  });

  // 🎚 투명도 조절
  document.getElementById('guide-opacity-slider')?.addEventListener('input', (e) => {
    guideOpacity = e.target.value;
    document.getElementById('guide-opacity-value').textContent = `${guideOpacity}%`;
    updateReadingGuideStyle();
  });

  // 🎚 높이 조절
  document.getElementById('guide-height-slider')?.addEventListener('input', (e) => {
    guideHeight = e.target.value;
    document.getElementById('guide-height-value').textContent = `${guideHeight}px`;

    if (readingGuideEnabled) {
      const maxPosition = window.innerHeight - guideHeight;
      document.getElementById('guide-position-slider').max = maxPosition;

      if (readingGuidePosition > maxPosition) {
        readingGuidePosition = maxPosition;
        document.getElementById('guide-position-slider').value = readingGuidePosition;
        document.getElementById('guide-position-value').textContent = `${Math.round(readingGuidePosition)}px`;
        updateReadingGuidePosition();
      }
    }

    updateReadingGuideStyle();
  });

  // 🎚 위치 조절 슬라이더
  document.getElementById('guide-position-slider')?.addEventListener('input', (e) => {
    readingGuidePosition = parseInt(e.target.value);
    document.getElementById('guide-position-value').textContent = `${readingGuidePosition}px`;
    updateReadingGuidePosition();
  });

  // 🖱️ Ctrl + 마우스 휠 이동
  document.addEventListener('wheel', (e) => {
    if (!readingGuideEnabled || !e.ctrlKey) return;

    e.preventDefault();
    readingGuidePosition += e.deltaY * 0.3;
    const minPos = 100;
    const maxPos = window.innerHeight - guideHeight;
    readingGuidePosition = Math.max(minPos, Math.min(maxPos, readingGuidePosition));

    document.getElementById('guide-position-slider').value = readingGuidePosition;
    document.getElementById('guide-position-value').textContent = `${Math.round(readingGuidePosition)}px`;

    updateReadingGuidePosition();
  }, { passive: false });

  // 📐 창 크기 변경 시 위치 재조정
  window.addEventListener('resize', () => {
    if (readingGuideEnabled) {
      const maxPosition = window.innerHeight - guideHeight;
      document.getElementById('guide-position-slider').max = maxPosition;

      readingGuidePosition = Math.min(readingGuidePosition, maxPosition);
      document.getElementById('guide-position-slider').value = readingGuidePosition;
      document.getElementById('guide-position-value').textContent = `${Math.round(readingGuidePosition)}px`;

      updateReadingGuidePosition();
    }
  });

  // 초기 위치 적용
  updateReadingGuidePosition();
  updateReadingGuideStyle();
}