import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { loginUser } from '../../api/auth';
import BottomSheet from '../../components/common/BottomSheet';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [view, setView] = useState<'main' | 'email'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'terms' | 'privacy' | null>(null);

  // 약관 및 개인정보처리방침 데이터
  const termsText = (
    <>
      <strong>제1조 (목적)</strong>
      <br />
      본 약관은 FIT BACK(이하 "서비스")이 제공하는 AI 듀프 매칭 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.
      <br /><br />
      
      <strong>제2조 (서비스 이용)</strong>
      <br />
      서비스는 만 14세 이상의 회원에게 제공됩니다. 회원은 서비스를 이용하여 워너비 패션 이미지를 업로드하고 가성비 매칭 결과를 제공받을 수 있습니다.
      <br /><br />
      
      <strong>제3조 (금지 행위)</strong>
      <br />
      타인의 사진 무단 도용, 허위 정보 기재, 자동화 스크립트를 통한 대량 요청 등을 금지합니다.
      <br /><br />
      
      <strong>제4조 (서비스 변경·중단)</strong>
      <br />
      회사는 서비스 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다.
      <br /><br />
      
      <strong>제5조 (면책)</strong>
      <br />
      AI 분석 결과는 참고용이며, 실제 상품 품질·적합성을 보증하지 않습니다.
    </>
  );

  const privacyText = (
    <>
      <strong>개인정보 수집 항목:</strong> 카카오톡 프로필 정보(닉네임, 프로필 사진)
      <br />
      <strong>수집 목적:</strong> 서비스 이용 및 본인 식별
      <br />
      <strong>보유 기간:</strong> 회원 탈퇴 시까지
    </>
  );

  // 이메일 로그인 처리 함수
  const handleLogin = async () => {
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      alert('로그인 성공!');
      navigate('/');
    } catch (error) {
      alert('로그인 실패: 이메일과 비밀번호를 확인해주세요.');
    }
  };

  // 카카오 로그인 처리 함수 (클릭 시 백엔드의 OAuth 시작 엔드포인트로 이동)
  // 카카오 client-id/secret과 실제 인가 요청은 전부 백엔드(Spring Security OAuth2)가 처리하므로
  // 프론트는 카카오 관련 키를 전혀 가지고 있을 필요가 없다.
  const handleKakaoLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${API_BASE_URL}/api/v1/auth/oauth2/kakao`;
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col items-center justify-center px-8 font-sans shadow-lg relative overflow-y-auto">
        
        {view === 'email' && (
          <button 
            onClick={() => setView('main')}
            className="absolute top-8 left-8 text-text-tertiary"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
        )}

        {/* 로고 영역 */}
        <div className="w-[100px] h-[100px] bg-primary-50 rounded-[24px] flex justify-center items-center mb-6 shadow-sm overflow-hidden">
          <img src="/logo.png" alt="FIT BACK 로고" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-[28px] font-black text-primary-900 mb-3 tracking-tighter">
          FIT BACK
        </h1>
        <p className="text-[14px] text-text-secondary mb-[64px]">
          원하는 무드 그대로, 지갑에 딱 맞게
        </p>

        <div className="w-full h-[300px] flex flex-col items-center">
          
          {/* 메인 화면 */}
          {view === 'main' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[340px] flex flex-col gap-4">
                <button 
                  onClick={handleKakaoLogin}
                  className="w-full bg-[#FEE500] text-[#371D1E] py-[18px] rounded-[14px] text-[16px] font-bold border-none transition active:scale-95 shadow-sm"
                >
                  카카오로 시작하기
                </button>
                <button 
                  onClick={() => setView('email')}
                  className="w-full bg-bg-secondary text-text border-none py-[18px] rounded-[14px] text-[16px] font-semibold transition active:scale-95"
                >
                  이메일로 로그인
                </button>
              </div>

              <div className="mt-8 text-[14px] text-text-secondary">
                아직 계정이 없으신가요?{' '}
                <span 
                  onClick={() => navigate('/signup')}
                  className="text-primary-600 font-bold cursor-pointer hover:underline"
                >
                  회원가입
                </span>
              </div>

              {/* 하단 약관 동의 텍스트  */}
              <p className="mt-4 text-[12px] text-text-tertiary text-center leading-relaxed">
                로그인 시{' '}
                <span 
                  onClick={() => setActiveSheet('terms')} 
                  className="text-primary-600 underline cursor-pointer hover:opacity-80"
                >
                  이용약관
                </span>
                {' '}및{' '}
                <br />
                <span 
                  onClick={() => setActiveSheet('privacy')} 
                  className="text-primary-600 underline cursor-pointer hover:opacity-80"
                >
                  개인정보처리방침
                </span>
                에 동의합니다
              </p>
            </div>
          )}

          {/* 이메일 로그인 입력 화면 */}
          {view === 'email' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="w-full max-w-[340px] text-[18px] font-bold text-primary-900 mb-5">
                이메일로 로그인
              </h2>

              <div className="w-full max-w-[340px] flex flex-col gap-4 mb-8">
                <input
                  type="email"
                  placeholder="이메일"
                  className="w-full p-4 border border-border rounded-[14px] outline-none focus:border-primary-400"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    className="w-full p-4 pr-12 border border-border rounded-[14px] outline-none focus:border-primary-400"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="w-full max-w-[340px] flex flex-col gap-4">
                <button
                  onClick={handleLogin}
                  className="w-full bg-primary-400 text-white py-[18px] rounded-[14px] text-[16px] font-bold transition active:scale-95"
                >
                  로그인하기
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3 text-[13px] text-text-secondary">
                <button type="button" onClick={() => navigate('/find-password')} className="underline">
                  비밀번호 찾기
                </button>
                <span className="text-border">|</span>
                <button type="button" onClick={() => navigate('/signup')} className="underline">
                  이메일로 회원가입
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 바텀시트 컴포넌트 렌더링 */}
      <BottomSheet 
        isOpen={activeSheet === 'terms'} 
        onClose={() => setActiveSheet(null)} 
        title="이용약관"
        content={termsText}
      />

      <BottomSheet
        isOpen={activeSheet === 'privacy'}
        onClose={() => setActiveSheet(null)}
        title="개인정보처리방침"
        content={privacyText}
      />
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}