import { api } from './axiosInstance';

/**
 * ==========================================
 *  트렌드 관련 API 통신 정의
 * ==========================================
 * 컴포넌트에서 직접 부르지 말고 src/hooks/useTrendsQuery.ts를 사용하세요.
 */

export interface TrendItem {
  trendId: number;
  imageUrl: string;
  title: string;
  tags: string[];
  isSaved: boolean;
}

export interface TrendDetail extends TrendItem {
  description?: string;
}

// 💡 실서버 연동 상태 유지
const USE_MOCK = false;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_TRENDS: TrendItem[] = [
  {
    trendId: 1,
    imageUrl: 'https://picsum.photos/seed/trend1/300/300',
    title: '베이지 트렌치코트',
    tags: ['가을', '클래식'],
    isSaved: false,
  },
  {
    trendId: 2,
    imageUrl: 'https://picsum.photos/seed/trend2/300/300',
    title: '화이트 셔츠',
    tags: ['베이직', '미니멀'],
    isSaved: true,
  },
  {
    trendId: 3,
    imageUrl: 'https://picsum.photos/seed/trend3/300/300',
    title: '블랙 슬랙스',
    tags: ['오피스룩', '시크'],
    isSaved: false,
  },
  {
    trendId: 4,
    imageUrl: 'https://picsum.photos/seed/trend4/300/300',
    title: '오버사이즈 후드',
    tags: ['스트릿', '캐주얼'],
    isSaved: false,
  },
  {
    trendId: 5,
    imageUrl: 'https://picsum.photos/seed/trend5/300/300',
    title: '카고 팬츠',
    tags: ['스트릿', '고프코어'],
    isSaved: false,
  },
  {
    trendId: 6,
    imageUrl: 'https://picsum.photos/seed/trend6/300/300',
    title: '레이스 블라우스',
    tags: ['페미닌', '빈티지'],
    isSaved: false,
  },
  {
    trendId: 7,
    imageUrl: 'https://picsum.photos/seed/trend7/300/300',
    title: '트랙 자켓',
    tags: ['스포티', '캐주얼'],
    isSaved: false,
  },
  {
    trendId: 8,
    imageUrl: 'https://picsum.photos/seed/trend8/300/300',
    title: '와이드 데님',
    tags: ['빈티지', '캐주얼'],
    isSaved: false,
  },
];

/** GET /api/v1/trends - 홈 화면 요즘 트렌드 목록 조회 */
export const getTrends = async (): Promise<TrendItem[]> => {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_TRENDS;
  }
  
  const response = await api.get<{ data: TrendItem[] }>('/api/v1/trends');
  return response.data.data;
};

/** GET /api/v1/trends/{trendId} - 트렌드 카드 선택 시 상세 조회 */
export const getTrendDetail = async (trendId: number): Promise<TrendDetail> => {
  if (USE_MOCK) {
    await delay(400);
    const found = MOCK_TRENDS.find((t) => t.trendId === trendId);
    return {
      trendId: trendId,
      imageUrl: found?.imageUrl ?? MOCK_TRENDS[0].imageUrl,
      title: found?.title ?? '트렌드',
      tags: found?.tags ?? [],
      isSaved: found?.isSaved ?? false,
      description: '이 시즌 인기 있는 스타일이에요.',
    };
  }
  
  const response = await api.get<{ data: TrendDetail }>(`/api/v1/trends/${trendId}`);
  return response.data.data;
};