import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import TabBar from './TabBar';
import UploadSelectSheet, {
  type UploadPurpose,
} from '../domain/UploadSelectSheet';
import OnboardingTutorial from '../domain/OnboardingTutorial';
import UploadHintArrow from '../domain/UploadHintArrow';

const Layout = () => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectPurpose = (purpose: UploadPurpose) => {
    if (purpose === 'analysis') {
      navigate('/image-upload'); // AI 가성비 매칭 분석 ➔ 이미지 업로드 페이지로
    } else if (purpose === 'lookbook') {
      navigate('/upload'); // 내 룩북 올리기 ➔ 룩북 업로드 페이지로
    }
  };

  return (
    <div className='h-screen bg-bg flex justify-center'>
      <div className='w-full max-w-[480px] bg-white h-screen flex flex-col shadow-lg relative'>
        <Header />

        {/* 콘텐츠가 들어갈 영역 */}
        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>

        {/* 3. TabBar에 onUploadClick 핸들러 전달 */}
        <TabBar onUploadClick={() => setIsSheetOpen(true)} />

        {/* 4. 바텀시트 컴포넌트배치 */}
        <UploadSelectSheet
          open={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSelected={handleSelectPurpose}
        />

        {/* 처음 앱을 켠 사용자를 위한 1회성 사용법 안내 */}
        <OnboardingTutorial />

        {/* 홈 화면에서 뭘 해야 할지 몰라 스크롤만 내리게 된다는 피드백 — 업로드
            버튼을 가리키는 1회성 화살표 안내 (첫 방문 시에만) */}
        <UploadHintArrow dismissOn={isSheetOpen} />
      </div>
    </div>
  );
};

export default Layout;
