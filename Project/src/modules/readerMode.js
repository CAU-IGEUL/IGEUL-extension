// src/modules/readerMode.js

import { loadFonts, initFontController } from './changeTextStyle.js';
import { initReadingGuide } from './readingGuide.js';
import { getToolbarHTML } from '../styles/toolbarHTML.js';
import { applyToolbarStyles } from '../styles/toolbarCSS.js';
import {
  dictionaryData,
  vocabMode,
  initDictionaryAnalysis,
  wrapWordsInTextNodes,
  attachDictionaryEvents
} from "./dictionary.js";
import { initSimplifyFeature } from "./simplify.js"; // 🔥 새로 추가된 부분
import { initSummary } from './summary.js';
import { initProfileSettings } from './profileSettings.js';


/* -------------------------------------------------------
   메인 함수
------------------------------------------------------- */
export function renderReaderMode(dto) {
  
  /* -------- 기본 초기화 -------- */
  document.body.innerHTML = "";

  // 순화/리포트 상태
  let originalParagraphs = [];     // 텍스트 문단 원본 배열
  let simplifiedParagraphs = [];   // 서버에서 받은 순화 문단 배열
  let currentMode = "original";    // original | simplified | compare

  loadFonts();
  const style = applyToolbarStyles();
  document.head.appendChild(style);

  /* -------- Toolbar -------- */
  const toolbar = document.createElement("div");
  toolbar.id = "custom-toolbar";
  toolbar.innerHTML = getToolbarHTML();
  document.body.prepend(toolbar);

  const vocabBtn = document.getElementById("vocab-btn");
  if (vocabBtn) vocabBtn.textContent = "🔍 단어장";

  const extractBtn = document.getElementById("extract-btn");
  const readerBtn = document.getElementById("reader-btn");
  const exitBtn = document.getElementById("exit-reader");

  if (extractBtn) extractBtn.style.display = "none";
  if (readerBtn) readerBtn.style.display = "none";
  if (exitBtn) {
    exitBtn.style.display = "inline-block";
    exitBtn.style.background = "#ef4444";
    exitBtn.style.color = "white";
    exitBtn.style.border = "none";
  }

  /* -------------------------------------------------------
     🔥 문장 순화 패널 UI
  ------------------------------------------------------- */
  const simplifyPanel = document.createElement("div");
  simplifyPanel.id = "simplify-panel";
  simplifyPanel.className = "simplify-panel";
  simplifyPanel.innerHTML = `
    <div class="left-section">
      <button id="run-simplify">▶ 실행</button>
    </div>

    <div class="center-section">
      <label><input type="radio" name="view-mode" id="simplified-only" checked> 순화된 문장만 보기</label>
      <label><input type="radio" name="view-mode" id="compare-view"> 원문 같이 보기</label>
      <label><input type="radio" name="view-mode" id="origin-only"> 원문만 보기</label>
    </div>

    <div class="right-section">
      <button id="report-view">📊 리포트 보기</button>
    </div>
  `;
  document.body.prepend(simplifyPanel);

  // 문장 순화 버튼 → 패널 토글
  const simplifyBtn = document.getElementById("simplify-btn");
  simplifyBtn?.addEventListener("click", () => {
    simplifyPanel.classList.toggle("show");
  });

  /* -------------------------------------------------------
     📘 리딩 가이드 & 설정 패널
  ------------------------------------------------------- */
  const readingGuide = document.createElement('div');
  readingGuide.id = 'reading-guide';
  readingGuide.style.display = 'none';
  document.body.appendChild(readingGuide);

  document.getElementById('edit-icon')?.addEventListener('click', () => {
    const panel = document.getElementById('settings-panel');
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      document.body.style.paddingTop = '270px';
    } else {
      panel.style.display = 'none';
      document.body.style.paddingTop = '70px';
    }
  });

  document.getElementById('reading-guide-toggle')?.addEventListener('click', () => {
    const guidePanel = document.getElementById('guide-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const toggleBtn = document.getElementById('reading-guide-toggle');

    if (guidePanel.style.display === 'none') {
      guidePanel.style.display = 'block';
      settingsPanel.style.display = 'none';
      toggleBtn.classList.add('active');
      document.body.style.paddingTop = '270px';
    } else {
      guidePanel.style.display = 'none';
      toggleBtn.classList.remove('active');
      document.body.style.paddingTop = '70px';
    }
  });

  initFontController();
  initReadingGuide();
  initSummary();
  initProfileSettings();


  /* -------------------------------------------------------
     📄 본문 영역 생성 (이미지 + 텍스트)
  ------------------------------------------------------- */
  const container = document.createElement("div");
  container.id = "focus-reader";
  container.innerHTML = `
    <div class="focus-content">
      <h1 class="focus-title">${dto.title}</h1>
      ${dto.paragraphs
        .map(p =>
          p.type === "image"
            ? `<img src="${p.content}" alt="image" class="focus-image">`
            : `<p>${p.content.replace(/\n/g, "<br>")}</p>`
        )
        .join("")}
    </div>
  `;
  document.body.appendChild(container);


  /* -------------------------------------------------------
     🔥 원문 문단 배열 구성 (텍스트 문단만)
     - simplify.js로 넘겨줄 originalParagraphs
  ------------------------------------------------------- */
  const textParagraphs = dto.paragraphs.filter(p => p.type === "text");
  originalParagraphs = textParagraphs.map(p => (p.content || "").trim());

  /* -------------------------------------------------------
     🔍 단어장 분석 초기화
  ------------------------------------------------------- */
  const dictionaryParagraphs = textParagraphs.map((p, idx) => ({
    id: idx + 1,
    text: p.content
  }));
  initDictionaryAnalysis(dictionaryParagraphs);


  /* -------------------------------------------------------
     🪄 문장 순화 기능 등록 (simplify.js)
  ------------------------------------------------------- */
  initSimplifyFeature({
    dto,
    originalParagraphs,

    onUpdateSimplified: (newTexts) => {
      simplifiedParagraphs = newTexts;
      renderParagraphs();
    },

    onModeChange: (mode) => {
      currentMode = mode;
      renderParagraphs();
    }
  });


  /* -------------------------------------------------------
     🔥 문단 렌더링 함수
  ------------------------------------------------------- */
  function renderParagraphs() {
    const contentBox = document.querySelector(".focus-content");
    if (!contentBox) return;

    let html = `<h1 class="focus-title">${dto.title}</h1>`;

    /* 1) 원문만 보기 */
    if (currentMode === "original") {
      dto.paragraphs.forEach(p => {
        if (p.type === "image") {
          html += `<img src="${p.content}" alt="image" class="focus-image">`;
        } else {
          html += `<p>${(p.content || "").replace(/\n/g, "<br>")}</p>`;
        }
      });
    }

    /* 2) 순화된 문장만 보기 */
    else if (currentMode === "simplified") {
      dto.paragraphs.forEach(p => {
        if (p.type === "image") {
          html += `<img src="${p.content}" alt="image" class="focus-image">`;
        }
      });

      simplifiedParagraphs.forEach(text => {
        html += `<p>${(text || "").replace(/\n/g, "<br>")}</p>`;
      });
    }

    /* 3) 비교 모드 */
    else if (currentMode === "compare") {
      let origHtml = "";
      dto.paragraphs.forEach(p => {
        if (p.type === "image") {
          origHtml += `<img src="${p.content}" alt="image" class="focus-image">`;
        } else {
          origHtml += `<p>${(p.content || "").replace(/\n/g, "<br>")}</p>`;
        }
      });

      let simpHtml = "";
      simplifiedParagraphs.forEach(text => {
        simpHtml += `<p>${(text || "").replace(/\n/g, "<br>")}</p>`;
      });

      html += `
        <div class="compare-block">
          <div class="compare-original">${origHtml}</div>
          <div class="compare-simplified">${simpHtml}</div>
        </div>
      `;
    }

    contentBox.innerHTML = html;

    // 📘 단어장 모드 적용
    if (vocabMode) {
      const target = document.querySelector(".focus-content");
      wrapWordsInTextNodes(target, dictionaryData);
      attachDictionaryEvents(dictionaryData);
    }
  }


  /* -------------------------------------------------------
     ❌ Exit 버튼
  ------------------------------------------------------- */
  exitBtn?.addEventListener("click", () => {
    const content = document.querySelector(".focus-content");
    if (content) {
      content.style.animation = "fadeOut 0.4s ease forwards";
      setTimeout(() => location.reload(), 400);
    } else {
      location.reload();
    }
  });



  /* -------------------------------------------------------
     📚 스타일 (통째로 유지)
  ------------------------------------------------------- */
  const readerStyle = document.createElement("style");
  readerStyle.textContent = `
    body {
      margin: 0;
      background: #f5f5f5;
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.7;
      color: #222;
    }

    .focus-content {
      background: white;
      margin: 120px auto 60px;
      padding: 60px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      opacity: 0;
      transform: translateY(10px);
      animation: fadeIn 0.5s ease forwards;
      text-align: left;
    }

    .focus-title {
      text-align: center !important;
      font-size: 28px !important;
      font-weight: 700 !important;
      margin-bottom: 2rem !important;
      line-height: 1.3 !important;
      color: #111 !important;
    }

    .focus-content p {
      margin-bottom: 1em;
      font-size: 17px;
    }

    .focus-image {
      width: 100%;
      margin: 20px 0;
      border-radius: 8px;
    }

    /* Compare UI */
    .compare-block {
      display: flex;
      gap: 20px;
      padding: 12px 0;
    }
    .compare-original,
    .compare-simplified {
      flex: 1;
      padding: 12px 14px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 16px;
      line-height: 1.6;
      white-space: normal;
    }

    /* Fade animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }

    /* 문장 순화 패널 */
    .simplify-panel {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 60px;
      padding: 18px 40px;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      z-index: 999999;
    }

    .simplify-panel.show {
      transform: translateY(0);
    }

    .simplify-panel button {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .simplify-panel button:hover {
      background: #e5e7eb;
    }

    .center-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .center-section label {
      font-size: 15px;
      cursor: pointer;
    }

    /* 단어장 하이라이트 */
    .highlight-word {
      background: none;
      color: #111;
      border-bottom: 2px solid #facc15;
      transition: border-color 0.2s, transform 0.15s;
      cursor: pointer;
    }
    .highlight-word:hover {
      border-color: #f59e0b;
      transform: scale(1.05);
    }

    /* 단어 뜻 패널 */
    #word-meaning-panel {
      position: fixed;
      top: 70px;
      right: -320px;
      width: 300px;
      height: calc(100% - 70px);
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      transition: right 0.3s ease;
      z-index: 999999;
    }

    #word-meaning-panel.show {
      right: 0;
    }

    .word-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: 600;
    }

    #close-word-panel {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
    }

    .word-panel-body h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #111827;
    }

    .word-panel-body p {
      font-size: 15px;
      color: #374151;
      line-height: 1.5;
    }

    .dict-image {
      width: 100%;
      border-radius: 6px;
      margin-top: 12px;
    }

    .dictionary-word {
      cursor: pointer !important;
    }

    /* 순화 로딩창 */
    #simplify-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999999999;
    }

    .loading-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.4);
    }

    .loading-box {
      position: relative;
      z-index: 9999999999;
      background: white;
      padding: 24px 30px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .loader {
      width: 28px;
      height: 28px;
      border: 4px solid #ddd;
      border-top-color: #3b82f6;
      border-radius: 50%;
      margin: 0 auto 10px;
      animation: spin 0.9s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(readerStyle);
}

export default renderReaderMode;
