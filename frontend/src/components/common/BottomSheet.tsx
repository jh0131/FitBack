import { X } from 'lucide-react';
import type { BottomSheetProps } from '../../types/component';
import '../../styles/BottomSheet.css';

const BottomSheet = ({ isOpen, onClose, title, content }: BottomSheetProps) => {
  // 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      
      {/* 바텀시트 본체 */}
      <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더: 제목과 닫기(X) 버튼 */}
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">{title}</h2>
          <button className="bottom-sheet-close" onClick={onClose} aria-label="닫기">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* 약관 전문 내용 (세로 스크롤) */}
        <div className="bottom-sheet-content">
          {content}
        </div>

        {/* 확인 버튼 (탭 -> 바텀시트 닫힘) */}
        <button className="bottom-sheet-confirm-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default BottomSheet;