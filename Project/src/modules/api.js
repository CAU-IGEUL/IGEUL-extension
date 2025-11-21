// src/modules/api.js

// Firebase Cloud Functions BASE URL
const BASE_URL = "https://us-central1-igeul-66a16.cloudfunctions.net";

/**
 * 🪄 문장 순화 요청 API
 * @param {string} title - 문서 제목
 * @param {Array} paragraphs - [{id: number, text: string}]
 * @param {string} idToken - Firebase Auth ID Token
 */
export async function requestSimplifyText(title, paragraphs, idToken) {
  try {
    const response = await fetch(`${BASE_URL}/simplifyText`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        paragraphs
      })
    });

    if (!response.ok) {
      throw new Error("문장 순화 요청 실패");
    }

    return await response.json();
    // 응답 예시:
    // {
    //   status: "processing",
    //   jobId: "...",
    //   data: {
    //     title: "...",
    //     simplified_paragraphs: [...]
    //   }
    // }
  } catch (error) {
    console.error("[API] 문장 순화 오류:", error);
    throw error;
  }
}


/**
 * 📊 리포트 조회 API
 * @param {string} jobId - 문장 순화 작업 ID
 * @param {string} idToken - Firebase Auth ID Token
 */
export async function getSimplificationReport(jobId, idToken) {
  try {
    const response = await fetch(
      `${BASE_URL}/getSimplificationReport?jobId=${jobId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("리포트 조회 실패");
    }

    return await response.json();
    // 처리 중 예시 (202):
    // { status: "processing", message: "리포트가 아직 생성 중입니다." }
    //
    // 처리 완료 예시 (200):
    // { status: "completed", analysis: {...} }
  } catch (error) {
    console.error("[API] 리포트 조회 오류:", error);
    throw error;
  }
}
