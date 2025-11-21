// src/api.js - 수정됨

// [수정 1] 끝에 /api 제거 (함수 이름이 바로 붙어야 함)
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