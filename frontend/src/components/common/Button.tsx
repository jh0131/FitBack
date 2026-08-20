import type { ButtonProps } from '../../types/component'

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-800 disabled:bg-primary-100 disabled:text-text-tertiary',
  secondary: 'bg-bg-secondary text-primary-800 hover:bg-primary-100 disabled:bg-bg-secondary disabled:text-text-tertiary',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 disabled:text-text-tertiary',
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-13 px-6 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
