import { useEffect, useState } from 'react';
import { Sparkles, Camera, Heart, ShoppingBag } from 'lucide-react';

const SEEN_KEY = 'fitback:onboarding-seen';

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    icon: <Sparkles size={40} strokeWidth={1.8} />,
    title: 'FIT-BACK에 오신 걸 환영해요',
    desc: '워너비 사진을 올리면 AI가 비슷한 느낌의 가성비 아이템을 찾아드려요.',
  },
  {
    icon: <Camera size={40} strokeWidth={1.8} />,
    title: '하단 + 버튼으로 시작해보세요',
    desc: '따라 하고 싶은 옷 사진(상의·하의·원피스·아우터)을 올리면 AI가 태그를 뽑아줘요.',
  },
  {
    icon: <ShoppingBag size={40} strokeWidth={1.8} />,
    title: '마음에 드는 대안을 골라보세요',
    desc: '추천된 상품 중 하나를 골라 저장하거나, 내 룩북으로 올려서 공유할 수 있어요.',
  },
  {
    icon: <Heart size={40} strokeWidth={1.8} />,
    title: '다른 사람 룩북도 구경해보세요',
    desc: '홈 화면에서 요즘 트렌드와 다른 사람들의 룩북을 둘러보고 좋아요를 눌러보세요.',
  },
];

export default function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // 로그인 여부와 무관하게 이 브라우저에서 처음 앱을 켰을 때 한 번만 보여준다.
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) setVisible(true);
  }, []);

  const close = () => {
    localStorage.setItem(SEEN_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-[340px] rounded-3xl bg-white p-7 shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="건너뛰기"
          className="mb-2 block w-full text-right text-xs font-medium text-text-tertiary"
        >
          건너뛰기
        </button>

        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-500">
          {step.icon}
        </div>

        <h2 className="mb-2 text-lg font-extrabold text-text leading-snug">{step.title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-text-secondary">{step.desc}</p>

        <div className="mb-5 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? 'w-5 bg-primary-400' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
          className="w-full rounded-xl bg-primary-400 py-3.5 text-sm font-bold text-white transition hover:bg-primary-500 active:scale-95"
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
