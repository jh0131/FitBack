import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const HINT_SEEN_KEY = 'fitback:upload-hint-seen';
const AUTO_DISMISS_MS = 6000;

interface UploadHintArrowProps {
  // 업로드 버튼을 눌러 바텀시트가 열리면(라우트 이동 없이도) 더 이상 보여줄 필요가 없음
  dismissOn?: boolean;
}

// 홈 화면에 처음 들어왔을 때, 뭘 해야 할지 몰라서 계속 스크롤만 내리게 된다는
// 피드백으로 추가 — 하단 업로드 버튼을 가리키는 1회성 안내 화살표.
export default function UploadHintArrow({ dismissOn }: UploadHintArrowProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const dismiss = () => {
    localStorage.setItem(HINT_SEEN_KEY, 'true');
    setVisible(false);
  };

  useEffect(() => {
    if (!localStorage.getItem(HINT_SEEN_KEY)) setVisible(true);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/' && visible) dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (dismissOn && visible) dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissOn]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible || location.pathname !== '/') return null;

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="여기를 눌러 업로드를 시작하세요"
      className="absolute inset-x-0 bottom-[84px] z-30 flex flex-col items-center gap-1"
    >
      <span className="animate-bounce rounded-full bg-primary-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
        사진을 올려서 시작해보세요!
      </span>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-bounce text-primary-800 drop-shadow"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </button>
  );
}
