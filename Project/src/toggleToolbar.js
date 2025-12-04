// toggleToolbar.js

import { loadFonts, initFontController } from './modules/changeTextStyle.js';
import { initReadingGuide } from './modules/readingGuide.js';
import { getToolbarHTML } from './styles/toolbarHTML.js';
import { applyToolbarStyles } from './styles/toolbarCSS.js';
import { initSummary } from './modules/summary.js';
import { initProfileSettings } from './modules/profileSettings.js';

(function() {
toggleToolbar();

function toggleToolbar() {
    const toolbar = document.getElementById('custom-toolbar');
    if (toolbar) {
    toolbar.remove();
    const toolbarStyle = document.getElementById('toolbar-style');
    if (toolbarStyle) toolbarStyle.remove();

    document.body.style.paddingTop = '';
    const fontStyle = document.getElementById('custom-font-style');
    if (fontStyle) fontStyle.remove();
    return;
    } else {
    loadFonts();

    const newToolbar = document.createElement('div');
    newToolbar.id = 'custom-toolbar';

    newToolbar.innerHTML = getToolbarHTML(); 
    const style = applyToolbarStyles(); 
    document.head.appendChild(style);

    document.body.insertBefore(newToolbar, document.body.firstChild);

    document.getElementById("extract-btn").addEventListener("click", () => {
        window.postMessage({ type: "CAU_EXTRACT_START" }, "*");
    });

    document.getElementById("reader-btn").addEventListener("click", () => {
        const dtoRaw = null;
        if (!dtoRaw) {
        alert("본문을 먼저 추출하세요!");
        return;
        }
        const dto = JSON.parse(dtoRaw);
        window.postMessage({ type: "CAU_READER_MODE_START", dto }, "*");
    });

    const readingGuide = document.createElement('div');
    readingGuide.id = 'reading-guide';
    readingGuide.style.display = 'none';
    document.body.appendChild(readingGuide);

    // 모든 드롭다운 컨테이너에 대해 이벤트 리스너 설정
    document.querySelectorAll('.dropdown-container').forEach(container => {
        const button = container.querySelector('button');
        const menu = container.querySelector('.dropdown-menu');
        
        button.addEventListener('click', (e) => {
        e.stopPropagation();
        // 현재 드롭다운 상태
        const isVisible = menu.style.display === 'block';
        
        // 모든 드롭다운 닫기
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        document.querySelectorAll('.dropdown-container > button').forEach(b => b.classList.remove('active'));

        // 현재 클릭한 드롭다운의 상태를 반전
        if (!isVisible) {
            menu.style.display = 'block';
            button.classList.add('active');
        }
        });
    });

    // 문서 전체를 클릭했을 때 드롭다운 닫기
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        document.querySelectorAll('.dropdown-container > button').forEach(b => b.classList.remove('active'));
        }
    });

    initFontController();
    initReadingGuide();
    initSummary();
    initProfileSettings();  
    }
}
})();