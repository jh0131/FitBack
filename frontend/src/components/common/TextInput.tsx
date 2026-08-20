import { useId } from 'react'
import type { TextInputProps } from '../../types/component'

const SIZE_CLASSES: Record<NonNullable<TextInputProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-13 px-5 text-lg',
}

export default function TextInput({
  label,
  error,
  size = 'md',
  className = '',
  id,
  ...rest
}: TextInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border bg-white text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 ${
          error ? 'border-error-400' : 'border-border'
        } ${SIZE_CLASSES[size]} ${className}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <span className="text-sm text-error-400">{error}</span>}
    </div>
  )
}
