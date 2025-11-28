// src/modules/extractors.js

export function extractTitle(doc = document) {
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

export function extractParagraphsInOrder(area) {
  const result = [];
  let id = 1;
  let buffer = "";
  const MINLEN = 3;

  const pushText = (txt) => {
    const text = txt.trim();
    if (text.length >= MINLEN)
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

export async function parseNaverNews() {
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

export function parseNaverSports() {
  const area =
    document.querySelector("div._article_content") ||
    document.querySelector(".news_end_contents") ||
    document.querySelector(".news_end_body");
  if (!area) return null;

  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

export function parseNaverBlog() {
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

export function parseNamuWiki() {
  const area =
    document.querySelector("main") ||
    document.querySelector('div[role="main"]') ||
    document.querySelector("#app") ||
    document.body;

  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

export function parseWikipedia() {
  const area = document.querySelector("#mw-content-text") || document.querySelector("main");
  const title = extractTitle();
  const paragraphs = extractParagraphsInOrder(area);
  return { url: location.href, title, total_paragraphs: paragraphs.length, paragraphs };
}

export async function extractMainContent() {
  const url = location.href;

  if (/blog\.naver\.com/.test(url)) return parseNaverBlog();
  if (/sports\.naver\.com/.test(url)) return parseNaverSports();
  if (/news\.naver\.com/.test(url)) return await parseNaverNews();
  if (/namu\.wiki/.test(url)) return parseNamuWiki();
  if (/wikipedia\.org/.test(url)) return parseWikipedia();

  console.warn("지원되지 않는 사이트:", url);
  return null;
}