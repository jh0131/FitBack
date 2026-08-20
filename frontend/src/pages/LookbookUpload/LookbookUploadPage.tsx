import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button, TagSelectBottomSheet, TextInput } from '../../components/common'
import { useTags } from '../../hooks/useTags'
import type { StyleTag } from '../../api/tags'
import type { SuggestedTag } from '../../api/analysis'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useLookbookUpload } from '../../hooks/useLookbookUpload'
import type { LookbookUploadResult } from '../../api/lookbook'
import ImageUploadField from './components/ImageUploadField'

const URL_PATTERN = /^https?:\/\/[^\s]+$/
const MAX_TAGS = 5

// ResultReportPage에서 "이 조합으로 내 룩북 올리기"로 넘어올 때 전달하는 상태 —
// 분석에서 이미 업로드된 원본 이미지와 선택한 추천 상품을 그대로 재사용해
// 이 화면에서 사진을 다시 올리지 않아도 되게 한다.
export interface LookbookUploadNavState {
  originalImageId: string
  originalImageUrl: string | null
  sourceReportId: number
  matchedProduct: {
    productId: number
    imageUrl: string
    name: string
    purchaseUrl: string
  }
  tags: SuggestedTag[]
}

export default function LookbookUploadPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const fromAnalysis = (location.state as LookbookUploadNavState | null) ?? null

  const [selectedTags, setSelectedTags] = useState<StyleTag[]>(fromAnalysis?.tags ?? [])
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [purchaseLink, setPurchaseLink] = useState(fromAnalysis?.matchedProduct.purchaseUrl ?? '')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const { data: allTags = [], isLoading: isTagsLoading } = useTags()

  // useImageUpload가 uploadImage()의 결과를 반환하지 않고 내부 상태(imageId/lastFile)로 들고 있는 방식이라
  // 여기서도 로컬 state로 별도 관리하지 않고 훅의 상태를 그대로 사용
  // (분석 결과에서 넘어온 경우에는 이 훅들을 아예 쓰지 않는다 — 사진을 다시 안 올리기 때문)
  const originalLookUpload = useImageUpload('LOOKBOOK')
  const valueMatchUpload = useImageUpload('LOOKBOOK')
  const { mutate, isPending, isError, error } = useLookbookUpload()

  // 업로드 완료 후 "됐는지 안 됐는지 모르겠는" 상태로 이 화면에 그대로 남지 않도록,
  // 방금 만들어진 룩북 상세 화면으로 바로 이동시켜 결과를 눈으로 보여준다.
  const goToUploadedLookbook = (data: LookbookUploadResult) => {
    navigate(`/lookbooks/${data.lookbookId}`, { replace: true })
  }

  // 백엔드가 매칭 이미지/매칭 상품 중 정확히 하나만 요구함(둘 다 없거나 둘 다 있으면 에러).
  // 분석 결과에서 넘어온 경우: matchedProductId(+sourceReportId)를 그대로 쓰고 재업로드 불필요.
  // 직접 올리는 경우: 원본/매칭 사진 둘 다 새로 업로드해야 함.
  const canSubmit = fromAnalysis
    ? selectedTags.length > 0 && !isPending
    : !!originalLookUpload.imageId &&
      !!valueMatchUpload.imageId &&
      selectedTags.length > 0 &&
      !isPending &&
      !originalLookUpload.isUploading &&
      !valueMatchUpload.isUploading

  const handlePurchaseLinkChange = (value: string) => {
    setPurchaseLink(value)
    setLinkError(value && !URL_PATTERN.test(value) ? '올바른 링크 형식을 입력해주세요' : null)
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    if (purchaseLink && !URL_PATTERN.test(purchaseLink)) {
      setLinkError('올바른 링크 형식을 입력해주세요')
      return
    }

    if (fromAnalysis) {
      mutate(
        {
          originalImageId: fromAnalysis.originalImageId,
          matchedProductId: fromAnalysis.matchedProduct.productId,
          sourceReportId: fromAnalysis.sourceReportId,
          tagIds: selectedTags.map((tag) => tag.tagId),
          purchaseUrl: purchaseLink || undefined,
          comment: comment || undefined,
        },
        { onSuccess: goToUploadedLookbook },
      )
      return
    }

    if (!originalLookUpload.imageId || !valueMatchUpload.imageId) return
    mutate(
      {
        originalImageId: originalLookUpload.imageId,
        matchedImageId: valueMatchUpload.imageId,
        tagIds: selectedTags.map((tag) => tag.tagId),
        purchaseUrl: purchaseLink || undefined,
        comment: comment || undefined,
      },
      { onSuccess: goToUploadedLookbook },
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold text-text">내 룩북 올리기</h1>

      {fromAnalysis ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text">원본 룩 사진</span>
            <div className="h-40 w-full overflow-hidden rounded-lg bg-bg-secondary">
              {fromAnalysis.originalImageUrl && (
                <img
                  src={fromAnalysis.originalImageUrl}
                  alt="원본 룩 사진"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text">가성비 매칭 상품</span>
            <div className="h-40 w-full overflow-hidden rounded-lg bg-bg-secondary">
              <img
                src={fromAnalysis.matchedProduct.imageUrl}
                alt={fromAnalysis.matchedProduct.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField
            label="원본 룩 사진"
            onChange={originalLookUpload.uploadImage}
            isUploading={originalLookUpload.isUploading}
            uploadError={originalLookUpload.error}
            onRetry={originalLookUpload.retryUpload}
          />
          <ImageUploadField
            label="가성비 매칭 사진"
            onChange={valueMatchUpload.uploadImage}
            isUploading={valueMatchUpload.isUploading}
            uploadError={valueMatchUpload.error}
            onRetry={valueMatchUpload.retryUpload}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">스타일 태그</span>
        <div className="flex flex-wrap items-center gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag.tagId}
              type="button"
              onClick={() => setSelectedTags((prev) => prev.filter((t) => t.tagId !== tag.tagId))}
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

      <TextInput
        label="구매 링크 (선택)"
        placeholder="https://..."
        value={purchaseLink}
        onChange={(e) => handlePurchaseLinkChange(e.target.value)}
        error={linkError ?? undefined}
      />

      <TextInput
        label="코멘트"
        placeholder="한 줄 코멘트를 남겨주세요"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button disabled={!canSubmit} onClick={handleSubmit}>
        {isPending ? '업로드 중...' : '룩북 올리기'}
      </Button>

      {isError && (
        <p className="text-center text-sm text-error-400">
          {error instanceof Error && error.message ? error.message : '업로드에 실패했습니다. 다시 시도해주세요'}
        </p>
      )}

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
