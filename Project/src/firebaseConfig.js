// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth/web-extension';

const firebaseConfig = {
  apiKey: "AIzaSyA-xHXhcsoTlNVsoE6Mpowupgo4oc0WQkQ",
  authDomain: "igeul-66a16.firebaseapp.com",
  projectId: "igeul-66a16",
  storageBucket: "igeul-66a16.firebasestorage.app",
  messagingSenderId: "119171161159",
  appId: "1:119171161159:web:588f343c93235ce0472562"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 인증 서비스 가져오기
export const auth = getAuth(app);