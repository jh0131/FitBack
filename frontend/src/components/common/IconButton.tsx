import type { IconButtonProps } from '../../types/component'

const SIZE_CLASSES: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export default function IconButton({
  icon,
  size = 'md',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={`flex items-center justify-center rounded-full text-text hover:bg-bg-secondary disabled:cursor-not-allowed disabled:text-text-tertiary ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  )
}
