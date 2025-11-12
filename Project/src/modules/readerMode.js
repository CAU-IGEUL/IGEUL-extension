// src/modules/readerMode.js

import { loadFonts, initFontController } from './changeTextStyle.js';
import { initReadingGuide } from './readingGuide.js';
import { getToolbarHTML } from '../styles/toolbarHTML.js';
import { applyToolbarStyles } from '../styles/toolbarCSS.js';

export function renderReaderMode(dto) {
  document.body.innerHTML = "";

  loadFonts();
  const style = applyToolbarStyles();
  document.head.appendChild(style);

  const toolbar = document.createElement("div");
  toolbar.id = "custom-toolbar";
  toolbar.innerHTML = getToolbarHTML();
  document.body.prepend(toolbar);

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

  // ✅ 문장 순화 패널 생성
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
    </div>

    <div class="right-section">
      <button id="report-view">📊 리포트 보기</button>
    </div>
  `;
  document.body.prepend(simplifyPanel); // toolbar 바로 아래 삽입

  // ✅ 문장 순화 버튼 클릭 시 패널 토글
  const simplifyBtn = document.getElementById("simplify-btn");
  simplifyBtn?.addEventListener("click", () => {
    simplifyPanel.classList.toggle("show");
  });

  document.getElementById("run-simplify")?.addEventListener("click", () => {
    console.log(" 문장 순화 요청됨 (run-simplify clicked)");
  });

  document.getElementById("report-view")?.addEventListener("click", () => {
    console.log("📊 리포트 요청됨 (report-view clicked)");
  });



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

  // ✅ 단어장 버튼 클릭 시 단어장 모드 실행
  document.getElementById("vocab-btn")?.addEventListener("click", activateWordMode);


  initFontController();
  initReadingGuide();

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
      max-width: 720px;
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
    .focus-title * {
      font-size: inherit !important;
      font-weight: inherit !important;
      color: inherit !important;
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
      top: 60px; /* 기존보다 약간 위로 */
      left: 0;
      right: 0;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      justify-content: center; /* 전체를 가운데로 */
      align-items: center;
      gap: 60px; /* 버튼 그룹 간 간격 */
      padding: 18px 40px; /* 위아래 여백 줄임 */
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      z-index: 999999;
    }

    .simplify-panel.show {
      transform: translateY(0);
    }

    /* 버튼 스타일 */
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

    /* 보기 모드 섹션 (세로 정렬) */
    .center-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start; /* 왼쪽 정렬 */
    }

    .center-section label {
      font-size: 15px;
      cursor: pointer;
    }

    /* 단어장 하이라이트 */
    .highlight-word {
      background: none;
      color: #111;
      border-bottom: 2px solid #facc15; /* 노란 밑줄 */
      transition: border-color 0.2s, transform 0.15s;
      cursor: pointer;
    }

    .highlight-word:hover {
      border-color: #f59e0b; /* hover 시 조금 더 진한 노란색 */
      transform: scale(1.05);
    }



      /* 오른쪽 단어 뜻 패널 */
    #word-meaning-panel {
      position: fixed;
      top: 70px;
      right: -320px; /* 처음엔 숨김 상태 */
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
  `;
  document.head.appendChild(readerStyle);

  exitBtn?.addEventListener("click", () => {
    const content = document.querySelector(".focus-content");
    content.style.animation = "fadeOut 0.4s ease forwards";
    setTimeout(() => location.reload(), 400);
  });
}

let isVocabMode = false;
let wordPanel; // 패널 전역 참조

function activateWordMode() {
  const content = document.querySelector(".focus-content");
  if (!content) return;

  // 이미 단어장 모드일 경우 해제
  if (isVocabMode) {
    content.innerHTML = content.dataset.originalHtml || content.innerHTML;
    if (wordPanel) wordPanel.remove(); // 패널 제거
    isVocabMode = false;
    console.log("단어장 모드 종료");
    return;
  }

  // 모드 ON
  console.log("단어장 모드 실행됨");
  content.dataset.originalHtml = content.innerHTML;

  //Test용
  const difficultWords = [
    { word: "의사결정", meaning: "어떤 문제에 대해 판단을 내리는 행위" },
    { word: "아이폰", meaning: "예시: 애플에서 만든 핸드폰" }
  ];

  let html = content.innerHTML;
  difficultWords.forEach(({ word, meaning }) => {
    const regex = new RegExp(`(${word})`, "g");
    html = html.replace(
      regex,
      `<span class="highlight-word" data-meaning="${meaning}">$1</span>`
    );
  });
  content.innerHTML = html;

  // 👉 오른쪽 뜻 패널 생성
  wordPanel = document.createElement("div");
  wordPanel.id = "word-meaning-panel";
  wordPanel.innerHTML = `
    <div class="word-panel-header">
      <span>📘 단어 사전</span>
      <button id="close-word-panel">✖</button>
    </div>
    <div class="word-panel-body">
      <h3 id="word-title">단어를 선택하세요</h3>
      <p id="word-meaning"></p>
    </div>
  `;
  document.body.appendChild(wordPanel);

  // 단어 클릭 이벤트
  document.querySelectorAll(".highlight-word").forEach(span => {
    span.addEventListener("click", () => {
      document.getElementById("word-title").textContent = span.textContent;
      document.getElementById("word-meaning").textContent = span.dataset.meaning;
      wordPanel.classList.add("show");
    });
  });

  // 닫기 버튼
  document.getElementById("close-word-panel").addEventListener("click", () => {
    wordPanel.classList.remove("show");
  });

  isVocabMode = true;
}

