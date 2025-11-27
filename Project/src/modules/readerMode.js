// src/modules/readerMode.js

import { loadFonts, initFontController } from './changeTextStyle.js';
import { initReadingGuide } from './readingGuide.js';
import { getToolbarHTML } from '../styles/toolbarHTML.js';
import { applyToolbarStyles } from '../styles/toolbarCSS.js';
import { initSummary } from './summary.js';
import { initProfileSettings } from './profileSettings.js';

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
  initSummary();
  initProfileSettings();

  const container = document.createElement("div");
  container.id = "focus-reader";
  container.innerHTML = `
    <div class="focus-content">
      <h1 class="focus-title">${dto.title}</h1>
      ${dto.paragraphs
        .map(p =>
          p.type === "image"
            ? `<img src="${p.content}" alt="image" class="focus-image">`
            : `<p>${p.content}</p>`
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
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 2rem;
      line-height: 1.3;
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
  document.head.appendChild(readerStyle);

  exitBtn?.addEventListener("click", () => {
    const content = document.querySelector(".focus-content");
    content.style.animation = "fadeOut 0.4s ease forwards";
    setTimeout(() => location.reload(), 400);
  });
}