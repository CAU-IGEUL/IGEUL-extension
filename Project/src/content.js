// src/content.js
import { extractMainContent } from './modules/extractors.js';
import { renderReaderMode } from './modules/readerMode.js';

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // Check if the message is to extract content
  if (request.action === 'extractContent') {
    try {
      // 1. Extract main content from the current page
      const extractedData = await extractMainContent();

      if (extractedData) {
        console.log("📄 Content extracted:", extractedData);
        // 2. Render the page in reader mode with the extracted data
        renderReaderMode(extractedData);
        sendResponse({ status: 'success' });
      } else {
        // Handle case where content could not be extracted
        alert("본문을 추출할 수 없습니다. 😢");
        sendResponse({ status: 'failure', reason: 'no_content' });
      }
    } catch (error) {
      console.error("Error during content extraction:", error);
      alert("본문 추출 중 오류가 발생했습니다. 😢");
      sendResponse({ status: 'failure', reason: error.message });
    }
    // Return true to indicate that the response is sent asynchronously
    return true;
  }
});

// 🪄 문장순화 버튼 클릭 시 - JSON 콘솔 출력
document.getElementById("simplify-btn")?.addEventListener("click", () => {
  const dto = {
    url: location.href,
    title: document.querySelector(".focus-title")?.innerText || "제목 없음",
    paragraphs: Array.from(document.querySelectorAll(".focus-content p")).map((p, idx) => ({
      id: idx + 1,
      text: p.innerText.trim(),
    })),
  };

  console.log("🪄 문장순화 요청 DTO:", JSON.stringify(dto, null, 2));
});


// 📘 단어장 버튼 클릭 시 - on/off 전환
let vocabMode = false;

document.getElementById("vocab-btn")?.addEventListener("click", () => {
  vocabMode = !vocabMode;
  console.log(vocabMode ? "📘 단어장 모드 ON" : "📕 단어장 모드 OFF");

  if (vocabMode) enableVocabMode();
  else location.reload(); // OFF 시 원래 화면으로 복원
});

function enableVocabMode() {
  const paragraphs = document.querySelectorAll(".focus-content p");

  paragraphs.forEach(p => {
    const words = p.innerText.split(/\s+/);
    p.innerHTML = words.map(w => `<span class="vocab-word">${w}</span>`).join(" ");
  });

  document.querySelectorAll(".vocab-word").forEach(span => {
    span.addEventListener("click", e => {
      console.log("🧩 클릭한 단어:", e.target.innerText);
    });
  });
}

