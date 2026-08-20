import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosInstance';

export default function KakaoCallback() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URL(window.location.href).searchParams;
    const tempToken = params.get('tempToken');
    const error = params.get('error');
    const message = params.get('message');

    if (error) {
      alert(message ? decodeURIComponent(message) : '카카오 로그인 중 오류가 발생했습니다.');
      navigate('/login');
      return;
    }

    if (!tempToken) {
      navigate('/login');
      return;
    }

    // tempToken은 실제 JWT가 아닌 1회용 교환 토큰이므로, 브라우저 주소에서 즉시 제거한다.
    window.history.replaceState({}, '', window.location.pathname);

    api
      .post('/api/v1/auth/token/exchange', { tempToken })
      .then((res) => {
        const { accessToken, refreshToken, isNewMember, nickname, profileImageUrl } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        if (isNewMember) {
          navigate('/signup/profile', {
            state: { kakaoNickname: nickname, kakaoProfileImage: profileImageUrl },
          });
        } else {
          navigate('/');
        }
      })
      .catch((err) => {
        console.error('카카오 로그인 실패:', err);
        alert('카카오 로그인 중 오류가 발생했습니다.');
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-primary-900 font-bold text-lg">카카오 로그인 처리 중입니다...</p>
    </div>
  );
}
