import { useState } from 'react';
import { reportLookbook } from '../../../api/lookbooks';
import type { ReportType } from '../../../api/lookbooks';

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'INAPPROPRIATE_IMAGE', label: '부적절한 이미지 (성인/폭력)' },
  { value: 'COPYRIGHT_INFRINGEMENT', label: '저작권 침해 / 무단 도용' },
  { value: 'FRAUD_OR_FALSE_INFORMATION', label: '허위 정보 / 사기' },
  { value: 'SPAM_OR_ADVERTISEMENT', label: '스팸 / 광고성 콘텐츠' },
  { value: 'OTHER', label: '기타' },
];

interface ReportBottomSheetProps {
  isOpen: boolean;
  lookbookId: number;
  onClose: () => void;
}

export default function ReportBottomSheet({
  isOpen,
  lookbookId,
  onClose,
}: ReportBottomSheetProps) {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await reportLookbook(lookbookId, selected);
      alert('신고가 접수되었습니다. 검토 후 조치할게요');
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 409) {
        alert('이미 신고한 룩북이에요');
      } else {
        alert('잠시 후 다시 시도해주세요');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      {/* 백드롭 배경 딤 처리 - 탭하면 닫힘 */}
      <button
        type='button'
        aria-label='닫기'
        onClick={onClose}
        className='absolute inset-0 bg-black/30'
      />

      {/* 바텀시트 본체 */}
      <div className='relative z-10 w-full max-w-[375px] rounded-t-3xl bg-white px-4 pb-6 pt-2.5 shadow-2xl animate-[slideUp_0.25s_ease-out]'>
        {/* 드래그 핸들 */}
        <div className='mx-auto mb-3.5 h-[3px] w-8 rounded-full bg-border' />

        {/* 타이틀 */}
        <h2 className='text-[13px] font-bold text-text mb-3.5'>
          신고 유형을 선택해주세요
        </h2>

        {/* 옵션 리스트 — 리스트형, 라디오는 왼쪽, 구분선만 */}
        <div className='flex flex-col mb-3.5'>
          {REPORT_OPTIONS.map((opt, index) => {
            const isChecked = selected === opt.value;
            const isLast = index === REPORT_OPTIONS.length - 1;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 py-3 cursor-pointer ${
                  !isLast ? 'border-b border-border' : ''
                }`}
              >
                <input
                  type='radio'
                  name='reportType'
                  checked={isChecked}
                  onChange={() => setSelected(opt.value)}
                  className='sr-only'
                />
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px] ${
                    isChecked ? 'border-error-400 bg-error-400' : 'border-border'
                  }`}
                >
                  {isChecked && (
                    <span className='h-1.5 w-1.5 rounded-full bg-white' />
                  )}
                </span>
                <span
                  className={`text-xs text-text ${isChecked ? 'font-semibold' : ''}`}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* 제출 버튼 — destructive 핑크 */}
        <button
          type='button'
          className='w-full rounded-xl bg-error-400 py-3 text-xs font-bold text-white transition disabled:bg-gray-200 disabled:text-gray-400'
          disabled={!selected || submitting}
          onClick={handleSubmit}
        >
          {submitting ? '접수 중...' : '신고하기'}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
