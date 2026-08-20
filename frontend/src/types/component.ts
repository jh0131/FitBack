import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

/**
 * 공용 컴포넌트 규격 (README 공용 컴포넌트 관리 항목 기준)
 * 새 공용 컴포넌트를 만들 때 아래 타입을 확장해서 prop 이름을 통일한다.
 */

export type Variant = 'primary' | 'secondary' | 'ghost'
export type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  size?: Size
  'aria-label': string
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  size?: Size
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label': string
}

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: ReactNode
}