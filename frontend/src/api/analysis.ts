import { api } from './axiosInstance'

/**
 * ==========================================
 *  분석/추천/리포트 저장 관련 API 통신 정의 (실제 백엔드 연동)
 * ==========================================
 *
 * 계약 출처: backend 레포 docs/FRONTEND_PROTOTYPE_API_HANDOFF.md, docs/API_SPEC.md
 */

export interface SuggestedTag {
  tagId: number
  tagName: string
}

export interface AnalysisResult {
  reportId: number
  imageUrl: string
  matchPercentage: number
  suggestedTags: SuggestedTag[]
}

export interface RecommendationPrice {
  amount: number
  currency: string
  type: string
}

export interface RecommendationItem {
  productId: number
  rank: number
  // availability가 TEMPORARILY_UNRESOLVED일 때는 상품 상세를 아직 못 가져온 상태라
  // 아래 필드들이 전부 null로 내려온다.
  imageUrl: string | null
  name: string | null
  sellerName: string | null
  price: RecommendationPrice | null
  purchaseUrl: string | null
  availability: string
  isSaved: boolean
  reasonCode?: string
}

export interface RecommendationGroup {
  category: string
  items: RecommendationItem[]
}

export interface RecommendationsResult {
  reportId: number
  analysisTags: string[]
  matchPercentage: number
  recommendationStatus: string
  recommendationGroups: RecommendationGroup[]
  partial: boolean
  warnings: string[]
}

export interface CreateRecommendationsRequest {
  confirmedTagIds?: number[]
  customTagNames?: string[]
  matchPercentage?: number
}

export interface SaveReportSelectedItem {
  category: string
  productId: number
}

export interface SavedAnalysisItem {
  category: string
  productId: number
  rank: number
  imageUrl: string | null
  name: string | null
  sellerName: string | null
  price: RecommendationPrice | null
  purchaseUrl: string | null
}

export interface SaveReportResult {
  reportId: number
  saved: boolean
  savedAt: string | null
  selectedItems: SavedAnalysisItem[]
}

// GET /api/v1/analyses/{reportId} 전체 응답 — 생성 직후(AnalysisResult, 태그만 있음)와 달리
// 추천/저장 상태까지 포함된 리포트 상세. 마이 클로젯에서 저장된 리포트를 다시 볼 때 씀.
export interface AnalysisReportDetail {
  reportId: number
  // 룩북 올리기(POST /api/v1/lookbooks)에 필요한 원본 이미지 식별자 — 백엔드는 이미
  // 내려주고 있었는데 프론트 타입에 안 받고 있었음.
  originalImageId: string
  imageUrl: string
  matchPercentage: number
  tags: string[]
  recommendationStatus: string
  scoreVersion: string | null
  recommendationGroups: RecommendationGroup[]
  saved: boolean
  savedAt: string | null
  selectedItems: SavedAnalysisItem[]
}

interface ApiEnvelope<T> {
  success: boolean
  code: string
  message: string
  data: T
}

export const createAnalysis = async (imageId: string): Promise<AnalysisResult> => {
  const response = await api.post<ApiEnvelope<AnalysisResult>>('/api/v1/analyses', { imageId })
  return response.data.data
}

export const getAnalysis = async (reportId: number): Promise<AnalysisReportDetail> => {
  const response = await api.get<ApiEnvelope<AnalysisReportDetail>>(`/api/v1/analyses/${reportId}`)
  return response.data.data
}

export const createRecommendations = async (
  reportId: number,
  body?: CreateRecommendationsRequest,
): Promise<RecommendationsResult> => {
  const response = await api.post<ApiEnvelope<RecommendationsResult>>(
    `/api/v1/analyses/${reportId}/recommendations`,
    body,
  )
  return response.data.data
}

export const saveReport = async (
  reportId: number,
  selectedItems: SaveReportSelectedItem[],
): Promise<SaveReportResult> => {
  const response = await api.put<ApiEnvelope<SaveReportResult>>(`/api/v1/analyses/${reportId}/save`, {
    selectedItems,
  })
  return response.data.data
}
