// components/domain/SearchBar.tsx
import { Search, Camera } from 'lucide-react';

interface SearchBarProps {
  onOpenSearch?: () => void;
  onOpenImageSearch?: () => void;
}

export default function SearchBar({
  onOpenSearch,
  onOpenImageSearch,
}: SearchBarProps) {
  return (
    <div className='px-5 pt-2'>
      <button
        type='button'
        onClick={onOpenSearch}
        className='w-full flex items-center gap-2 rounded-2xl bg-primary-50/50 px-3.5 py-2.5 text-left transition active:bg-primary-50'
      >
        <Search size={16} className='text-text-tertiary' strokeWidth={2} />

        <span className='flex-1 text-xs text-text-tertiary'>
          스타일, 브랜드, 태그 검색
        </span>

        <span
          role='button'
          aria-label='이미지로 검색'
          onClick={(e) => {
            e.stopPropagation();
            onOpenImageSearch?.();
          }}
          className='text-primary-400'
        >
          <Camera size={18} strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}
