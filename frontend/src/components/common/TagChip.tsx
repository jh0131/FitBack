import React from 'react';
import { X } from 'lucide-react';

export interface TagChipProps {
  label: string;
  variant?: 'default' | 'deletable' | 'add';
  selected?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  variant = 'default',
  selected = false,
  onDelete,
  onClick,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center text-[12px] font-bold rounded-full transition-colors cursor-pointer';

  if (variant === 'add') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} border border-dashed border-primary-200 text-primary-400 px-[12px] py-[6px] gap-1`}
      >
        <span>+</span>
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'deletable') {
    return (
      <div
        className={`${baseClasses} border border-primary-200 bg-primary-50 text-primary-800 pl-[12px] pr-[8px] py-[6px] gap-[5px]`}
        onClick={onClick}
      >
        <span>#{label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] bg-primary-900/15 text-primary-800 ml-1"
          aria-label="Delete tag"
        >
          <X size={6} strokeWidth={3} />
        </button>
      </div>
    );
  }

  const defaultClasses = selected
    ? 'bg-primary-400 text-bg border-transparent'
    : 'bg-bg-secondary text-text-secondary border border-border';

  return (
    <div
      className={`${baseClasses} ${defaultClasses} px-[12px] py-[6px]`}
      onClick={onClick}
    >
      #{label}
    </div>
  );
};
