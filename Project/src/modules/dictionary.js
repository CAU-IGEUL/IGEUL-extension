// src/modules/dictionary.js

import { requestDictionaryApi, getDictionaryResult } from "./api.js"; // Keep requestDictionaryApi import for now if needed elsewhere or for future uncommenting

// 전역 상태
let dictionaryData = [];
let dictionaryJobId = null; // To hold the job ID
let tooltipEl = null;
let toastEl = null; // 🍞 Toast Element
let vocabMode = false;
let originalHtmlBackup = "";
let vocabToggleInitialized = false; // 🔥 Listener guard

// ===================================================================================
// 🍞 Toast UI
// ===================================================================================
function showToast(message, temporary = false, duration = 2700) {
  console.log('Toast should show:', message); // For debugging
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'igeul-toast';
    // Styling
    toastEl.style.position = 'fixed';
    toastEl.style.bottom = '30px';
    toastEl.style.left = '50%';
    toastEl.style.transform = 'translateX(-50%)';
    toastEl.style.background = 'rgba(17, 17, 17, 0.85)'; // #111 with opacity
    toastEl.style.color = 'white';
    toastEl.style.padding = '12px 24px';
    toastEl.style.borderRadius = '8px';
    toastEl.style.zIndex = '999999999999';
    toastEl.style.fontSize = '14px';
    toastEl.style.fontFamily = 'sans-serif';
    toastEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toastEl.style.transition = 'opacity 0.3s, bottom 0.3s';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.display = 'block';
  toastEl.style.opacity = '1';

  // Clear any existing timer to avoid premature hiding
  if (toastEl.timer) {
    clearTimeout(toastEl.timer);
  }

  if (temporary) {
    toastEl.timer = setTimeout(() => {
      hideToast();
    }, duration);
  }
}

function hideToast() {
  if (toastEl) {
    toastEl.style.opacity = '0';
    // Transition이 끝난 후 숨기기
    setTimeout(() => {
      if (toastEl) toastEl.style.display = 'none';
    }, 300);
  }
}


// ===================================================================================
// 📌 ReaderMode에서 호출할 초기화 함수 (단어장 모드 OFF 상태로 시작)
// ===================================================================================
export async function initDictionaryAnalysis(paragraphs) {
  try {
    const idToken = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.token) {
          resolve(response.token);
        } else {
          reject(new Error('인증 토큰을 가져올 수 없습니다.'));
        }
      });
    });

    // 서버에서 요구하는 형태 그대로 보냄
    console.log("📤 Dictionary 요청 Body:", paragraphs);

    const res = await requestDictionaryApi(paragraphs, idToken);

    console.log("📩 Dictionary API 응답:", res);

    dictionaryJobId = res.jobId; // Store job ID

    if (res.status === 'processing') {
      showToast("사전 생성 중...", true);
    }

    if (!dictionaryJobId) {
      console.error("Dictionary jobId 없음. 응답:", res);
      hideToast();
      return;
    }

    dictionaryData = await pollDictionaryResult(dictionaryJobId, idToken);

    console.log("📘 Dictionary Data 완료:", dictionaryData);

    initVocabToggle();
  } catch (err) {
    console.error("❌ Dictionary API 실패:", err);
    hideToast(); // 🍞 실패 시 토스트 숨기기
  }
}




// ===================================================================================
// 📌 Polling
// ===================================================================================
function pollDictionaryResult(jobId, idToken) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await getDictionaryResult(jobId, idToken);
        console.log("⏳ [Dictionary Polling]", result.status);
  
        if (result.status === "completed") {
          clearInterval(interval);
          hideToast();
          resolve(result.data);
        } else if (result.status === "failed") {
          clearInterval(interval);
          hideToast();
          console.error("Dictionary job failed:", result.error);
          reject(new Error(result.error || "사전 생성에 실패했습니다."));
        }
        // No more toast spam during polling
      } catch (err) {
        clearInterval(interval);
        hideToast();
        console.error("Error during dictionary polling:", err);
        reject(err);
      }
    }, 3000);
  });
}


