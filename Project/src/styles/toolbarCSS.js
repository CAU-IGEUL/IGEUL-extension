// src/styles/toolbarCSS.js
// 툴바 스타일만 담당

export function applyToolbarStyles() {
  const style = document.createElement('style');
  style.id = 'toolbar-style';
  style.textContent = `
    /* ===================================
       툴바 기본 스타일
    =================================== */
    #custom-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 999999;
      border-bottom: 1px solid #e5e7eb;
    }

    .toolbar-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toolbar-buttons {
      display: flex;
      gap: 10px;
    }

    .right-btns {
      display: flex;
      gap: 8px;
    }

    /* ===================================
       버튼 스타일
    =================================== */
    #edit-icon, #reading-guide-toggle {
      background: white;
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s;
    }

    #edit-icon:hover, #reading-guide-toggle:hover {
      background: #f3f4f6;
    }

    .action-btn {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #f3f4f6;
    }

    /* ===================================
       설정 패널
    =================================== */
    #settings-panel {
      margin-top: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }

    .setting-item:last-child {
      margin-bottom: 0;
    }

    .setting-label {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
      min-width: 100px;
    }

    /* ===================================
       슬라이더 스타일
    =================================== */
    #size-slider, #lineheight-slider, #letterspacing-slider, #width-slider {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
    }

    #size-slider::-webkit-slider-thumb,
    #lineheight-slider::-webkit-slider-thumb,
    #letterspacing-slider::-webkit-slider-thumb,
    #width-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #3b82f6;
      cursor: pointer;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #size-slider::-moz-range-thumb,
    #lineheight-slider::-moz-range-thumb,
    #letterspacing-slider::-moz-range-thumb,
    #width-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #3b82f6;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #size-value, #lineheight-value, #letterspacing-value, #width-value {
      font-size: 14px;
      color: #374151;
      font-weight: 600;
      min-width: 50px;
    }

    /* ===================================
       정렬 버튼
    =================================== */
    .align-buttons {
      display: flex;
      gap: 8px;
    }

    .align-btn {
      background: white;
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .align-btn:hover {
      background: #f3f4f6;
    }

    .align-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .align-btn.active svg {
      stroke: white;
    }

    /* ===================================
       폰트 드롭다운
    =================================== */
    .font-dropdown {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      font-size: 14px;
      cursor: pointer;
      outline: none;
    }

    .font-dropdown:hover {
      border-color: #3b82f6;
    }

    .font-dropdown:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* ===================================
       body 패딩
    =================================== */
    body {
      padding-top: 70px !important;
    }

    /* ===================================
       리딩 가이드 패널
    =================================== */
    #guide-panel {
      margin-top: 15px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .guide-setting-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }

    .guide-setting-item:last-child {
      margin-bottom: 0;
    }

    /* ===================================
       체크박스
    =================================== */
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .checkbox-container input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
    }

    /* ===================================
       가이드 라벨 & 컨트롤
    =================================== */
    .guide-label {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
      min-width: 100px;
    }

    #guide-color-picker {
      flex: 1;
      height: 40px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
    }

    #guide-color-picker::-webkit-color-swatch-wrapper {
      padding: 4px;
    }

    #guide-color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }

    /* ===================================
       가이드 슬라이더
    =================================== */
    #guide-opacity-slider {
      flex: 1;
      height: 6px;
      background: linear-gradient(to right, transparent, currentColor);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      margin-bottom: 10px;
    }

    #guide-opacity-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #111827;
      cursor: pointer;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #guide-opacity-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #111827;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #guide-opacity-value {
      font-size: 14px;
      color: #374151;
      font-weight: 600;
      min-width: 50px;
    }

    #reading-guide-toggle.active {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    #reading-guide-toggle.active svg {
      stroke: white;
    }

    #guide-height-slider, #guide-position-slider {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      margin-bottom: 10px;
    }

    #guide-height-slider::-webkit-slider-thumb,
    #guide-position-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #111827;
      cursor: pointer;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #guide-height-slider::-moz-range-thumb,
    #guide-position-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #111827;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #guide-height-value, #guide-position-value {
      font-size: 14px;
      color: #374151;
      font-weight: 600;
      min-width: 50px;
    }

    .guide-hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: -8px;
      margin-bottom: 12px;
      padding-left: 115px;
      font-style: italic;
    }

    /* ===================================
       리딩 가이드 막대
    =================================== */
    #reading-guide {
      position: fixed;
      left: 0;
      right: 0;
      height: 60px;
      cursor: grab;
      z-index: 999998;
      transition: top 0.1s ease-out;
    }
  `;
  return style;
}