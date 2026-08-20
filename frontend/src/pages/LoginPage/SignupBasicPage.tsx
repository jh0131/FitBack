import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/axiosInstance';

export default function SignupBasicPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNextStep = async () => {
    // 1. 프론트엔드 자체 유효성 검사
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      setErrorMessage('비밀번호는 영문, 숫자를 포함해 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 에러 메시지 초기화 후 API 호출
    setErrorMessage('');

    try {
      const response = await api.post('/api/v1/auth/sign', {
        email: email,
        password: password,
      });
      
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      
      navigate('/signup/profile');
    } catch (error: any) {
      console.error('가입 실패:', error);

      // 서버 응답 데이터 추출
      const status = error.response?.status;
      const errorCode = error.response?.data?.code;
      const errorMessageFromServer = error.response?.data?.message;

      // 2. 이메일 중복 에러 처리
      if (status === 409 || errorCode === 'AUTH409_1') {
        setErrorMessage(errorMessageFromServer || '이미 사용 중인 이메일입니다.');
      } 
      // 3. 그 외의 서버 에러 처리
      else {
        setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col px-8 py-10 font-sans shadow-lg relative overflow-y-auto">
        
        <div className="flex items-center mb-8 relative">
          <button onClick={() => navigate(-1)} className="text-text-tertiary" aria-label="뒤로가기">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-primary-900">회원가입</h1>
        </div>

        <div className="flex gap-2 mb-10">
          <div className="h-1.5 flex-1 bg-primary-400 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-border rounded-full"></div>
          <div className="h-1.5 flex-1 bg-border rounded-full"></div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary-900">이메일</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
              placeholder="example@email.com" 
              className="w-full bg-bg p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary-900">비밀번호</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
              placeholder="8자 이상 입력해주세요" 
              className="w-full bg-bg p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary-400"
            />
            <p className="text-xs text-text-tertiary">영문, 숫자 포함 8자 이상</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary-900">비밀번호 확인</label>
            <input 
              type="password"
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setErrorMessage(''); }}
              placeholder="비밀번호를 한번 더 입력해주세요"
              className="w-full bg-bg p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {errorMessage && (
            <p className="text-[13px] text-red-500 font-medium">{errorMessage}</p>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button 
            onClick={handleNextStep}
            className="w-full bg-primary-400 text-white py-4 rounded-xl text-base font-bold transition active:scale-95 shadow-md"
          >
            다음 단계
          </button>
        </div>

      </div>
    </div>
  );
}