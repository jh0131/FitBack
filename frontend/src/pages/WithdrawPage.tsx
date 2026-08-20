import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { withdraw } from '../api/profile';

const WARNING_ITEMS = [
  '저장된 리포트·클로젯 데이터 즉시 삭제',
  '내 룩북은 익명 처리 후 피드에 유지',
  '탈퇴 후 30일간 동일 이메일 재가입 불가',
  '탈퇴 후 데이터 복구 불가',
];

export default function WithdrawPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async () => {
    if (!agreed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await withdraw();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('탈퇴가 완료됐어요. 그동안 이용해주셔서 감사합니다.');
      window.location.href = '/login';
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col px-6 py-8 font-sans shadow-lg relative overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-text-tertiary" aria-label="뒤로가기">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-primary-900">회원 탈퇴</h1>
        </div>

        <div className="rounded-2xl bg-[#FDECEF] border border-[#F5C2CE] p-5 mb-5">
          <h2 className="text-[14px] font-bold text-[#C23A57] mb-3">탈퇴 전 꼭 확인해주세요</h2>
          <ul className="flex flex-col gap-1.5">
            {WARNING_ITEMS.map((item) => (
              <li key={item} className="text-[13px] text-[#8A3247] leading-relaxed">
                · {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-bg-secondary p-4 mb-6">
          <p className="text-[13px] text-text-secondary leading-relaxed">
            룩북도 함께 삭제하려면 탈퇴 전 마이 클로젯에서 직접 삭제해주세요
          </p>
        </div>

        <label className="flex items-start gap-2 mb-8 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary-400"
          />
          <span className="text-[13px] text-text">위 내용을 확인했으며, 탈퇴에 동의합니다</span>
        </label>

        <div className="mt-auto">
          <button
            onClick={handleWithdraw}
            disabled={!agreed || isSubmitting}
            className={`w-full py-4 rounded-xl text-base font-bold transition ${
              agreed && !isSubmitting
                ? 'bg-[#C23A57] text-white active:scale-95'
                : 'bg-border text-text-tertiary cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
