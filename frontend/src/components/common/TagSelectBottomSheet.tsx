import { useEffect, useState } from 'react'
import type { StyleTag } from '../../api/tags'
import Button from './Button'

interface TagSelectBottomSheetProps {
  open: boolean
  tags: StyleTag[]
  selectedTagIds: number[]
  maxTags?: number
  isLoading?: boolean
  onConfirm: (tags: StyleTag[]) => void
  onClose: () => void
}

export default function TagSelectBottomSheet({
  open,
  tags,
  selectedTagIds,
  maxTags = 5,
  isLoading = false,
  onConfirm,
  onClose,
}: TagSelectBottomSheetProps) {
  const [draftIds, setDraftIds] = useState<number[]>(selectedTagIds)

  useEffect(() => {
    if (open) setDraftIds(selectedTagIds)
  }, [open, selectedTagIds])

  if (!open) return null

  const toggleTag = (tagId: number) => {
    setDraftIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : prev.length >= maxTags
          ? prev
          : [...prev, tagId],
    )
  }

  const handleConfirm = () => {
    onConfirm(tags.filter((tag) => draftIds.includes(tag.tagId)))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[70vh] w-full max-w-md flex-col gap-3 rounded-t-2xl bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text">관심 스타일 태그 선택</span>
          <span className="text-xs text-text-tertiary">
            {draftIds.length}/{maxTags}
          </span>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-text-tertiary">불러오는 중...</p>
        ) : (
          <div className="flex flex-wrap gap-2 overflow-y-auto">
            {tags.map((tag) => {
              const selected = draftIds.includes(tag.tagId)
              const disabled = !selected && draftIds.length >= maxTags
              return (
                <button
                  key={tag.tagId}
                  type="button"
                  onClick={() => toggleTag(tag.tagId)}
                  disabled={disabled}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? 'bg-primary-600 text-white'
                      : 'bg-bg-secondary text-text-secondary'
                  }`}
                >
                  #{tag.tagName}
                </button>
              )
            })}
          </div>
        )}

        <Button onClick={handleConfirm}>확인</Button>
      </div>
    </div>
  )
}
