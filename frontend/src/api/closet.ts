import { api } from './axiosInstance'

/**
 * ==========================================
 *  마이 클로젯(SCR-10) 관련 API 통신 정의
 * ==========================================
 *
 * 현재는 USE_MOCK = true로 가짜 응답을 반환하며, 추후 백엔드 연동 시 아래 실제 API 호출 로직으로 교체할 예정이다.
 * 컴포넌트에서 직접 호출하지 말고 src/hooks/useMyCloset.ts 훅을 사용할 것.
 */

export type ClosetCategory = 'trend' | 'lookbook' | 'report'

export interface ClosetItem {
  id: number
  // 상세 화면 이동에 쓰는 실제 대상(트렌드/룩북/리포트) ID. id(saveId)와는 다름.
  targetId: number
  category: ClosetCategory
  imageUrl: string
  // 원본/매칭 비교 UI를 쓰는 룩북 항목만 값이 있고, 나머지 카테고리는 null
  matchedImageUrl: string | null
  title: string
  // 카드에 태그 칩으로 개별 표시하기 위한 원본 배열 — title은 이 배열을 이어붙인
  // 것이라 삭제 확인 문구/이미지 alt처럼 통짜 문자열이 필요한 곳에서만 쓴다.
  tags: string[]
}

// 실제 API(GET /api/v1/closet-saves)의 targetType → 화면에서 쓰는 ClosetCategory 매핑 (api-spec.md 참고)
type ClosetTargetType = 'TREND' | 'LOOKBOOK' | 'ANALYSIS_REPORT'

const TARGET_TYPE_TO_CATEGORY: Record<ClosetTargetType, ClosetCategory> = {
  TREND: 'trend',
  LOOKBOOK: 'lookbook',
  ANALYSIS_REPORT: 'report',
}

interface ClosetSaveApiItem {
  saveId: number
  targetType: ClosetTargetType
  targetId: number
  thumbnailUrl: string
  // 원본/매칭 비교 UI 를 쓰는 룩북만 값, 나머지 타입은 null
  matchedImageUrl: string | null
  tags: string[]
}

interface ClosetSavesApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    items: ClosetSaveApiItem[]
    nextCursor: number | null
    hasNext: boolean
    pageSize: number
  }
}

// 마이클로젯 GET/DELETE는 별도 플래그로 분리 — GET은 스펙 확정, DELETE는 saveId 누락으로 아직 연동 불가
const USE_MOCK_GET = false
const USE_MOCK_DELETE = false
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_CLOSET_ITEMS: ClosetItem[] = [
  { id: 1, targetId: 101, category: 'trend', imageUrl: 'https://picsum.photos/seed/trend1/300', matchedImageUrl: null, title: '오버사이즈, 자켓', tags: ['오버사이즈', '자켓'] },
  { id: 2, targetId: 102, category: 'trend', imageUrl: 'https://picsum.photos/seed/trend2/300', matchedImageUrl: null, title: '와이드핏, 데님', tags: ['와이드핏', '데님'] },
  { id: 3, targetId: 201, category: 'lookbook', imageUrl: 'https://picsum.photos/seed/look1/300', matchedImageUrl: 'https://picsum.photos/seed/look1-matched/300', title: '미니멀, 캐주얼', tags: ['미니멀', '캐주얼'] },
  { id: 4, targetId: 202, category: 'lookbook', imageUrl: 'https://picsum.photos/seed/look2/300', matchedImageUrl: 'https://picsum.photos/seed/look2-matched/300', title: '스트릿', tags: ['스트릿'] },
  { id: 5, targetId: 301, category: 'report', imageUrl: 'https://picsum.photos/seed/report1/300', matchedImageUrl: null, title: '7월 스타일 분석 리포트', tags: ['미니멀', '캐주얼'] },
]

export const getClosetItems = async (): Promise<ClosetItem[]> => {
  if (USE_MOCK_GET) {
    await delay(1500)
    return MOCK_CLOSET_ITEMS
  }

  const response = await api.get<ClosetSavesApiResponse>('/api/v1/closet-saves')
  return response.data.data.items.map((item) => ({
    id: item.saveId,
    targetId: item.targetId,
    category: TARGET_TYPE_TO_CATEGORY[item.targetType],
    imageUrl: item.thumbnailUrl,
    matchedImageUrl: item.matchedImageUrl,
    // TODO: 실제 응답엔 title 필드가 없어 tags로 임시 대체 — 화면 표시 문구는 기획 확인 필요
    title: item.tags.join(', '),
    tags: item.tags,
  }))
}

// id는 getClosetItems가 반환한 saveId다.
export const deleteClosetItem = async (id: number): Promise<void> => {
  if (USE_MOCK_DELETE) {
    await delay(500)
    return
  }

  await api.delete(`/api/v1/closet-saves/${id}`)
}

// 홈 화면 트렌드 카드의 "저장" 버튼용. trendId는 트렌드 콘텐츠(constants/trendArticles.ts)의 id.
export const saveTrendToCloset = async (trendId: number): Promise<void> => {
  await api.post('/api/v1/closet-saves', {
    targetType: 'TREND',
    targetId: trendId,
  })
}
