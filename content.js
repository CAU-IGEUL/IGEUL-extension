// 📦 content.js — 본문 추출 + 집중모드 (페이드아웃 닫기 포함)

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

/* -----------------------------
   사이트 자동 감지
-------------------------------- */
async function extractMainContent() {
  const url = location.href;

  if (/blog\.naver\.com/.test(url)) return parseNaverBlog();
  if (/sports\.naver\.com/.test(url)) return parseNaverSports();
  if (/news\.naver\.com/.test(url)) return await parseNaverNews();
  if (/namu\.wiki/.test(url)) return parseNamuWiki();
  if (/wikipedia\.org/.test(url)) return parseWikipedia();

  console.warn("지원되지 않는 사이트:", url);
  return null;
}

/* -----------------------------
   제목 추출
-------------------------------- */
function extractTitle(doc = document) {
  const url = location.href;

  if (/news\.naver\.com/.test(url)) {
    return (
      doc.querySelector("h2#title_area, h2.media_end_head_headline")?.innerText.trim() ||
      doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
      doc.title.trim()
    );
  }

  if (/sports\.naver\.com/.test(url)) {
    return (
      doc.querySelector("h2.ArticleHead_article_title__qh8GV, h1.news_end_head_title")?.innerText.trim() ||
      doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
      doc.title.trim()
    );
  }

  if (/blog\.naver\.com/.test(url)) {
    const tbox = doc.querySelector("div.se-section.se-section-documentTitle");
    if (tbox) {
      const p = tbox.querySelector(".se-text-paragraph");
      return (p ? p.innerText : tbox.innerText).trim();
    }
    return (
      doc.querySelector(".se-title-text, h3, h2")?.innerText.trim() ||
      doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
      doc.title.trim()
    );
  }

  if (/namu\.wiki|wikipedia\.org/.test(url)) {
    return (
      doc.querySelector("h1")?.innerText.trim() ||
      doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
      doc.title.trim()
    );
  }

  return (
    doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
    doc.querySelector("h1, h2, h3")?.innerText.trim() ||
    doc.title.trim()
  );
}

/* -----------------------------
   본문 추출 (텍스트 + 이미지 순서 보존)
-------------------------------- */
function extractParagraphsInOrder(area) {
  const result = [];
  let id = 1;
  let buffer = "";
  const MINLEN = 3;
  const bad = /(광고|배너|구독|추천|Copyright|무단|재배포)/i;

  const pushText = (txt) => {
    const text = txt.trim();
    if (text.length >= MINLEN && !bad.test(text))
      result.push({ id: id++, type: "text", content: text });
  };

  const flush = () => {
    if (buffer.trim()) pushText(buffer);
    buffer = "";
  };

  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        buffer += child.nodeValue;
        continue;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();

        if (tag === "br") {
          buffer += "\n";
          continue;
        }

        if (tag === "img") {
          flush();
          const src = child.getAttribute("src");
          if (src && !src.startsWith("data:") && !src.includes("AD"))
            result.push({ id: id++, type: "image", content: src });
          continue;
        }

        if (tag === "figure") {
          flush();
          const img = child.querySelector("img");
          if (img && img.src && !img.src.includes("AD"))
            result.push({ id: id++, type: "image", content: img.src });
          continue;
        }

        if (/^(p|li|div|section|article|h\d)$/i.test(tag)) {
          walk(child);
          buffer += "\n\n";
          continue;
        }

        walk(child);
      }
    }
  };

  walk(area);
  flush();
  return result;
}

/* -----------------------------
   네이버 뉴스
-------------------------------- */
async function parseNaverNews() {
  const tryExtract = () => {
    const area =
      document.querySelector("#dic_area") ||
      document.querySelector(".newsct_article_body") ||
      document.querySelector("article[id^='dic_']");
    if (!area) return null;

    const title = extractTitle();
    const paragraphs = extractParagraphsInOrder(area);
    if (paragraphs.length < 2) return null;

    return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
  };

  let dto = tryExtract();
  if (!dto) {
    await new Promise((r) => setTimeout(r, 700));
    dto = tryExtract();
  }
  return dto;
}

/* -----------------------------
   네이버 스포츠 뉴스
-------------------------------- */
function parseNaverSports() {
  const area =
    document.querySelector("div._article_content") ||
    document.querySelector(".news_end_contents") ||
    document.querySelector(".news_end_body");
  if (!area) return null;

  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

/* -----------------------------
   네이버 블로그
-------------------------------- */
function parseNaverBlog() {
  let doc = document;
  const frame = document.querySelector("#mainFrame");
  if (frame && frame.contentDocument) doc = frame.contentDocument;

  const title = extractTitle(doc);

  const se3 = doc.querySelector(".se-main-container");
  if (se3) {
    const paragraphs = extractParagraphsInOrder(se3);
    return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
  }

  const legacy =
    doc.querySelector("#postViewArea") ||
    doc.querySelector(".article-view") ||
    doc.querySelector(".se_viewArea");
  if (legacy) {
    const paragraphs = extractParagraphsInOrder(legacy);
    return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
  }

  return null;
}

/* -----------------------------
   나무위키
-------------------------------- */
function parseNamuWiki() {
  const area =
    document.querySelector("main") ||
    document.querySelector('div[role="main"]') ||
    document.querySelector("#app") ||
    document.body;

  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

/* -----------------------------
   위키피디아
-------------------------------- */
function parseWikipedia() {
  const area = document.querySelector("#mw-content-text") || document.querySelector("main");
  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

/* -----------------------------
   집중모드 렌더링
-------------------------------- */
function renderReaderMode(dto) {
  document.body.innerHTML = "";

  const container = document.createElement("div");
  container.id = "focus-reader";
  container.innerHTML = `
    <div class="focus-toolbar">
      <h2>${dto.title}</h2>
      <button id="exit-reader">✖ 닫기</button>
    </div>

    <div class="focus-content">
      ${dto.paragraphs
        .map((p) => {
          if (p.type === "image") {
            return `<img src="${p.content}" alt="image" class="focus-image">`;
          } else {
            return `<p>${p.content}</p>`;
          }
        })
        .join("")}
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      background: #f5f5f5;
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.7;
      color: #222;
    }
    .focus-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: white;
      border-bottom: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 999999;
    }
    .focus-toolbar h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111;
    }
    #exit-reader {
      border: none;
      background: #ef4444;
      color: white;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    #exit-reader:hover {
      background: #dc2626;
    }
    .focus-content {
      max-width: 720px;
      background: white;
      margin: 100px auto 40px;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      opacity: 0;
      transform: translateY(10px);
      animation: fadeIn 0.5s ease forwards;
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
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  // ✖ 닫기 버튼 클릭 시 페이드아웃 후 새로고침
  document.getElementById("exit-reader").addEventListener("click", () => {
    const content = document.querySelector(".focus-content");
    content.style.animation = "fadeOut 0.4s ease forwards";
    setTimeout(() => location.reload(), 400);
  });
}
