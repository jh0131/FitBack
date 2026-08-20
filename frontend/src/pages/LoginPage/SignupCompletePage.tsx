import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function SignupCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { nickname = '', selectedStyles = [] } = location.state || {};

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col items-center px-8 py-12 font-sans shadow-lg relative overflow-y-auto">
        
        <div className="h-12 w-full"></div>

        <div 
          className={`w-[120px] h-[120px] rounded-full border-[3px] border-primary-200 flex items-center justify-center mb-8 transition-opacity duration-400 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 보라색 체크마크 — 디자인 시스템 primary-400 토큰 색상 */}
          <Check size={50} strokeWidth={3} className="text-primary-400" />
        </div>

        {/* 환영 메시지 (C-03A-02) */}
        <h1 className="text-2xl font-black text-primary-900 mb-4 text-center whitespace-pre-wrap leading-snug">
          {nickname ? `${nickname}님,\n가입이 완료됐어요! 🎉` : '가입이 완료됐어요! 🎉'}
        </h1>
        
        <p className="text-sm text-text-secondary text-center mb-10 leading-relaxed">
          이제 워너비 사진을 올리면<br />AI가 가성비 아이템을 찾아드려요
        </p>

        {/* 관심 스타일 미리보기 박스 (C-03A-03) */}
        <div className="w-full bg-primary-50 rounded-[20px] p-6 flex flex-col items-center gap-4 mb-auto">
          <span className="text-sm text-text-secondary font-medium">내 관심 스타일</span>
          
          <div className="flex flex-wrap justify-center gap-2">
            {selectedStyles.length > 0 ? (
              selectedStyles.map((style: string) => (
                <span key={style} className="text-primary-600 font-bold text-base">
                  #{style}
                </span>
              ))
            ) : (
              <span className="text-sm text-text-tertiary">관심 스타일을 아직 설정하지 않았어요</span>
            )}
          </div>
        </div>

        {/* 하단 시작하기 버튼 영역 */}
        <div className="w-full mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={handleStart}
            className="w-full bg-primary-400 text-white py-[18px] rounded-xl text-base font-bold transition active:scale-95 shadow-md"
          >
            FIT BACK 시작하기
          </button>
          
          <p className="text-xs text-text-tertiary text-center">
            관심 스타일은 마이페이지에서 언제든 변경 가능해요
          </p>
        </div>

      </div>
    </div>
  );
}