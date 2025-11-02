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
