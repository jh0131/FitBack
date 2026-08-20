import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

import LoginPage from './pages/LoginPage/LoginPage';
import SignupBasicPage from './pages/LoginPage/SignupBasicPage';
import SignupProfilePage from './pages/LoginPage/SignupProfilePage';
import SignupCompletePage from './pages/LoginPage/SignupCompletePage';
import KakaoCallback from './pages/LoginPage/KakaoCallback';
import FindPasswordPage from './pages/LoginPage/FindPasswordPage';
import ResetPasswordPage from './pages/LoginPage/ResetPasswordPage';
import HomePage from './pages/HomePage';

import LookbookUploadPage from './pages/LookbookUpload/LookbookUploadPage';
import MyClosetPage from './pages/MyCloset/MyClosetPage';
import MyPagePage from './pages/MyPage/MyPagePage';
import NotificationSettingsPage from './pages/NotificationSettings/NotificationSettingsPage';
import ProfileEditPage from './pages/ProfileEdit/ProfileEditPage';
import SearchPage from './pages/SearchPage';

import ImageUploadPage from './pages/ImageUploadPage';
import { AiWaitingPage } from './pages/AiWaitingPage';
import { TagEditPage } from './pages/TagEditPage';
import { ResultReportPage } from './pages/ResultReportPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import WithdrawPage from './pages/WithdrawPage';
import TrendDetailPage from './pages/TrendDetailPage';
import MoreTrendsPage from './pages/MoreTrendsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import LookbookDetailPage from './pages/LookbookDetail/LookbookDetailPage';
import ReportDetailPage from './pages/ReportDetail/ReportDetailPage';
import NotificationListPage from './pages/NotificationListPage';
import { useSaveTrend } from './hooks/useMyCloset';

// 홈 화면 콜백을 실제 라우트로 연결. 이전에 병합 충돌을 해결하면서 이 부분이
// 실수로 옛날 버전(검색 콜백만 있는 버전)으로 되돌아가 "더보기"·트렌드 카드·
// 룩북 카드 클릭이 다시 무반응이 됐었음 — 재발 방지로 다시 연결.
function HomeRoute() {
  const navigate = useNavigate();
  const saveTrend = useSaveTrend();
  return (
    <HomePage
      onOpenSearch={() => navigate('/search')}
      onOpenImageSearch={() => navigate('/image-upload')}
      onSeeMoreTrends={() => navigate('/trends')}
      onOpenTrendDetail={(id) => navigate(`/trend/${id}`)}
      onOpenLookbookDetail={(id) => navigate(`/lookbooks/${id}`)}
      onSaveTrend={(id) => saveTrend.mutate(Number(id))}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout이 적용되는 페이지 그룹 */}
        <Route path='/' element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path='mypage' element={<MyPagePage />} />
          <Route path='closet' element={<MyClosetPage />} />
          <Route path='upload' element={<LookbookUploadPage />} />
          <Route path='profile-edit' element={<ProfileEditPage />} />
          <Route path='notifications' element={<NotificationSettingsPage />} />
          <Route path='image-upload' element={<ImageUploadPage />} />
          <Route path='search' element={<SearchPage />} />
          <Route path='lookbooks/:lookbookId' element={<LookbookDetailPage />} />
          <Route path='reports/:reportId' element={<ReportDetailPage />} />
          <Route path='alerts' element={<NotificationListPage />} />
        </Route>

        {/* Layout이 적용되지 않는 단독 페이지들 */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupBasicPage />} />
        <Route path='/signup/basic' element={<SignupBasicPage />} />
        <Route path='/signup/profile' element={<SignupProfilePage />} />
        <Route path='/signup/complete' element={<SignupCompletePage />} />

        <Route path='/find-password' element={<FindPasswordPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />

        <Route path='/oauth/kakao' element={<KakaoCallback />} />

        <Route path='/change-password' element={<ChangePasswordPage />} />
        <Route path='/withdraw' element={<WithdrawPage />} />

        <Route path='/waiting' element={<AiWaitingPage />} />
        <Route path='/tag-edit' element={<TagEditPage />} />
        <Route path='/result' element={<ResultReportPage />} />
        <Route path='/product/:productId' element={<ProductDetailPage />} />
        <Route path='/trend/:id' element={<TrendDetailPage />} />
        <Route path='/trends' element={<MoreTrendsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
