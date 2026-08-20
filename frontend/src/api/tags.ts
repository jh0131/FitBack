import { api } from './axiosInstance'

/**
 * ==========================================
 *  태그 목록 조회 (SCR-03/SCR-12 관심 스타일 태그 선택용)
 * ==========================================
 *
 * GET /api/v1/tags는 태그 전체(STYLE/SILHOUETTE/MATERIAL/DETAIL/COLOR)를 다 내려주는데,
 * 트렌드 아티클(constants/trendArticles.ts)이 5개 태그로만 운영되는 것과 맞춰
 * 관심 스타일 선택지도 동일한 5개(미니멀/스트릿/러블리/캐주얼/포멀)로 제한한다.
 *
 * 예전엔 이 5개를 tagId까지 하드코딩한 mock으로 대체하고 있었는데, 백엔드 태그
 * 체계가 재정비되면서 실제 tagId가 전부 바뀌어 저장 시 완전히 다른 태그로
 * 연결되는 문제가 있었다 — 이제 실제 API에서 이름으로만 걸러 쓰도록 수정.
 */

export interface StyleTag {
  tagId: number
  tagName: string
}

const INTEREST_STYLE_TAG_NAMES = ['미니멀', '스트릿', '러블리', '캐주얼', '포멀']

interface TagApiItem {
  tagId: number
  tagName: string
  tagType: string
  targetClothing: string[]
}

interface TagsApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    items: TagApiItem[]
  }
}

export const getTags = async (): Promise<StyleTag[]> => {
  const response = await api.get<TagsApiResponse>('/api/v1/tags')
  const byName = new Map(response.data.data.items.map((tag) => [tag.tagName, tag]))
  return INTEREST_STYLE_TAG_NAMES
    .map((name) => byName.get(name))
    .filter((tag): tag is TagApiItem => tag !== undefined)
    .map((tag) => ({ tagId: tag.tagId, tagName: tag.tagName }))
}

// getTags()와 달리 관심 스타일 5개로 좁히지 않고 전체 태그(STYLE/SILHOUETTE/MATERIAL/
// DETAIL/COLOR)를 그대로 반환한다. 분석 리포트의 확정 태그(이름만 있고 tagId가 없음)를
// 룩북 업로드용 tagId 있는 형태로 되찾을 때 이름으로 매칭하는 용도로 쓴다.
export const getAllTags = async (): Promise<StyleTag[]> => {
  const response = await api.get<TagsApiResponse>('/api/v1/tags')
  return response.data.data.items.map((tag) => ({ tagId: tag.tagId, tagName: tag.tagName }))
}
