// toggleToolbar.js
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

    let currentSize = 100;
    let currentLineHeight = 1.5;
    let currentLetterSpacing = 0;
    let currentWidth = 100;
    let currentAlign = 'left';
    let currentFont = 'default';

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
        const dtoRaw = localStorage.getItem("CAU_READER_DTO");
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

    document.getElementById('edit-icon').addEventListener('click', () => {
        const panel = document.getElementById('settings-panel');
        if (panel.style.display === 'none') {
        panel.style.display = 'block';
        document.body.style.paddingTop = '270px';
        } else {
        panel.style.display = 'none';
        document.body.style.paddingTop = '70px';
        }
    });

    document.getElementById('reading-guide-toggle').addEventListener('click', () => {
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
    }
}
})();