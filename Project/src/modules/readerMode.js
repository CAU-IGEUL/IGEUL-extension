// src/modules/readerMode.js

import { loadFonts, initFontController } from './changeTextStyle.js';
import { initReadingGuide } from './readingGuide.js';
import { getToolbarHTML } from '../styles/toolbarHTML.js';
import { applyToolbarStyles } from '../styles/toolbarCSS.js';
import { requestSimplifyText, getSimplificationReport } from "./api.js";

export function renderReaderMode(dto) {

  function showSimplifyLoading() {
    let loader = document.getElementById("simplify-loading");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "simplify-loading";
      loader.innerHTML = `
        <div class="loading-backdrop"></div>
        <div class="loading-box">
          <div class="loader"></div>
          <p>문장 순화 중입니다...</p>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  }

  function hideSimplifyLoading() {
    const loader = document.getElementById("simplify-loading");
    if (loader) loader.style.display = "none";
  }

  document.body.innerHTML = "";

  // 🔹 문장 순화/리포트용 상태
  let originalParagraphs = [];
  let simplifiedParagraphs = [];
  let lastJobId = null;
  let currentMode = "original";

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
      <label><input type="radio" name="view-mode" id="origin-only"> 원문만 보기</label>
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

  // ✅ 보기 모드 라디오 버튼 이벤트
  const originRadio = document.getElementById("origin-only");
  const simplifiedRadio = document.getElementById("simplified-only");
  const compareRadio = document.getElementById("compare-view");

  // 원문만 보기
  originRadio?.addEventListener("change", () => {
    currentMode = "original";
    renderParagraphs();
  });

  simplifiedRadio?.addEventListener("change", () => {
    currentMode = "simplified";
    renderParagraphs();
  });

  compareRadio?.addEventListener("change", () => {
    currentMode = "compare";
    renderParagraphs();
  });

  // 🪄 문장 순화 실행 버튼
  document.getElementById("run-simplify")?.addEventListener("click", async () => {
    console.log("🪄 문장 순화 요청됨");
    chrome.storage.local.get(null, res => console.log("🔥 local storage:", res));


    showSimplifyLoading();

    try {
      // 1) Firebase idToken 가져오기
      const { idToken } = await chrome.storage.local.get("idToken");

      // 2) 본문 원문 다시 읽어오기 (안전용)
      const content = document.querySelectorAll(".focus-content p");
      originalParagraphs = [...content].map(p => p.innerText);

      // 3) API에 전달하기 위해 문단 형태 맞추기
      const paragraphsForAPI = originalParagraphs.map((text, idx) => ({
        id: idx + 1,
        text
      }));

      // 4) API 호출
      const res = await requestSimplifyText(dto.title, paragraphsForAPI, idToken);

      console.log("✨ 문장 순화 API 응답:", res);

      // 5) jobId 저장 (리포트 조회용)
      lastJobId = res.jobId;

      // 6) 순화된 문장 저장
      if (res.data && Array.isArray(res.data.simplified_paragraphs)) {
        simplifiedParagraphs = res.data.simplified_paragraphs.map(p => p.text);
      } else {
        console.warn("응답에 simplified_paragraphs가 없습니다:", res);
        simplifiedParagraphs = [];
      }

      // 7) 보기모드 변경 후 렌더
      currentMode = "simplified";
      renderParagraphs();

    } catch (err) {
      console.error("❌ 문장 순화 실패:", err);
      alert("문장 순화 중 오류가 발생했습니다.");
    } finally {
      hideSimplifyLoading();
    }
  });

  // 📊 리포트 보기 버튼
  document.getElementById("report-view")?.addEventListener("click", async () => {
    console.log("📊 리포트 요청됨");

    if (!lastJobId) {
      alert("먼저 문장 순화를 실행해주세요.");
      return;
    }

    try {
      const { idToken } = await chrome.storage.local.get("idToken");

      const report = await getSimplificationReport(lastJobId, idToken);

      console.log("📊 리포트 결과:", report);

      if (report.status === "processing") {
        alert("리포트가 아직 생성 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (report.status === "completed" && report.analysis) {
        openReportModal(report.analysis);
      } else {
        alert("리포트 데이터가 올바르지 않습니다.");
        console.warn("예상치 못한 리포트 응답:", report);
      }

    } catch (error) {
      console.error("❌ 리포트 조회 실패:", error);
      alert("리포트 조회 중 오류가 발생했습니다.");
    }
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

  // 📄 본문 컨테이너 생성
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

  // 🔹 최초 originalParagraphs 초기화 (이미지 제외)
  const initialContent = document.querySelectorAll(".focus-content p");
  originalParagraphs = [...initialContent].map(p => p.innerText);

  // 🔁 문단 렌더링 함수 (보기 모드에 따라 다르게)
  function renderParagraphs() {
    const contentBox = document.querySelector(".focus-content");
    if (!contentBox) return;

    // ⬛ simplified 모드는 map() 안 쓰고 전체 단락 하나로
    if (currentMode === "simplified") {
      const merged = simplifiedParagraphs.join("<br><br>");
      contentBox.innerHTML = `
        <h1 class="focus-title">${dto.title}</h1>
        <p>${merged.replace(/\n/g, "<br>")}</p>
      `;
      return;
    }

    // ⬛ original, compare 모드만 기존 map() 사용
    contentBox.innerHTML = `
      <h1 class="focus-title">${dto.title}</h1>
      ${originalParagraphs.map((text, i) => {
        const orig = text?.replace(/\n/g, "<br>");
        const simpRaw = simplifiedParagraphs[i] || text;
        const simp = simpRaw?.replace(/\n/g, "<br>");

        if (currentMode === "original") {
          return `<p>${orig}</p>`;
        }

        if (currentMode === "compare") {
          return `
            <p>
              <strong>원문:</strong> ${orig}<br>
              <strong>순화:</strong> ${simp}
            </p>
        ` ;
        }

        // fallback
        return `<p>${orig}</p>`;
      }).join("")}
  ` ;
  }


  // 📊 리포트 모달 UI
  function openReportModal(analysis) {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.background = "rgba(0,0,0,0.45)";
    modal.style.zIndex = "99999999";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const summary = analysis.summary || {};

    modal.innerHTML = `
      <div style="
        background:white;
        padding:24px 28px;
        border-radius:12px;
        width:420px;
        max-height:70vh;
        overflow-y:auto;
        box-shadow:0 10px 30px rgba(0,0,0,0.18);
        font-family:'Noto Sans KR', sans-serif;
      ">
        <h2 style="margin-top:0; margin-bottom:16px; font-size:20px;">문장 순화 리포트</h2>

        <p style="margin:6px 0;">
          <strong>가독성 향상:</strong>
          ${summary.readability_improvement_percent ?? "-"}%
        </p>
        <p style="margin:6px 0;">
          <strong>문자 수 감소:</strong>
          ${summary.char_count_reduction_percent ?? "-"}%
        </p>
        <p style="margin:12px 0;">
          <strong>핵심 메시지:</strong><br>
          <span style="font-size:14px; color:#374151;">
            ${summary.key_message ?? "서버에서 전달된 핵심 메시지가 없습니다."}
          </span>
        </p>

        <div style="text-align:right; margin-top:18px;">
          <button id="close-report-modal" style="
            padding:8px 14px;
            background:#ef4444;
            color:white;
            border:none;
            border-radius:6px;
            cursor:pointer;
            font-size:14px;
          ">닫기</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("close-report-modal")?.addEventListener("click", () => {
      modal.remove();
    });
  }

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
    /* 오른쪽 단어 뜻 패널 */
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
      /* 로딩창 */
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

  exitBtn?.addEventListener("click", () => {
    const content = document.querySelector(".focus-content");
    if (content) {
      content.style.animation = "fadeOut 0.4s ease forwards";
      setTimeout(() => location.reload(), 400);
    } else {
      location.reload();
    }
  });
}

// 🔹 단어장 모드
let isVocabMode = false;
let wordPanel; // 패널 전역 참조

function activateWordMode() {
  const content = document.querySelector(".focus-content");
  if (!content) return;

  // 이미 단어장 모드일 경우 해제
  if (isVocabMode) {
    content.innerHTML = content.dataset.originalHtml || content.innerHTML;
    if (wordPanel) wordPanel.remove();
    isVocabMode = false;
    console.log("단어장 모드 종료");
    return;
  }

  // 모드 ON
  console.log("단어장 모드 실행됨");
  content.dataset.originalHtml = content.innerHTML;

  // Test용 어려운 단어 목록
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
