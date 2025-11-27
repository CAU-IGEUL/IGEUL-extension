// src/modules/dictionary.js

import { requestDictionaryApi, getDictionaryResult } from "./api.js";

// 전역 상태
let dictionaryData = [];
let tooltipEl = null;
let vocabMode = false;        // 🔥 단어장 모드 ON/OFF
let originalHtmlBackup = "";  // 🔥 원본 HTML 저장

// ===================================================================================
// 📌 ReaderMode에서 호출할 초기화 함수 (단어장 모드 OFF 상태로 시작)
// ===================================================================================
export async function initDictionaryAnalysis(paragraphs) {
  try {
    const { idToken } = await chrome.storage.local.get("idToken");

    // 서버에서 요구하는 형태 그대로 보냄
    console.log("📤 Dictionary 요청 Body:", paragraphs);

    const res = await requestDictionaryApi(paragraphs, idToken);

    console.log("📩 Dictionary API 응답:", res);   // ⭐ 복구한 부분

    const jobId = res.jobId;
    if (!jobId) {
      console.error("Dictionary jobId 없음. 응답:", res);
      return;
    }

    dictionaryData = await pollDictionaryResult(jobId, idToken);

    console.log("📘 Dictionary Data 완료:", dictionaryData);  // ⭐ 데이터 확인

    initVocabToggle();
  } catch (err) {
    console.error("❌ Dictionary API 실패:", err);
  }
}




// ===================================================================================
// 📌 Polling
// ===================================================================================
function pollDictionaryResult(jobId, idToken) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const result = await getDictionaryResult(jobId, idToken);
      console.log("⏳ [Dictionary Polling]", result.status);

      if (result.status === "completed") {
        clearInterval(interval);
        resolve(result.data);
      }
      if (result.status === "failed") {
        clearInterval(interval);
        reject(result.error);
      }
    }, 3000);
  });
}


// ===================================================================================
// 📌 단어장 모드 토글 (버튼으로 ON/OFF 가능)
// ===================================================================================
function initVocabToggle() {
  const btn = document.getElementById("vocab-btn");
  const content = document.querySelector(".focus-content");

  if (!btn || !content) return;

  btn.addEventListener("click", async () => {
    vocabMode = !vocabMode;
    updateVocabButtonUI(btn, vocabMode);

    if (vocabMode) {
      console.log("📘 단어장 모드 ON");

      if (!dictionaryData || dictionaryData.length === 0) {
        console.log("📘 사전 데이터 없음 → 초기 paragraphs 재사용");

        const paragraphs = Array.from(document.querySelectorAll(".focus-content p"))
          .map((p, idx) => ({
            id: idx + 1,
            text: p.innerText.trim()
          }))
          .filter(p => p.text !== "");

        const { idToken } = await chrome.storage.local.get("idToken");

        const res = await requestDictionaryApi({ paragraphs }, idToken);
        const jobId = res.jobId;
        dictionaryData = await pollDictionaryResult(jobId, idToken);
      }


      if (!originalHtmlBackup) {
        originalHtmlBackup = content.innerHTML;
      }

      wrapWordsInTextNodes(content, dictionaryData);
      createTooltip();
      attachDictionaryEvents(dictionaryData);

    } else {
      console.log("📘 단어장 모드 OFF");
      content.innerHTML = originalHtmlBackup;
    }
  });
}


// ===================================================================================
// 📌 텍스트 노드들만 단어 감싸기 — A 방식 (부분 매칭 허용)
// ===================================================================================
function wrapWordsInTextNodes(root, dictionaryData) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  nodes.forEach(textNode => {
    const parent = textNode.parentNode;
    let text = textNode.nodeValue;

    dictionaryData.forEach(item => {
      const word = item.term;
      if (!word || word.trim() === "") return;

      // Regex escape only
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // A 방식: 부분 매칭 허용
      const regex = new RegExp(escapedWord, "g");

      text = text.replace(regex, match => {
        return `<span class="dictionary-word" data-term="${match}">${match}</span>`;
      });
    });

    if (text !== textNode.nodeValue) {
      const temp = document.createElement("span");
      temp.innerHTML = text;

      parent.replaceChild(temp, textNode);
      while (temp.firstChild) parent.insertBefore(temp.firstChild, temp);
      parent.removeChild(temp);
    }
  });
}


// ===================================================================================
// 📌 Tooltip 생성
// ===================================================================================
function createTooltip() {
  tooltipEl = document.createElement("div");
  tooltipEl.id = "dict-tooltip";
  tooltipEl.style.position = "fixed";
  tooltipEl.style.padding = "6px 10px";
  tooltipEl.style.background = "white";
  tooltipEl.style.color = "black";
  tooltipEl.style.border = "1px solid #ddd";
  tooltipEl.style.borderRadius = "6px";
  tooltipEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  tooltipEl.style.zIndex = "99999999999";
  tooltipEl.style.pointerEvents = "none";
  tooltipEl.style.maxWidth = "260px";
  tooltipEl.style.lineHeight = "1.5";
  tooltipEl.style.display = "none";

  document.body.appendChild(tooltipEl);
}


// ===================================================================================
// 📌 Tooltip 표시/숨기기
// ===================================================================================
function showTooltip(event, text) {
  tooltipEl.innerText = text;

  tooltipEl.style.left = event.clientX + 12 + "px";
  tooltipEl.style.top = event.clientY + 18 + "px";
  tooltipEl.style.display = "block";
}

function hideTooltip() {
  tooltipEl.style.display = "none";
}


// ===================================================================================
// 📌 오른쪽 패널 (longDefinition + image)
// ===================================================================================
function openWordPanel(item) {
  let panel = document.getElementById("word-meaning-panel");

  const html = `
    <h3>${item.term}</h3>
    <p>${item.longDefinition}</p>
    ${item.imageUrl ? `<img class="dict-image" src="${item.imageUrl}">` : ""}
  `;

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "word-meaning-panel";
    panel.classList.add("show");
    panel.innerHTML = `
      <div class="word-panel-header">
        📘 단어 정보
        <button id="close-word-panel">✖</button>
      </div>
      <div id="word-panel-body">${html}</div>
    `;
    document.body.appendChild(panel);

    document
      .getElementById("close-word-panel")
      .addEventListener("click", () => panel.classList.remove("show"));
  } else {
    panel.classList.add("show");
    document.getElementById("word-panel-body").innerHTML = html;
  }
}


// ===================================================================================
// 📌 단어 hover / click 이벤트
// ===================================================================================
function attachDictionaryEvents(dictionaryData) {
  document.querySelectorAll(".dictionary-word").forEach(el => {
    const term = el.dataset.term;
    const item = dictionaryData.find(d => d.term === term);
    if (!item) return;

    el.addEventListener("mouseenter", e => showTooltip(e, item.shortDefinition));
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("click", () => openWordPanel(item));
  });
}

function updateVocabButtonUI(btn, isOn) {
  if (isOn) {
    btn.style.background = "#facc15";     // 노란색
    btn.style.color = "#111";
    btn.style.border = "1px solid #d4a317";
    btn.textContent = "📘 단어장 ON";
  } else {
    btn.style.background = "#f3f4f6";     // 원래 회색
    btn.style.color = "#333";
    btn.style.border = "1px solid #d1d5db";
    btn.textContent = "🔍 단어장";
  }
}

export { wrapWordsInTextNodes, attachDictionaryEvents, createTooltip };
export { dictionaryData, vocabMode };


