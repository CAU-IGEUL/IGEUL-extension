// src/modules/readerMode.js

import { loadFonts, initFontController } from './changeTextStyle.js';
import { initReadingGuide } from './readingGuide.js';
import { getToolbarHTML } from '../styles/toolbarHTML.js';
import { applyToolbarStyles } from '../styles/toolbarCSS.js';
import { requestSimplifyText, getSimplificationReport } from "./api.js";
import {
  dictionaryData,
  vocabMode,
  initDictionaryAnalysis,
  wrapWordsInTextNodes,
  attachDictionaryEvents
} from "./dictionary.js";

/* -------------------------------------------------------
   메인 함수
------------------------------------------------------- */
export function renderReaderMode(dto) {
  /* -------- 문장 순화 로딩창 -------- */
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

  /* -------- 기본 초기화 -------- */
  document.body.innerHTML = "";

  // 순화/리포트 상태
  let originalParagraphs = [];     // 텍스트 문단 원본 배열 (이미지 제외)
  let simplifiedParagraphs = [];   // 서버에서 받은 순화 문단 배열 (텍스트 문단 기준)
  let lastJobId = null;            // 리포트 조회용 jobId
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

  // 보기 모드 라디오 이벤트
  const originRadio = document.getElementById("origin-only");
  const simplifiedRadio = document.getElementById("simplified-only");
  const compareRadio = document.getElementById("compare-view");

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
     - 서버로 보내는 문단 기준이 됨
  ------------------------------------------------------- */
  const textParagraphs = dto.paragraphs.filter(p => p.type === "text");
  originalParagraphs = textParagraphs.map(p => (p.content || "").trim());

  // 단어장 분석용 문단 (텍스트만)
  const dictionaryParagraphs = dto.paragraphs
    .filter(p => p.type === "text")
    .map((p, idx) => ({
      id: idx + 1,
      text: p.content
    }));
  // 🔍 단어장 분석 초기화 (서버 연동용)
  initDictionaryAnalysis(dictionaryParagraphs);

  /* -------------------------------------------------------
     🪄 문장 순화 실행
  ------------------------------------------------------- */
  document.getElementById("run-simplify")?.addEventListener("click", async () => {
    console.log("🪄 문장 순화 요청됨");
    showSimplifyLoading();

    try {
      const { idToken } = await chrome.storage.local.get("idToken");
      if (!idToken) {
        alert("로그인 정보가 없습니다. 먼저 로그인 후 다시 시도해주세요.");
        console.error("❌ idToken 없음");
        return;
      }

      // 서버에 보낼 문단 구조
      const paragraphsForAPI = originalParagraphs.map((text, idx) => ({
        id: idx + 1,
        text
      }));

      const res = await requestSimplifyText(dto.title, paragraphsForAPI, idToken);
      console.log("✨ 문장 순화 API 응답:", res);

      lastJobId = res.jobId;

      if (res.data && Array.isArray(res.data.simplified_paragraphs)) {
        // id 순서대로 정렬 후 텍스트만 배열로
        const sorted = [...res.data.simplified_paragraphs].sort((a, b) => a.id - b.id);
        simplifiedParagraphs = sorted.map(p => p.text || "");
      } else {
        console.warn("응답에 simplified_paragraphs가 없습니다:", res);
        simplifiedParagraphs = [];
      }

      currentMode = "simplified";
      renderParagraphs();

    } catch (err) {
      console.error("❌ 문장 순화 실패:", err);
      alert("문장 순화 중 오류가 발생했습니다.");
    } finally {
      hideSimplifyLoading();
    }
  });

  /* -------------------------------------------------------
     📊 리포트 조회
  ------------------------------------------------------- */
  document.getElementById("report-view")?.addEventListener("click", async () => {
    if (!lastJobId) {
      alert("먼저 문장 순화를 실행해주세요.");
      return;
    }

    try {
      const { idToken } = await chrome.storage.local.get("idToken");
      if (!idToken) {
        alert("로그인 정보가 없습니다. 먼저 로그인 후 다시 시도해주세요.");
        console.error("❌ idToken 없음 (리포트 조회)");
        return;
      }

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

    } catch (e) {
      console.error("❌ 리포트 조회 실패:", e);
      alert("리포트 조회 중 오류가 발생했습니다.");
    }
  });

  /* -------------------------------------------------------
     🔥 문단 렌더링 함수
     - dto.paragraphs 순서를 기준으로
     - 이미지 유지 + 텍스트만 순화/비교
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
          const orig = (p.content || "").replace(/\n/g, "<br>");
          html += `<p>${orig}</p>`;
        }
      });
    }

    /* 2) 순화된 문장만 보기 */
    else if (currentMode === "simplified") {
      // 🔹 원본 이미지들은 그대로 한 번 쭉 보여주고
      dto.paragraphs.forEach(p => {
        if (p.type === "image") {
          html += `<img src="${p.content}" alt="image" class="focus-image">`;
        }
      });

      // 🔹 그 아래에 서버에서 받은 순화 문단 전체를 순서대로 전부 출력
      simplifiedParagraphs.forEach(text => {
        const simp = (text || "").replace(/\n/g, "<br>");
        html += `<p>${simp}</p>`;
      });
    }

    /* 3) 원문 같이 보기 (비교 모드) */
    else if (currentMode === "compare") {
      // 왼쪽: 원본 기사 전체 (텍스트 + 이미지)
      let origHtml = "";
      dto.paragraphs.forEach(p => {
        if (p.type === "image") {
          origHtml += `<img src="${p.content}" alt="image" class="focus-image">`;
        } else {
          origHtml += `<p>${(p.content || "").replace(/\n/g, "<br>")}</p>`;
        }
      });

      // 오른쪽: 순화 텍스트 전체 (이미지는 서버가 모르니까 텍스트만)
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

    // 📘 단어장 모드가 켜져 있으면 다시 하이라이트 적용
    if (vocabMode) {
      const target = document.querySelector(".focus-content");
      if (target && dictionaryData) {
        wrapWordsInTextNodes(target, dictionaryData);
        attachDictionaryEvents(dictionaryData);
      }
    }
  }


  /* -------------------------------------------------------
     📊 리포트 모달 UI
  ------------------------------------------------------- */
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

        <p><strong>가독성 향상:</strong> ${summary.readability_improvement_percent ?? "-"}%</p>
        <p><strong>문자 수 감소:</strong> ${summary.char_count_reduction_percent ?? "-"}%</p>

        <p style="margin-top:12px;"><strong>핵심 메시지:</strong></p>
        <p style="font-size:14px; color:#374151;">
          ${summary.key_message ?? "서버에서 전달된 핵심 메시지가 없습니다."}
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
    document.getElementById("close-report-modal")?.addEventListener("click", () => modal.remove());
  }

  /* -------------------------------------------------------
     📚 리더모드 스타일
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
} // renderReaderMode 끝

export default renderReaderMode;
