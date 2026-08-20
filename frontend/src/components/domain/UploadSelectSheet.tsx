import { Camera } from 'lucide-react';

export type UploadPurpose = 'analysis' | 'lookbook';

interface UploadSelectSheetProps {
  open: boolean;
  onClose: () => void;
  onSelected: (purpose: UploadPurpose) => void;
}

export default function UploadSelectSheet({
  open,
  onClose,
  onSelected,
}: UploadSelectSheetProps) {
  if (!open) return null;

  const handleSelect = (purpose: UploadPurpose) => {
    onSelected(purpose);
    onClose();
  };

  // TODO: 드래그 다운으로 닫는 제스처는 추후 추가 (현재는 배경 탭으로만 닫힘)
  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      {/* 백드롭 배경 딤 처리 - 탭하면 닫힘 */}
      <button
        type='button'
        aria-label='닫기'
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
      />

      {/* 바텀시트 본체 */}
      <div className='relative z-10 w-full max-w-[375px] rounded-t-3xl bg-white px-5 pb-8 pt-3 border-t border-border shadow-2xl animate-[slideUp_0.25s_ease-out]'>
        <div className='mx-auto mb-5 h-1 w-10 rounded-full bg-border' />

        <h2 className='text-base font-bold text-text'>무엇을 하시겠어요?</h2>
        <p className='mt-1 text-xs text-text-secondary'>보통 이 순서로 진행해요</p>

        <div className='mt-5 space-y-3'>
          <SheetOption
            step={1}
            label='AI 가성비 매칭 분석'
            description='워너비 사진으로 가성비 아이템 찾기'
            icon={<Camera size={20} strokeWidth={2} />}
            onClick={() => handleSelect('analysis')}
          />
          <SheetOption
            step={2}
            label='내 룩북 올리기'
            description='매칭 결과를 다른 유저와 공유 (매칭을 먼저 하면 결과를 그대로 가져올 수 있어요)'
            icon={<GalleryIcon />}
            onClick={() => handleSelect('lookbook')}
          />
        </div>
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

interface SheetOptionProps {
  step: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function SheetOption({ step, label, description, icon, onClick }: SheetOptionProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex w-full items-center gap-4 rounded-2xl border border-border px-4 py-3.5 text-left transition active:bg-bg'
    >
      <div className='relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bg-secondary text-primary-400'>
        {icon}
        <span className='absolute -top-1.5 -left-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary-400 text-[9px] font-bold text-white'>
          {step}
        </span>
      </div>
      <div>
        <p className='text-sm font-bold text-text'>{label}</p>
        <p className='text-xs text-text-secondary mt-0.5'>{description}</p>
      </div>
    </button>
  );
}

function GalleryIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
    >
      <rect x='3' y='4' width='18' height='16' rx='2' />
      <circle cx='8.5' cy='9.5' r='1.5' />
      <path d='M21 16l-5-5-4 4-3-3-5 5' />
    </svg>
  );
}
