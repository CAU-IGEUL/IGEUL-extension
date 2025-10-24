// src/content.js
import { extractMainContent } from './modules/extractors.js';
import { renderReaderMode } from './modules/readerMode.js';

window.addEventListener("message", async (event) => {
if (event.data.type === "CAU_EXTRACT_START") {
    setTimeout(async () => {
    const dto = await extractMainContent();
    if (dto) {
        console.log("📄 추출된 DTO:", dto);
        localStorage.setItem("CAU_READER_DTO", JSON.stringify(dto));
        alert(`본문 추출 완료 (${dto.total_paragraphs}개 문단)\n콘솔(F12)에서 확인하세요.`);
    } else {
        alert("본문을 찾지 못했습니다 😢");
    }
    }, 400);
}

if (event.data.type === "CAU_READER_MODE_START") {
    renderReaderMode(event.data.dto);
}
});