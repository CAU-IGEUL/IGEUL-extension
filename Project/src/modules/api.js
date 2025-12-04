// src/modules/api.js

// Firebase Cloud Functions BASE URL

const API_BASE_URL = 'https://us-central1-igeul-66a16.cloudfunctions.net'; 

class ApiService {
  async getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.token) {
          resolve(response.token);
        } else {
          reject(new Error('인증 토큰을 가져올 수 없습니다.'));
        }
      });
    });
  }

  _convertProfileToApiFormat(localProfile) {
    return {
      readingProfile: {
        sentence: localProfile.sentence,
        vocabulary: localProfile.vocabulary
      },
      knownTopics: localProfile.knownTopics || []
    };
  }

  _convertProfileToLocalFormat(apiProfile) {
    return {
      sentence: apiProfile.readingProfile.sentence,
      vocabulary: apiProfile.readingProfile.vocabulary,
      knownTopics: apiProfile.knownTopics || [],
      getRecommendations: apiProfile.getRecommendations !== undefined ? apiProfile.getRecommendations : true
    };
  }

  // [수정 2] 프로필 저장/수정 (endpoint: /createUserProfile)
  async saveProfile(profileData) {
    try {
      const token = await this.getAuthToken();
      const apiData = this._convertProfileToApiFormat(profileData);
      
      // 주소 변경: /profiles -> /createUserProfile
      const response = await fetch(`${API_BASE_URL}/createUserProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `프로필 저장 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      throw error;
    }
  }

  async createProfile(profileData) {
    return this.saveProfile(profileData);
  }

  async updateProfile(profileData) {
    return this.saveProfile(profileData);
  }

  async updateRecommendationSettings(getRecommendations) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/updateRecommendationSettings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ getRecommendations: getRecommendations })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Recommendation settings update failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating recommendation settings:', error);
      throw error;
    }
  }

  // [수정 3] 프로필 조회 (endpoint: /getUserProfile)
  async getProfile() {
    try {
      const token = await this.getAuthToken();
      
      // 주소 변경: /profiles -> /getUserProfile
      const response = await fetch(`${API_BASE_URL}/getUserProfile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `프로필 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

/**
 * 🪄 문장 순화 요청 API
 * @param {string} title - 문서 제목
 * @param {Array} paragraphs - [{id: number, text: string}]
 * @param {string} idToken - Firebase Auth ID Token
 */
export async function requestSimplifyText(title, paragraphs, idToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/simplifyText`, {
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
      `${API_BASE_URL}/getSimplificationReport?jobId=${jobId}`,
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

export async function requestDictionaryApi(paragraphs, idToken) {
  return fetch(`${API_BASE_URL}/dictionaryApi`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paragraphs })
  }).then(r => r.json());
}


export async function getDictionaryResult(jobId, idToken) {
  return fetch(`${API_BASE_URL}/dictionaryApi?jobId=${jobId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`
    }
  }).then(r => r.json());
}



