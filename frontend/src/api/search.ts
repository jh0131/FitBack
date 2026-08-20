import { api } from './axiosInstance'
import type { TrendItem } from './trends'
import { TREND_ARTICLES, type TrendArticle } from '../constants/trendArticles'

/**
 * ==========================================
 *  통합 콘텐츠 검색 (SCR-16) API 통신 정의
 * ==========================================
 */

// 💡 1. 룩북 검색 아이템 타입 수정 (id -> lookbookId, imageUrl -> originalImageUrl)
export interface LookbookSearchItem {
  lookbookId: number
  originalImageUrl: string
  authorNickname: string
  authorProfileImageUrl: string | null
  tags: string[]
  likeCount: number
  isLiked: boolean
}

export interface ContentSearchResult {
  trends: TrendItem[]
  lookbooks: LookbookSearchItem[]
}

interface ApiEnvelope<T> {
  success: boolean
  code: string
  message: string
  data: T
}

interface LookbookSearchApiItem {
  lookbookId: number
  originalImageUrl: string
  matchedImageUrl: string | null
  matchedProductId: number | null
  authorNickname: string
  authorProfileImageUrl: string | null
  tags: string[]
  likeCount: number
  isLiked: boolean
}

interface ContentSearchApiResponse {
  trends: unknown[]
  lookbooks: LookbookSearchApiItem[]
}

const USE_MOCK = false
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 💡 2. 목업 데이터도 새 필드명에 맞게 변경
const MOCK_LOOKBOOKS: LookbookSearchItem[] = [
  {
    lookbookId: 1,
    originalImageUrl: 'https://picsum.photos/seed/lookbook1/300/300',
    authorNickname: 'minji_style',
    authorProfileImageUrl: null,
    tags: ['미니멀', '오피스룩'],
    likeCount: 12,
    isLiked: false,
  },
  {
    lookbookId: 2,
    originalImageUrl: 'https://picsum.photos/seed/lookbook2/300/300',
    authorNickname: 'street_boy',
    authorProfileImageUrl: null,
    tags: ['캐주얼', '스트릿'],
    likeCount: 4,
    isLiked: false,
  },
]

function trendThumbnail(article: TrendArticle): string {
  if (article.contentType === 'photo') return article.imageUrl
  if (article.contentType === 'magazine') return article.photos[0] ?? ''
  if (article.contentType === 'youtube') {
    return `https://img.youtube.com/vi/${article.youtubeVideoId}/hqdefault.jpg`
  }
  return ''
}

// 💡 3. 트렌드 아이템 매핑 수정 (id->trendId, label->title, styleTags->tags, isSaved 추가)
function searchLocalTrends(keyword: string): TrendItem[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return []
  return TREND_ARTICLES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.relatedTags.some((tag) => tag.toLowerCase().includes(q)),
  ).map((t) => ({
    trendId: t.id,
    imageUrl: trendThumbnail(t),
    title: t.title,
    tags: t.relatedTags.map((tag) => tag.replace('#', '')),
    isSaved: false, 
  }))
}

/** GET /api/v1/content-search?keyword= - 룩북 검색(트렌드는 로컬 콘텐츠 대상) */
export const searchContent = async (keyword: string): Promise<ContentSearchResult> => {
  const trends = searchLocalTrends(keyword)

  if (USE_MOCK) {
    await delay(400)
    const q = keyword.trim().toLowerCase()
    if (!q) return { trends: [], lookbooks: [] }

    return {
      trends,
      lookbooks: MOCK_LOOKBOOKS.filter(
        (l) =>
          l.authorNickname.toLowerCase().includes(q) ||
          l.tags.some((tag) => tag.toLowerCase().includes(q)),
      ),
    }
  }

  const response = await api.get<ApiEnvelope<ContentSearchApiResponse>>(
    '/api/v1/content-search',
    { params: { keyword } },
  )
  
  // 💡 4. 룩북 리턴 시 새 필드명(lookbookId, originalImageUrl) 매핑 적용
  const lookbooks = response.data.data.lookbooks.map((item) => ({
    lookbookId: item.lookbookId,
    originalImageUrl: item.matchedImageUrl ?? item.originalImageUrl,
    authorNickname: item.authorNickname,
    authorProfileImageUrl: item.authorProfileImageUrl,
    tags: item.tags,
    likeCount: item.likeCount,
    isLiked: item.isLiked,
  }))
  
  return { trends, lookbooks }
}