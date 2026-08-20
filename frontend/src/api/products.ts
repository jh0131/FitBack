import { api } from './axiosInstance'
import type { RecommendationPrice } from './analysis'

/**
 * ==========================================
 *  상품 상세 관련 API 통신 정의 (실제 백엔드 연동)
 * ==========================================
 *
 * 계약 출처: backend 레포 docs/FRONTEND_PROTOTYPE_API_HANDOFF.md 5.7
 */

export interface ProductDetail {
  productId: number
  imageUrl: string
  name: string
  brandName: string
  sellerName: string
  category: string
  price: RecommendationPrice
  purchaseUrl: string
  affiliateUrl: string | null
  availability: string
  dataStatus: 'LIVE' | 'STALE_SNAPSHOT'
  tags: string[]
  isSaved: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  code: string
  message: string
  data: T
}

export const getProductDetail = async (productId: number): Promise<ProductDetail> => {
  const response = await api.get<ApiEnvelope<ProductDetail>>(`/api/v1/products/${productId}`)
  return response.data.data
}
