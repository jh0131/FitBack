import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadNotificationCount } from '../../hooks/useNotification';
import hangerIcon from '../../assets/hanger-icon.png';

const Header = () => {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 bg-white">
      {/* 1. 로고 영역 */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
        {/* 배경 있는 사각형 로고 대신, 배경 없이 옷걸이 아이콘만 글자 색과
            통일해서 나란히 배치 */}
        <img
          src={hangerIcon}
          alt="FIT BACK 로고"
          className="h-8 w-auto object-contain"
        />
        <div className="font-extrabold text-xl text-primary-900">FIT BACK</div>
      </div>

      {/* 2. 알림 아이콘 영역 */}
      <button
        className="relative flex items-center justify-center w-10 h-10 text-gray-500"
        onClick={() => navigate('/alerts')}
        aria-label='알림'
      >
        {/* 디자인 시스템 아이콘 시트(System·알림)과 동일한 stroke 2px 종 아이콘 */}
        <Bell size={22} strokeWidth={2} />

        {/* 빨간색 알림 점 */}
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-error-400 border-2 border-white" />
        )}
      </button>
    </header>
  );
};

export default Header;