// src/modules/simplify.js

import { requestSimplifyText, getSimplificationReport, apiService } from "./api.js";

/**
 * 문장 순화 전체 기능을 담당하는 초기화 함수
 * readerMode.js 에서 호출함
 */
export function initSimplifyFeature({
  dto,
  originalParagraphs,
  splitCounts,
  onUpdateSimplified,
  onModeChange
}) {
  let lastJobId = null;

  /* -------------------------------------------------------
     로딩창
  ------------------------------------------------------- */
  function showSimplifyLoading() {
    let loader = document.getElementById("simplify-loading");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "simplify-loading";
      loader.innerHTML = `
        <div class="loading-backdrop"></div>
        <div class="loading-box">
          <div class="loader"></div>
          <p>문장 순화 중입니다...</p>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  }

  function hideSimplifyLoading() {
    const loader = document.getElementById("simplify-loading");
    if (loader) loader.style.display = "none";
  }

  /* -------------------------------------------------------
     🪄 문장 순화 실행
  ------------------------------------------------------- */
  document.getElementById("run-simplify")?.addEventListener("click", async () => {
    console.log("🪄 문장 순화 요청됨");
    showSimplifyLoading();

    try {
      const idToken = await apiService.getAuthToken();
      if (!idToken) {
        alert("로그인 정보가 없습니다. 먼저 로그인해주세요.");
        return;
      }

      const paragraphsForAPI = originalParagraphs.map((text, idx) => ({
        id: idx + 1,
        text
      }));

      const res = await requestSimplifyText(dto.title, paragraphsForAPI, idToken);
      console.log("✨ 문장 순화 응답:", res);

      lastJobId = res.jobId;

      let newTexts = [];
      if (res.data?.simplified_paragraphs) {
        newTexts = [...res.data.simplified_paragraphs]
          .sort((a, b) => a.id - b.id)
          .map(p => p.text || "");
      }
      
      newTexts = rebuildSimplifiedParagraphs(newTexts, splitCounts);

      onUpdateSimplified(newTexts);
      onModeChange("simplified");

    } catch (err) {
      console.error("❌ 문장 순화 오류:", err);
      alert("문장 순화 중 오류가 발생했습니다.");
    } finally {
      hideSimplifyLoading();
    }
  });

  /* -------------------------------------------------------
     보기 모드 라디오 버튼
  ------------------------------------------------------- */
  document.getElementById("origin-only")?.addEventListener("change", () => {
    onModeChange("original");
  });

  document.getElementById("simplified-only")?.addEventListener("change", () => {
    onModeChange("simplified");
  });

  document.getElementById("compare-view")?.addEventListener("change", () => {
    onModeChange("compare");
  });

  /* -------------------------------------------------------
     📊 리포트 조회
  ------------------------------------------------------- */
  document.getElementById("report-view")?.addEventListener("click", async () => {
    if (!lastJobId) {
      alert("먼저 문장 순화를 실행해주세요.");
      return;
    }

    try {
      const { idToken } = await chrome.storage.local.get("idToken");
      if (!idToken) return alert("로그인이 필요합니다.");

      const report = await getSimplificationReport(lastJobId, idToken);

      if (report.status === "processing") {
        alert("리포트 생성 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (report.status === "completed" && report.analysis) {
        openReportModal(report.analysis);
      } else {
        alert("리포트 데이터가 올바르지 않습니다.");
      }

    } catch (err) {
      console.error("❌ 리포트 조회 오류:", err);
      alert("리포트 조회 중 오류가 발생했습니다.");
    }
  });

  /* -------------------------------------------------------
     모달 UI
  ------------------------------------------------------- */
  function openReportModal(analysis) {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.background = "rgba(0,0,0,0.45)";
    modal.style.zIndex = "99999999";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const { summary = {} } = analysis;

    modal.innerHTML = `
      <div style="
        background:white;
        padding:24px 28px;
        border-radius:12px;
        width:420px;
        max-height:70vh;
        overflow-y:auto;
      ">
        <h2 style="margin:0 0 16px;">문장 순화 리포트</h2>

        <p><strong>가독성 향상:</strong> ${summary.readability_improvement_percent ?? "-"}%</p>
        <p><strong>문자 수 감소:</strong> ${summary.char_count_reduction_percent ?? "-"}%</p>

        <p style="margin-top:12px;"><strong>핵심 메시지</strong></p>
        <p style="font-size:14px; color:#444;">
          ${summary.key_message ?? "내용 없음"}
        </p>

        <div style="text-align:right; margin-top:18px;">
          <button id="close-report-modal" style="
            padding:8px 14px;
            background:#ef4444;
            color:white;
            border:none;
            border-radius:6px;
            cursor:pointer;
          ">닫기</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("close-report-modal")?.addEventListener("click", () => modal.remove());
  }
}

export function splitParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

export function rebuildSimplifiedParagraphs(simplifiedList, splitCounts) {
  let idx = 0;
  let rebuilt = [];

  splitCounts.forEach(count => {
    if (count === null) {
      rebuilt.push(null);  // 이미지 자리
    } else {
      const group = simplifiedList.slice(idx, idx + count);
      idx += count;
      rebuilt.push(group.join("\n\n"));
    }
  });

  return rebuilt;
}


