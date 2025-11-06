// profile.js

document.addEventListener('DOMContentLoaded', () => {
  let selectedDifficulty = null;
  const selectedFields = new Set();

  // 난이도 버튼 클릭 처리
  const difficultyButtons = document.querySelectorAll('.option-btn');
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 기존 선택 제거
      difficultyButtons.forEach(b => b.classList.remove('active'));
      // 새로운 선택 추가
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.difficulty;
      console.log('선택된 난이도:', selectedDifficulty);
    });
  });

  // 분야 태그 버튼 클릭 처리 (다중 선택 가능)
  const fieldButtons = document.querySelectorAll('.tag-btn');
  fieldButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      
      if (btn.classList.contains('active')) {
        // 이미 선택되어 있으면 제거
        btn.classList.remove('active');
        selectedFields.delete(field);
      } else {
        // 선택되어 있지 않으면 추가
        btn.classList.add('active');
        selectedFields.add(field);
      }
      
      console.log('선택된 분야:', Array.from(selectedFields));
    });
  });

  // 저장하기 버튼 클릭 처리
  const saveBtn = document.getElementById('save-btn');
  saveBtn.addEventListener('click', () => {
    // 선택된 값들을 저장 (나중에 DB 연동 시 사용)
    const profileData = {
      difficulty: selectedDifficulty,
      fields: Array.from(selectedFields)
    };

    console.log('저장될 프로필 데이터:', profileData);

    // 임시 저장 (localStorage 사용)
    localStorage.setItem('userProfile', JSON.stringify(profileData));

    // popup.html로 돌아가기
    window.location.href = 'popup.html';
  });
});