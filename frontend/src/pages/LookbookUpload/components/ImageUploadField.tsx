import { useRef, useState, type ChangeEvent } from 'react'

interface ImageUploadFieldProps {
  label: string
  onChange: (file: File) => void
  isUploading?: boolean
  uploadError?: string | null
  onRetry?: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ImageUploadField({
  label,
  onChange,
  isUploading = false,
  uploadError = null,
  onRetry,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    e.target.value = ''
    if (!selected) return

    if (selected.size > MAX_FILE_SIZE) {
      setLocalError('5MB 이하 이미지만 업로드 가능합니다')
      return
    }

    setLocalError(null)
    setPreviewUrl(URL.createObjectURL(selected))
    onChange(selected)
  }

  const error = localError ?? uploadError

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg-secondary disabled:opacity-70"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-text-tertiary">탭하여 사진 선택</span>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-sm text-white">업로드 중...</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
      {error && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-error-400">{error}</span>
          {uploadError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-medium text-primary-600 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  )
}
