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
      knownTopics: apiProfile.knownTopics || []
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
      
      // 성공 시 로컬 저장
      if (result.status === 'success' && result.profile) {
        const localProfile = this._convertProfileToLocalFormat(result.profile);
        await this._saveToLocalStorage(localProfile);
        return result;
      } else {
        // 백엔드 응답 구조가 문서와 다를 경우를 대비한 방어 코드
        // 문서상으로는 result.profile이 바로 옴
        const savedProfile = result.profile || apiData; 
        const localProfile = this._convertProfileToLocalFormat(savedProfile);
        await this._saveToLocalStorage(localProfile);
        return result;
      }
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
      
      if (result.status === 'found' && result.profile) {
        const localProfile = this._convertProfileToLocalFormat(result.profile);
        await this._saveToLocalStorage(localProfile);
        return result;
      } else if (result.status === 'not_found') {
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('네트워크 오류 - 로컬 스토리지 조회');
        const localProfile = await this._getFromLocalStorage();
        return localProfile ? { profile: localProfile } : null;
      }
      throw error;
    }
  }

  // [수정 4] 프로필 삭제 (문서에 없지만 예외 처리)
  async deleteProfile() {
    console.warn('deleteProfile API는 문서에 정의되지 않았습니다.');
    await this._removeFromLocalStorage();
    return { status: 'success', message: 'Local profile deleted' };
  }

  _saveToLocalStorage(profile) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ userProfile: profile }, () => {
        console.log('프로필 로컬 저장 완료:', profile);
        resolve();
      });
    });
  }

  _getFromLocalStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        resolve(result.userProfile || null);
      });
    });
  }

  _removeFromLocalStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['userProfile'], () => {
        console.log('프로필 로컬 삭제 완료');
        resolve();
      });
    });
  }

  async syncProfile() {
    try {
      const serverResponse = await this.getProfile();
      const localProfile = await this._getFromLocalStorage();

      if (serverResponse && serverResponse.profile) {
        const serverProfile = serverResponse.profile;
        const serverLocal = this._convertProfileToLocalFormat(serverProfile);
        await this._saveToLocalStorage(serverLocal);
      } else if (!serverResponse && localProfile) {
        await this.saveProfile(localProfile);
      }
      return true;
    } catch (error) {
      console.error('동기화 오류:', error);
      return false;
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



