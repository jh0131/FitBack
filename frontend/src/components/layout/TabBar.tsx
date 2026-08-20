import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Plus, Search, User } from 'lucide-react';

interface TabBarProps {
  onUploadClick?: () => void;
}

const TabBar = ({ onUploadClick }: TabBarProps) => {
  const location = useLocation();

  // 현재 경로와 링크 경로가 같은지 확인하는 함수
  const isActive = (path: string) => location.pathname === path;

  // 스타일을 결정하는 공통 함수
  const getLinkClass = (path: string) => 
    `flex flex-col items-center transition-colors ${isActive(path) ? 'text-primary-600' : 'text-text-secondary'}`;

  return (
    <nav className="h-16 w-full flex items-center justify-around border-t border-primary-200 bg-white z-40">
      
      {/* 홈 */}
      <Link to="/" className={getLinkClass('/')}>
        <Home size={26} />
        <span className="text-[10px] mt-1 font-medium">홈</span>
      </Link>

      {/* 클로젯 */}
      <Link to="/closet" className={getLinkClass('/closet')}>
        <Menu size={26} />
        <span className="text-[10px] mt-1 font-medium">클로젯</span>
      </Link>
      
      {/* 업로드 버튼 */}
      {onUploadClick ? (
        <button
          type="button"
          onClick={onUploadClick}
          className="flex flex-col items-center focus:outline-none"
        >
          <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-8 shadow-lg hover:bg-primary-800 transition-colors border-4 border-white">
            <Plus size={32} strokeWidth={3} />
          </div>
          <span className={`text-[10px] mt-1 font-medium ${isActive('/upload') ? 'text-primary-600' : 'text-text-secondary'}`}>
            업로드
          </span>
        </button>
      ) : (
        <Link to="/upload" className="flex flex-col items-center">
          <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-8 shadow-lg hover:bg-primary-800 transition-colors border-4 border-white">
            <Plus size={32} strokeWidth={3} />
          </div>
          <span className={`text-[10px] mt-1 font-medium ${isActive('/upload') ? 'text-primary-600' : 'text-text-secondary'}`}>
            업로드
          </span>
        </Link>
      )}
      
      {/* 검색 */}
      <Link to="/search" className={getLinkClass('/search')}>
        <Search size={26} />
        <span className="text-[10px] mt-1 font-medium">검색</span>
      </Link>

      {/* 마이 */}
      <Link to="/mypage" className={getLinkClass('/mypage')}>
        <User size={26} />
        <span className="text-[10px] mt-1 font-medium">마이</span>
      </Link>
    </nav>
  );
};

export default TabBar;