// ===================================================================================
// 📌 단어장 모드 토글 (버튼으로 ON/OFF 가능)
// ===================================================================================
function initVocabToggle() {
  if (vocabToggleInitialized) return; // FIX 2: Guard against multiple listeners
  vocabToggleInitialized = true;

  const btn = document.getElementById("vocab-btn");
  const content = document.querySelector(".focus-content");

  if (!btn || !content) return;

  btn.addEventListener("click", async () => {
    const turningOn = !vocabMode;
    vocabMode = turningOn; // Optimistically update state
    updateVocabButtonUI(btn, vocabMode);

    if (turningOn) {
      console.log("📘 단어장 모드 ON 시도");

      // Helper function to activate UI
      const activateVocabUI = () => {
        if (!originalHtmlBackup) {
          originalHtmlBackup = content.innerHTML;
        }
        wrapWordsInTextNodes(content, dictionaryData);
        createTooltip();
        attachDictionaryEvents(dictionaryData);
      };

      // 1. If data is already available, just use it.
      if (dictionaryData && dictionaryData.length > 0) {
        console.log("📘 데이터 있음. 단어장 활성화.");
        activateVocabUI();
        return;
      }

      // 2. If data is not available, check the job status.
      if (dictionaryJobId) {
        console.log("📘 데이터 없음. Job ID로 상태 확인:", dictionaryJobId);
        try {
          const idToken = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
              if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
              else if (response && response.token) resolve(response.token);
              else reject(new Error('인증 토큰을 가져올 수 없습니다.'));
            });
          });
          const result = await getDictionaryResult(dictionaryJobId, idToken);

          if (result.status === 'completed') {
            console.log("📘 사전 데이터 확인 완료. 단어장 활성화.");
            dictionaryData = result.data;
            activateVocabUI();
          } else if (result.status === 'processing') {
            showToast("사전이 아직 생성 중입니다.", true);
            // Revert the toggle
            vocabMode = false;
            updateVocabButtonUI(btn, vocabMode);
          } else { // failed or other status
            showToast("사전 생성에 실패했습니다.", true);
            vocabMode = false;
            updateVocabButtonUI(btn, vocabMode);
          }
        } catch (error) {
            console.error("사전 확인 중 오류:", error);
            showToast("사전 확인 중 오류가 발생했습니다.", true);
            vocabMode = false;
            updateVocabButtonUI(btn, vocabMode);
        }
      } else {
        // 3. No job ID exists, something went wrong initially.
        showToast("사전 분석 정보가 없습니다.", true);
        vocabMode = false;
        updateVocabButtonUI(btn, vocabMode);
      }
    } else { // Turning OFF
      console.log("📘 단어장 모드 OFF");
      if (originalHtmlBackup) {
        content.innerHTML = originalHtmlBackup;
      }
      const panel = document.getElementById("word-meaning-panel");
      if (panel) {
        panel.remove();
      }
    }
  });
}


// ===================================================================================
// 📌 텍스트 노드들만 단어 감싸기 — 중복 매칭 방지
// ===================================================================================
function wrapWordsInTextNodes(root, dictionaryData) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  const sortedDict = [...dictionaryData].sort((a, b) => b.term.length - a.term.length);

  nodes.forEach(textNode => {
    const parent = textNode.parentNode;
    // 스킵 로직 추가: 부모가 H1 태그이며 focus-title 클래스를 가지면 건너뜀
    if (parent && parent.nodeName === 'H1' && parent.classList.contains('focus-title')) {
      return;
    }
    // dictionary-word 클래스를 가진 요소의 자식 텍스트 노드는 건너뛰기
    // 이전에 중복으로 SPAN이 생성되는 것을 방지합니다.
    if (parent && parent.nodeName === 'SPAN' && parent.classList.contains('dictionary-word')) {
      return;
    }
    
    let text = textNode.nodeValue;
    
    let replacements = {};
    let counter = 0;

    // 긴 단어부터 짧은 단어 순으로 처리하여 중복 매칭 방지
    sortedDict.forEach(item => {
      const word = item.term;
      if (!word || word.trim() === "") return;

      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedWord, "gi");

      // Replace with a unique placeholder
      text = text.replace(regex, match => {
        const key = `__DICT_WORD_${counter++}__`;
        replacements[key] = `<span class="dictionary-word" data-term="${item.term}">${match}</span>`;
        return key;
      });
    });

    // Replace placeholders with actual span tags
    for (const key in replacements) {
      text = text.replace(key, replacements[key]);
    }

    if (text !== textNode.nodeValue) {
      const temp = document.createElement("div"); // Use div to safely contain potential multiple top-level elements
      temp.innerHTML = text;

      while (temp.firstChild) {
        parent.insertBefore(temp.firstChild, textNode);
      }
      parent.removeChild(textNode);
    }
  });
}


// ===================================================================================
// 📌 Tooltip 생성
// ===================================================================================
function createTooltip() {
  if (tooltipEl) return; // 이미 생성되었으면 반환
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
  if (!tooltipEl) createTooltip();
  tooltipEl.innerText = text;

  tooltipEl.style.left = event.clientX + 12 + "px";
  tooltipEl.style.top = event.clientY + 18 + "px";
  tooltipEl.style.display = "block";
}

function hideTooltip() {
  if(tooltipEl) {
    tooltipEl.style.display = "none";
  }
}


// ===================================================================================
// 📌 오른쪽 패널 (longDefinition + image)
// ===================================================================================
function openWordPanel(item) {
  let panel = document.getElementById("word-meaning-panel");

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 20px;">${item.term}</h3>
      <span style="background-color: #eee; color: #333; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
        ${item.tag}
      </span>
    </div>
    <p style="font-size: 14px; color: #555; margin-top: 0; margin-bottom: 16px; font-style: italic;">
      "${item.shortDefinition}"
    </p>
    <p style="font-size: 15px; line-height: 1.6;">${item.longDefinition}</p>
    ${item.imageUrl ? `<img class="dict-image" src="${item.imageUrl}" style="margin-top: 16px;">` : ""}
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
    // Prevent multiple listeners
    if (el.dataset.eventsAttached) return;
    el.dataset.eventsAttached = 'true';

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
