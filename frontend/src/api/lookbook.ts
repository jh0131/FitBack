import { api } from './axiosInstance'

/**
 * ==========================================
 *  룩북 업로드(SCR-09) 관련 API 통신 정의
 * ==========================================
 * 컴포넌트에서 직접 호출하지 말고 src/hooks/useLookbookUpload.ts 훅을 사용할 것.
 */

export interface LookbookUploadPayload {
  originalImageId: string
  matchedImageId?: string
  matchedProductId?: number
  sourceReportId?: number
  tagIds: number[]
  purchaseUrl?: string
  comment?: string
}

export interface LookbookUploadResult {
  lookbookId: number
}

interface ApiEnvelope<T> {
  success: boolean
  code: string
  message: string
  data: T
}

const USE_MOCK = false
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 이미지는 presigned URL로 S3에 먼저 업로드된 상태 (useImageUpload) — 여기서는 imageId만 전달
export const uploadLookbook = async (
  payload: LookbookUploadPayload,
): Promise<LookbookUploadResult> => {
  if (USE_MOCK) {
    await delay(1500)
    return { lookbookId: Date.now() }
  }

  const response = await api.post<ApiEnvelope<LookbookUploadResult>>(
    '/api/v1/lookbooks',
    payload,
  )
  return response.data.data
}
