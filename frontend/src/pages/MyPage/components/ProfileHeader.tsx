interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl: string
  onAvatarClick: () => void
}

// 아바타 탭 → 회원정보 수정(SCR-12)으로 이동. 사진 변경 자체는 SCR-12에서만 처리 (C-11-01, C-12-03)
export default function ProfileHeader({ name, email, avatarUrl, onAvatarClick }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onAvatarClick}
        className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border"
      >
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </button>
      <div className="flex flex-col">
        <span className="text-base font-semibold text-text">{name}</span>
        <span className="text-sm text-text-secondary">{email}</span>
      </div>
    </div>
  )
}
