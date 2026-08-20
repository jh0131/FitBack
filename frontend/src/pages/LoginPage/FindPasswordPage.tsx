import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '../../api/auth';

export default function FindPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 1분(60초) 재요청 제한 타이머 상태
  const [cooldown, setCooldown] = useState(0);

  // 타이머 로직 (cooldown이 0보다 클 때 1초씩 감소)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 이메일 전송 처리 함수
  const handleRequestReset = async () => {
    // 1. 기본 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 2. 1분 이내 재요청 방지
    if (cooldown > 0) {
      const formattedTime = `00:${cooldown.toString().padStart(2, '0')}`;
      setErrorMessage(`잠시 후 다시 시도해주세요 (${formattedTime})`);
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    try {
      await requestPasswordReset(email);

      // 백엔드는 가입 여부 노출 방지를 위해 이메일 존재와 무관하게 항상 같은 성공 응답을 준다.
      // (특정 이메일이 가입돼있는지 알 수 없게 하기 위한 의도적인 설계)
      setStatus('success');
      setCooldown(60);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || '잠시 후 다시 시도해 주세요');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col p-8 font-sans shadow-lg relative">

        {/* 상단 헤더 (뒤로가기 & 타이틀) */}
        <div className="flex items-center gap-2 h-[48px] mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-primary-900 transition"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-bold text-primary-900">
            비밀번호 찾기
          </h1>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-[14px] text-text-secondary mb-10 leading-relaxed">
          가입하신 이메일로 비밀번호 재설정 링크<br />
          를 보내드려요
        </p>

        {/* 폼 영역 */}
        <div className="flex flex-col flex-1">
          {/* 입력 라벨 */}
          <label className="text-[14px] font-medium text-text-secondary mb-2 block">
            가입한 이메일
          </label>

          {/* 이메일 입력창 */}
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            className={`w-full p-4 border rounded-[14px] outline-none text-[15px] transition
              ${email ? 'bg-primary-50 border-primary-200' : 'bg-white border-border'}
              focus:border-primary-400 focus:bg-white
            `}
            disabled={status === 'loading'}
          />

          {/* 에러 메시지 출력 영역 */}
          {errorMessage && (
            <p className="mt-2 text-[13px] text-red-500 font-medium">
              {errorMessage}
            </p>
          )}

          {/* 재설정 링크 보내기 버튼 */}
          <button
            onClick={handleRequestReset}
            disabled={!email || status === 'loading'}
            className="w-full mt-6 bg-[#7E69E8] text-white py-[16px] rounded-[14px] text-[16px] font-bold transition active:scale-95 disabled:bg-border disabled:text-text-tertiary flex justify-center items-center"
          >
            {status === 'loading' ? '전송 중...' : '재설정 링크 보내기'}
          </button>

          {/* 성공 시 나타나는 초록색 안내 카드 */}
          {status === 'success' && (
            <div className="mt-6 bg-[#E8F7F0] border border-[#BDE8D3] p-4 rounded-[14px] flex gap-3 animate-slide-up">
              <span className="text-[#00A86B] font-bold">✓</span>
              <p className="text-[14px] text-[#2D3748] leading-relaxed">
                <span className="font-bold">{email}</span>으로<br />
                재설정 링크를 보냈어요. 5분 이내로 확인해주세요
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
