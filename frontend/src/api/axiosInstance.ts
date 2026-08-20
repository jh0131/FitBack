import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// accessToken(30분) 만료 시 refreshToken으로 재발급하는 전용 인스턴스.
// api 인스턴스를 그대로 쓰면 요청 인터셉터가 이미 만료된 accessToken을 다시 붙여서
// 재발급 요청 자체가 또 401을 맞는 순환에 빠지기 때문에 분리한다.
const refreshClient = axios.create({ baseURL: BASE_URL });

// 화면 하나에서 여러 API를 동시에 호출하다 accessToken이 만료되면 401이 한꺼번에
// 여러 개 떨어지는데, 재발급 요청은 한 번만 나가고 나머지는 그 결과를 같이 기다리게 함.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const response = await refreshClient.post('/api/v1/auth/token/refresh', { refreshToken });
    const { accessToken, refreshToken: rotatedRefreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    if (rotatedRefreshToken) localStorage.setItem('refreshToken', rotatedRefreshToken);
    return accessToken as string;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 로그인/회원가입/토큰재발급 자체에서 나는 401(비번 오류 등)은 세션 만료가 아니라
    // 각 화면이 이미 알아서 처리 중이므로, 재발급·강제 로그아웃 대상에서 제외한다.
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      }
      // 재발급까지 실패했을 때만(= refreshToken도 만료·무효) 진짜 로그아웃 처리.
      // 이전에는 accessToken이 30분 만료되는 순간 재발급 시도 자체가 없어서
      // API 하나만 401이 나도 바로 로그인 화면으로 튕기고 진행 중이던 작업(예:
      // 룩북 올리기)이 그대로 날아갔음 — 실제로 보고된 증상.
      logout();
      return Promise.reject(error);
    }

    // 서버는 { success, code, message, data } 포맷으로 실패 사유를 message에 담아 내려준다.
    // 지금까지 여러 화면(AiWaitingPage/TagEditPage/LookbookUploadPage 등)이 err.message를
    // 그대로 화면에 보여주는데, 여기서 손대지 않으면 axios 기본 메시지("Request failed
    // with status code 409" 같은 영문 문구)가 뜨는 문제가 있었음 — 여기서 한 번만 고쳐서
    // err.message를 쓰는 모든 곳이 실제 서버 메시지를 받도록 함.
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.length > 0) {
      error.message = serverMessage;
    }
    return Promise.reject(error);
  }
);