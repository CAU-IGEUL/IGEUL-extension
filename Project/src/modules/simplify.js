/*src/modules/simplify.js*/

import { requestSimplifyText, getSimplificationReport, apiService } from "./api.js";

export function initSimplifyFeature({
  dto,
  finalList,
  serverInput,
  mapIndex,
  simplifyPanel, // The panel element is now passed in
  onUpdateSimplified,
  onModeChange
}) {
  let lastJobId = null;
  let simplificationReportData = null; // To store the pre-fetched report
  const reportButton = document.getElementById("report-view");
  let toastTimeout;

  // Disable the report button initially, as no report has been generated.
  if (reportButton) {
    reportButton.disabled = true;
  }

  /* ------------------------------------------------------- 
     TOAST NOTIFICATION (New)
  ------------------------------------------------------- */
  function showToast(message, isError = false, duration = null) {
    let toast = document.getElementById("simplify-toast-indicator");
    if (toastTimeout) clearTimeout(toastTimeout);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "simplify-toast-indicator";
      document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
      <div class="toast-spinner" style="${isError || duration ? 'display: none;' : ''}"></div>
      <p class="toast-message">${message}</p>
    `;

    toast.className = 'simplify-toast show';
    if(isError) toast.classList.add('error');

    if (duration) {
      toastTimeout = setTimeout(() => hideToast(), duration);
    }
  }

  function hideToast() {
    let toast = document.getElementById("simplify-toast-indicator");
    if (toast) {
      toast.classList.remove("show");
    }
  }
  
  /* ------------------------------------------------------- 
     NEW: Report Polling Function
  ------------------------------------------------------- */
  async function pollForReport(jobId, token) {
    const MAX_ATTEMPTS = 15;
    const DELAY = 2000; // 2 seconds

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            const report = await getSimplificationReport(jobId, token);
            if (report.status === "completed") {
                console.log("📊 리포트 백그라운드 수신 완료:", report.analysis);
                simplificationReportData = report.analysis;
                if (reportButton) {
                    reportButton.disabled = false;
                    reportButton.textContent = "리포트 보기";
                }
                return; // Success, exit polling loop
            }
            await new Promise(resolve => setTimeout(resolve, DELAY));
        } catch (error) {
            console.error("❌ 리포트 폴링 오류:", error);
            if (reportButton) {
                reportButton.textContent = "리포트 생성 실패";
            }
            return; // Stop polling on error
        }
    }

    console.warn("리포트 생성 시간 초과");
    if (reportButton) {
        reportButton.textContent = "리포트 생성 시간 초과";
    }
  }

  /* ------------------------------------------------------- 
     🪄 문장 순화 실행 (Refactored)
  ------------------------------------------------------- */
  document.getElementById("run-simplify")?.addEventListener("click", async () => {
    console.log("🪄 문장 순화 요청됨");
    showToast("문장 순화 중입니다...");
    
    // Reset and disable the report button for the new run
    if (reportButton) {
      reportButton.disabled = true;
      reportButton.textContent = "리포트 생성 중...";
      simplificationReportData = null;
    }
    // Hide controls during a new run
    const centerSection = simplifyPanel.querySelector('.center-section');
    const rightSection = simplifyPanel.querySelector('.right-section');
    if (centerSection) centerSection.style.display = 'none';
    if (rightSection) rightSection.style.display = 'none';


    try {
      const idToken = await apiService.getAuthToken();
      if (!idToken) {
        showToast("로그인 정보가 없습니다. 먼저 로그인해주세요.", true, 3000);
        if(reportButton) reportButton.textContent = "리포트 보기"; // Reset text
        return;
      }

      const paragraphsForAPI = serverInput.map((text, idx) => ({
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
      
      const mergedTexts = mergeSimplifiedResults(finalList, newTexts, mapIndex);
      const rebuilt = rebuildFinalList(finalList, mergedTexts);

      onUpdateSimplified(rebuilt);
      onModeChange("simplified");

      // Show the controls
      if (centerSection) centerSection.style.display = 'flex';
      if (rightSection) rightSection.style.display = 'block';

      showToast("문장 순화가 완료되었습니다.", false, 3000);

      // Start polling for the report in the background
      pollForReport(lastJobId, idToken);

    } catch (err) {
      console.error("❌ 문장 순화 오류:", err);
      showToast("문장 순화 중 오류가 발생했습니다.", true, 3000);
      if (reportButton) {
        reportButton.disabled = true;
        reportButton.textContent = "리포트 생성 실패";
      }
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
     📊 리포트 조회 (Refactored)
  ------------------------------------------------------- */
  reportButton?.addEventListener("click", () => {
    if (simplificationReportData) {
      openReportModal(simplificationReportData);
    } else {
      alert("리포트가 아직 준비되지 않았거나 생성에 실패했습니다.");
    }
  });

  /* ------------------------------------------------------- 
     모달 UI
  ------------------------------------------------------- */
  function openReportModal(analysis) {
    const { summary = {}, quantitative_analysis = {} } = analysis;
    const { original = {}, simplified = {} } = quantitative_analysis;

    // Helper to format numbers
    const formatNumber = (num, decimalPlaces = 0) => {
        if (typeof num !== 'number' || isNaN(num)) return '-';
        if (decimalPlaces === 0) return Math.round(num);
        return num.toFixed(decimalPlaces);
    };

    // Helper to format metric rows
    const formatMetric = (label, orig, simp, decimalPlaces = 0) => {
      if (orig == null || simp == null) {
        return `<tr><td style="padding: 12px 8px; text-align: left; color: #555;">${label}</td><td colspan="3" style="color: #999;">데이터 없음</td></tr>`;
      }
      const formattedOrig = formatNumber(orig, decimalPlaces);
      const formattedSimp = formatNumber(simp, decimalPlaces);
      const change = simp - orig;
      const percent = orig !== 0 ? ((change / orig) * 100).toFixed(1) : 0;
      let changeText = '→';
      let changeColor = '#666';
      if (change !== 0) {
        const sign = change > 0 ? '+' : '';
        const isReduction = change < 0;
        changeColor = isReduction ? '#34a853' : '#ea4335';
        if (label === '문장 수') changeColor = '#666';
        changeText = `${sign}${formatNumber(change, decimalPlaces)} (${sign}${percent}%)`;
      }
      return `
        <tr>
          <td style="padding: 12px 8px; text-align: left; color: #555; font-weight: 500;">${label}</td>
          <td style="padding: 12px 8px; text-align: center; white-space: nowrap;">${formattedOrig}</td>
          <td style="padding: 12px 8px; text-align: center; white-space: nowrap;">${formattedSimp}</td>
          <td style="padding: 12px 8px; text-align: center; font-weight: 600; color: ${changeColor}; white-space: nowrap;">${changeText}</td>
        </tr>
      `;
    };

    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999999;
      display: flex; justify-content: center; align-items: center;
    `;
    document.body.classList.add("loading-blur");

    modal.innerHTML = `
      <div style="
        background: #f8f9fa; color: #202124; padding: 0; border-radius: 16px;
        width: 600px; max-width: 95vw; max-height: 80vh; display: flex; flex-direction: column;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="padding: 24px 28px; border-bottom: 1px solid #e0e0e0;">
          <h2 style="margin: 0; font-size: 22px; color: #202124;">문장 순화 리포트</h2>
        </div>
        <div style="overflow-y: auto; padding: 24px 28px;">
          <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 28px; text-align: center;">
            <div>
              <div style="font-size: 14px; color: #5f6368; margin-bottom: 8px;">가독성 향상</div>
              <div style="font-size: 28px; font-weight: 600; color: #34a853;">${summary.readability_improvement_percent ?? "-"}%</div>
            </div>
            <div>
              <div style="font-size: 14px; color: #5f6368; margin-bottom: 8px;">분량 감소</div>
              <div style="font-size: 28px; font-weight: 600; color: #34a853;">${summary.char_count_reduction_percent ?? "-"}%</div>
            </div>
          </div>
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #202124;">핵심 요약</h3>
            <p style="font-size: 15px; color:#5f6368; line-height: 1.6; background: #fff; padding: 14px; border-radius: 8px; margin:0;">
              ${summary.key_message ?? "요약 정보를 불러올 수 없습니다."} 
            </p>
          </div>
          <div>
            <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #202124;">상세 분석</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead style="background: #f1f3f4;">
                <tr>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600;">항목</th>
                  <th style="padding: 12px 8px; text-align: center; font-weight: 600;">원본</th>
                  <th style="padding: 12px 8px; text-align: center; font-weight: 600;">순화</th>
                  <th style="padding: 12px 8px; text-align: center; font-weight: 600;">변화</th>
                </tr>
              </thead>
              <tbody style="background: #fff;">
                  ${formatMetric('글자 수', original.charCount, simplified.charCount, 0)}
                  ${formatMetric('단어 수', original.wordCount, simplified.wordCount, 0)}
                  ${formatMetric('문장 수', original.sentenceCount, simplified.sentenceCount, 0)}
                  ${formatMetric('평균 문장 길이', original.avgSentenceLength, simplified.avgSentenceLength, 2)}
                  ${formatMetric('가독성 점수', original.readabilityScore, simplified.readabilityScore, 2)}
              </tbody>
            </table>
          </div>
        </div>
        <div style="text-align: right; padding: 20px 28px; border-top: 1px solid #e0e0e0; background: #f1f3f4; border-radius: 0 0 16px 16px;">
          <button id="close-report-modal" style="padding: 10px 20px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; transition: background-color 0.2s;" onmouseover="this.style.background='#357ae8'" onmouseout="this.style.background='#4285F4'">닫기</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
        document.body.classList.remove("loading-blur");
      }
    });

    modal.querySelector("#close-report-modal")?.addEventListener("click", () => {
      modal.remove();
      document.body.classList.remove("loading-blur");
    });
  }
}
//변경없음
export function splitParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}
//변경없음
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

//새로 생겼습니다
export function normalizeParagraphs(dto) {
  const finalList = [];  // 이미지 + 쪼갠 텍스트 모두 포함한 정규화 문단 리스트
  const serverInput = []; // 서버에 보낼 텍스트만 담음
  const mapIndex = [];   // finalList[i]가 서버 텍스트 index인지 여부

  dto.paragraphs.forEach(p => {
    if (p.type === "image") {
      finalList.push({
        type: "image",
        content: p.content
      });
      mapIndex.push(null); // 이미지 자리 → 서버 인덱스 아님
    } else {
      // TEXT 문단 → \n\n 기준으로 split
      const splitParts = p.content
        .split(/\n\s*\n/)
        .map(t => t.trim())
        .filter(Boolean);
      
      splitParts.forEach(part => {
        finalList.push({
          type: "text",
          content: part
        });
        serverInput.push(part);   // 서버 전송용
        mapIndex.push(serverInput.length - 1); // 서버 index 위치 저장
      });
    }
  });

  return { finalList, serverInput, mapIndex };
}
//새로 생겼습니다
export function mergeSimplifiedResults(finalList, simplifiedArr, mapIndex) {
  // 1) finalList에서 텍스트 문단 개수 세기
  const textSlots = finalList.filter(item => item.type === "text").length;

  // 2) 순화 문단 개수
  const simpCount = simplifiedArr.length;

  // 3) 초과 문단 없음 → 그대로 simplifiedArr 사용
  if (simpCount <= textSlots) {
    return simplifiedArr.slice();
  }

  // 4) 초과 문단 존재 → 마지막 문단에 모두 merge
  const merged = simplifiedArr.slice(0, textSlots);      // 정상 문단
  const extra = simplifiedArr.slice(textSlots);          // 초과 문단들

  // 마지막 문단에 merge
  merged[textSlots - 1] += "\n\n" + extra.join("\n\n");

  return merged;
}
//새로 생겼습니다.
function rebuildFinalList(finalList, mergedTexts) {
  const result = [];
  let textIdx = 0;

  for (const item of finalList) {
    if (item.type === "image") {
      result.push(item);
    } else {
      result.push({
        type: "text",
        content: mergedTexts[textIdx++] || ""
      });
    }
  }

  return result;
}
