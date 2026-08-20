import { useRef, type ChangeEvent } from 'react'

interface AvatarEditFieldProps {
  avatarUrl: string
  isUploading?: boolean
  uploadError?: string | null
  onSelect: (file: File) => void
  onRetry?: () => void
}

export default function AvatarEditField({
  avatarUrl,
  isUploading = false,
  uploadError = null,
  onSelect,
  onRetry,
}: AvatarEditFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onSelect(file)
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="relative h-16 w-16 overflow-hidden rounded-full border border-border disabled:opacity-70"
      >
        <img src={avatarUrl} alt="프로필 사진" className="h-full w-full object-cover" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[10px] text-white">업로드 중</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-primary-600"
      >
        사진 변경
      </button>
      {uploadError && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-error-400">{uploadError}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium text-primary-600 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  )
}
