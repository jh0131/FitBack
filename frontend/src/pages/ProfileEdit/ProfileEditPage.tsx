import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { Button, TagSelectBottomSheet, TextInput } from '../../components/common'
import type { StyleTag } from '../../api/tags'
import { checkNicknameAvailable } from '../../api/profile'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useMyProfile, useUpdateProfile } from '../../hooks/useMyPage'
import { useTags } from '../../hooks/useTags'
import { navigate } from '../../utils/navigate'
import AvatarEditField from './components/AvatarEditField'

const NICKNAME_DEBOUNCE_MS = 500
const MAX_TAGS = 5

export default function ProfileEditPage() {
  const { data: profile, isLoading } = useMyProfile()
  const { data: allTags = [], isLoading: isTagsLoading } = useTags()
  const { mutate: saveProfile, isPending, isError } = useUpdateProfile()
  const avatarUpload = useImageUpload('PROFILE')

  const [name, setName] = useState('')
  const [selectedTags, setSelectedTags] = useState<StyleTag[]>([])
  const [initialTagIds, setInitialTagIds] = useState<number[]>([])
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!profile || allTags.length === 0) return
    // TODO: 현재 선택된 관심 태그를 내려주는 GET 엔드포인트가 아직 없어서(api-spec.md 확인 중 항목),
    // mock profile의 태그 이름(string[])을 태그 목록과 이름 매칭해서 임시로 채움. 노션 문의 후 교체 예정.
    const matched = profile.styleTags
      .map((tagName) => allTags.find((tag) => tag.tagName === tagName))
      .filter((tag): tag is StyleTag => tag !== undefined)
    setName(profile.name)
    setSelectedTags(matched)
    setInitialTagIds(matched.map((tag) => tag.tagId).sort())
  }, [profile, allTags])

  const handleNameChange = (value: string) => {
    setName(value)
    setNicknameError(null)
    if (checkTimer.current) clearTimeout(checkTimer.current)

    if (value.length === 0) return
    if (value.length < 2) {
      setNicknameError('2자 이상 입력해주세요')
      return
    }
    if (value.length > 16) {
      setNicknameError('16자 이하로 입력해주세요')
      return
    }

    checkTimer.current = setTimeout(async () => {
      setIsCheckingNickname(true)
      const { available } = await checkNicknameAvailable(value)
      setIsCheckingNickname(false)
      if (!available) setNicknameError('이미 사용중인 닉네임입니다')
    }, NICKNAME_DEBOUNCE_MS)
  }

  const handleAvatarSelect = (file: File) => {
    setAvatarPreviewUrl(URL.createObjectURL(file))
    avatarUpload.uploadImage(file)
  }

  const removeTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.tagId !== tagId))
  }

  const isDirty =
    !!profile &&
    (name !== profile.name ||
      JSON.stringify(selectedTags.map((tag) => tag.tagId).sort()) !== JSON.stringify(initialTagIds) ||
      !!avatarPreviewUrl)

  const canSave =
    isDirty &&
    !isPending &&
    !avatarUpload.isUploading &&
    !nicknameError &&
    !isCheckingNickname &&
    name.length >= 2

  const handleBack = () => {
    if (isDirty && !window.confirm('변경 내용이 저장되지 않습니다. 나가시겠어요?')) return
    navigate('/mypage')
  }

  const handleSave = () => {
    if (!canSave) return
    saveProfile(
      { name, styleTags: selectedTags, avatarImageId: avatarUpload.imageId ?? undefined },
      { onSuccess: () => navigate('/mypage') },
    )
  }

  if (isLoading || !profile) {
    return <p className="p-4 text-center text-sm text-text-tertiary">불러오는 중...</p>
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={handleBack} className="text-text-secondary" aria-label="뒤로가기">
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold text-text">회원정보 수정</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="text-sm font-bold text-primary-600 disabled:text-text-tertiary"
        >
          저장
        </button>
      </div>

      <AvatarEditField
        avatarUrl={avatarPreviewUrl ?? profile.avatarUrl}
        isUploading={avatarUpload.isUploading}
        uploadError={avatarUpload.error}
        onSelect={handleAvatarSelect}
        onRetry={avatarUpload.retryUpload}
      />

      <div className="flex flex-col gap-1">
        <TextInput
          label="닉네임"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={nicknameError ?? undefined}
        />
        <span className="text-xs text-text-tertiary">2~16자, 영문·한글·숫자 사용 가능</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">관심 스타일</span>
        <div className="flex flex-wrap items-center gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag.tagId}
              type="button"
              onClick={() => removeTag(tag.tagId)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-800"
            >
              #{tag.tagName}
              <X size={12} strokeWidth={2} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsTagSheetOpen(true)}
            disabled={selectedTags.length >= MAX_TAGS}
            className="rounded-full border border-border px-3 py-1 text-sm text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            + 추가
          </button>
        </div>
      </div>

      <TextInput label="이메일 (변경 불가)" value={profile.email} disabled readOnly />

      {isError && (
        <p className="text-center text-sm text-error-400">저장에 실패했습니다. 다시 시도해주세요</p>
      )}

      <Button disabled={!canSave} onClick={handleSave}>
        저장하기
      </Button>

      <TagSelectBottomSheet
        open={isTagSheetOpen}
        tags={allTags}
        selectedTagIds={selectedTags.map((tag) => tag.tagId)}
        maxTags={MAX_TAGS}
        isLoading={isTagsLoading}
        onConfirm={setSelectedTags}
        onClose={() => setIsTagSheetOpen(false)}
      />
    </div>
  )
}
