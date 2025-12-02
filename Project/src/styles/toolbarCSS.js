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
      align-items: center;
    }

    .right-btns {
      display: flex;
      gap: 8px;
    }

    /* ===================================
       드롭다운 메뉴
    =================================== */
    .dropdown-container {
      position: relative;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: white !important; /* Added !important */
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1000;
      padding: 20px;
      width: 400px;
      display: none;
    }

    .dropdown-menu.show {
      display: block;
    }


    /* ===================================
       버튼 스타일
    =================================== */
    #edit-icon, #reading-guide-toggle, #summary-toggle, #profile-toggle {
      background: white;
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s;
    }

    #edit-icon.active, #reading-guide-toggle.active {
      background: #e5e7eb;
      border-color: #d1d5db;
    }

    #edit-icon:hover, #reading-guide-toggle:hover, #summary-toggle:hover, #profile-toggle:hover {
      background: #f3f4f6;
    }

    #summary-toggle.active {
      background: #FF8D21; /* Changed color */
      border-color: #FF8D21; /* Changed color */
    }

    #summary-toggle.active svg {
      stroke: white;
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
       설정 패널 (드롭다운 메뉴 내부)
    =================================== */
    .setting-item, .guide-setting-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }

    .setting-item:last-child, .guide-setting-item:last-child {
      margin-bottom: 0;
    }

    .setting-label, .guide-label {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
      min-width: 100px;
    }

    /* ===================================
       슬라이더 스타일
    =================================== */
    #size-slider, #lineheight-slider, #letterspacing-slider, #width-slider,
    #guide-height-slider, #guide-position-slider, #guide-opacity-slider {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      margin: 0;
    }

    #size-slider::-webkit-slider-thumb,
    #lineheight-slider::-webkit-slider-thumb,
    #letterspacing-slider::-webkit-slider-thumb,
    #width-slider::-webkit-slider-thumb,
    #guide-height-slider::-webkit-slider-thumb,
    #guide-position-slider::-webkit-slider-thumb,
    #guide-opacity-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #FF8D21; /* Changed color */
      cursor: pointer;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #size-slider::-moz-range-thumb,
    #lineheight-slider::-moz-range-thumb,
    #letterspacing-slider::-moz-range-thumb,
    #width-slider::-moz-range-thumb,
    #guide-height-slider::-moz-range-thumb,
    #guide-position-slider::-moz-range-thumb,
    #guide-opacity-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #FF8D21; /* Changed color */
      cursor: pointer;
      border-radius: 50%;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    #guide-opacity-slider {
       background: linear-gradient(to right, transparent, currentColor);
    }
    #guide-opacity-slider::-webkit-slider-thumb,
    #guide-opacity-slider::-moz-range-thumb {
        background: #111827;
    }


    #size-value, #lineheight-value, #letterspacing-value, #width-value,
    #guide-height-value, #guide-position-value, #guide-opacity-value {
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
      background: #FF8D21; /* Changed color */
      border-color: #FF8D21; /* Changed color */
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
      border-color: #FF8D21; /* Changed color */
    }

    .font-dropdown:focus {
      border-color: #FF8D21; /* Changed color */
      box-shadow: 0 0 0 3px rgba(255, 141, 33, 0.1); /* Changed color */
    }

    /* ===================================
       body 패딩
    =================================== */
    body {
      padding-top: 60px !important; /* 고정값으로 변경 */
      transition: none; /* 패딩 변경 애니메이션 제거 */
    }

    /* ===================================
       리딩 가이드 패널
    =================================== */
    .guide-setting-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
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

    /* ===================================
      요약 모달
    =================================== */
    .summary-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .summary-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }

    .summary-modal-content {
      position: relative;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .summary-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .summary-close-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .summary-close-btn:hover {
      background: #f3f4f6;
    }

    .summary-modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    /* 로딩 상태 */
    .summary-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .summary-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #FF8D21; /* Changed color */
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .summary-loading p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    /* 요약 내용 */
    .summary-content {
      line-height: 1.8;
    }

    .summary-text {
      color: #374151;
      font-size: 16px;
      white-space: pre-wrap;
    }

    /* 에러 상태 */
    .summary-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .summary-error svg {
      margin-bottom: 16px;
    }

    .summary-error p {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 20px 0;
    }

    .summary-retry-btn {
      background: #FF8D21; /* Changed color */
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .summary-retry-btn:hover {
      background: #E87A13; /* Changed color */
    }

    /* ===================================
      프로필 모달
    =================================== */
    .profile-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }

    .profile-modal-content {
      position: relative;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      animation: modalSlideIn 0.3s ease-out;
    }

    .profile-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .profile-modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .profile-close-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .profile-close-btn:hover {
      background: #f3f4f6;
    }

    .profile-modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    /* 로딩 상태 */
    .profile-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .profile-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #FF8D21; /* Changed color */
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    .profile-loading p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    /* 프로필 내용 */
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .profile-section {
      text-align: center;
    }

    .profile-section-label {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin-bottom: 24px;
      display: block;
      line-height: 1.6;
    }

    /* 슬라이더 */
    .profile-slider-container {
      width: 100%;
      padding: 10px 0;
    }

    .profile-slider-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 0 12px;
      position: relative;
      height: 18px;
    }

    .profile-slider-labels span {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-align: center;
      flex: 0 0 33.33%;
      position: absolute;
      transform: translateX(-50%);
    }

    /* 첫 번째 (레벨 0) - 왼쪽 동그라미 위 */
    .profile-slider-labels span:nth-child(1) {
      left: 5%;
    }

    /* 두 번째 (레벨 1) - 가운데 동그라미 위 */
    .profile-slider-labels span:nth-child(2) {
      left: 50%;
    }

    /* 세 번째 (레벨 2) - 오른쪽 동그라미 위 */
    .profile-slider-labels span:nth-child(3) {
      left: 91%;
    }

    .profile-slider-track {
      position: relative;
      padding: 16px 0;
      margin: 0; 
    }

      .profile-level-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #e0e0e0;
      outline: none;
      border-radius: 3px;
      position: relative;
      z-index: 2;
      cursor: pointer;
    }

    .profile-level-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      background: #FF8D21; /* Changed color */
      cursor: pointer;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.2s;
    }

    .profile-level-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 3px 6px rgba(255, 141, 33, 0.4); /* Changed color */
    }

    .profile-level-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: #FF8D21; /* Changed color */
      cursor: pointer;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.2s;
    }

    .profile-slider-indicators {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 0px;
      pointer-events: none;
      z-index: 1;
    }

    .profile-slider-dot {
      width: 14px;
      height: 14px;
      background-color: #e0e0e0;
      border-radius: 50%;
      border: 3px solid white;
      transition: all 0.2s;
    }

    .profile-slider-dot.active {
      background-color: #FF8D21; /* Changed color */
      transform: scale(1.2);
    }

    .profile-slider-descriptions {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding: 0 12px;
      position: relative;
      height: 32px;
    }

    .profile-slider-descriptions span {
      font-size: 11px;
      color: #999;
      text-align: center;
      line-height: 1.3;
      position: absolute;
      transform: translateX(-50%);
      white-space: nowrap;
      max-width: 80px;
    }

    /* 첫 번째 (원문) - 왼쪽 동그라미 아래 */
    .profile-slider-descriptions span:nth-child(1) {
      left: 5%;
    }

    /* 두 번째 (약간 나눔) - 가운데 동그라미 아래 */
    .profile-slider-descriptions span:nth-child(2) {
      left: 50%;
    }

    /* 세 번째 (많이 나눔) - 오른쪽 동그라미 아래 */
    .profile-slider-descriptions span:nth-child(3) {
      left: 88%;
    }

    /* 태그 그룹 */
    .profile-tag-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 4px;
      justify-content: center;
    }

    .profile-tag-label {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      background-color: #f3f4f6;
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      border: 2px solid transparent;
    }

    .profile-tag-label input[type="checkbox"] {
      display: none;
    }

    .profile-tag-label:hover {
      background-color: #e5e7eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .profile-tag-label:has(input[type="checkbox"]:checked) {
      background-color: #FF8D21; /* Changed color */
      color: white;
      border-color: #FF8D21; /* Changed color */
      box-shadow: 0 2px 6px rgba(255, 141, 33, 0.3); /* Changed color */
    }

    /* 저장 버튼 */
    .profile-save-btn {
      background: #FF8D21; /* Changed color */
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      margin-top: 12px;
      box-shadow: 0 2px 8px rgba(255, 141, 33, 0.25); /* Changed color */
      display: flex; /* ← 추가 */
      align-items: center; /* ← 추가 */
      justify-content: center; /* ← 추가 */
      text-align: center; /* ← 추가 */
    }

    .profile-save-btn:hover {
      background: #E87A13; /* Changed color */
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 141, 33, 0.35); /* Changed color */
    }

    .profile-save-btn:active {
      transform: translateY(0);
    }

    .profile-save-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
      cursor: not-allowed;
    }

    /* 에러 상태 */
    .profile-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .profile-error svg {
      margin-bottom: 16px;
    }

    .profile-error p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    #profile-toggle.active {
      background: #FF8D21; /* Changed color */
      border-color: #FF8D21; /* Changed color */
    }

    #profile-toggle.active svg {
      stroke: white;
    }


    /* ===================================
       더 읽을 콘텐츠 토글 스위치
    =================================== */

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #10b981; /* Default green, can be changed */
      transition: 0.3s;
      border-radius: 24px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle-switch input:not(:checked) + .toggle-slider {
      background-color: #d1d5db;
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }

    .recommendations-section {
      margin-top: 60px;
      padding: 32px 0;
      border-top: 2px solid #e5e7eb;
    }

    .recommendations-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 24px;
      color: #1f2937;
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .recommendation-card {
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      background: white;
      text-decoration: none;
      color: inherit;
    }

    .recommendation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-color: #FF8D21; /* Changed color */
    }

    .recommendation-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #f3f4f6;
    }

    .recommendation-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .recommendation-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .recommendation-snippet {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .recommendation-link {
      font-size: 12px;
      color: #FF8D21; /* Changed color */
      margin-top: 12px;
      word-break: break-all;
    }
  `;
  return style;
}