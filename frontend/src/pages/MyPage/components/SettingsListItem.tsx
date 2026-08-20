import type { ReactNode } from 'react'

interface SettingsListItemProps {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
}

export default function SettingsListItem({ label, icon, onClick, disabled }: SettingsListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between border-b border-border py-3 text-left text-base text-text last:border-b-0 disabled:text-text-tertiary"
    >
      <span className="flex items-center gap-2">
        {icon && (
          <span className="text-text-tertiary" aria-hidden>
            {icon}
          </span>
        )}
        {label}
      </span>
      <span aria-hidden>›</span>
    </button>
  )
}
