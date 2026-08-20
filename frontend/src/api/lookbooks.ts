import { api } from './axiosInstance';

/**
 * ==========================================
 *  룩북 상세(SCR-04B) / 신고(SCR-04C) 관련 API 통신 정의
 * ==========================================
 * 컴포넌트에서 직접 부르지 말고 src/hooks/useLookbookDetail.ts를 사용하세요.
 */

// 백엔드 LookbookReportReason과 동일한 값 (Lookbook 컨트롤러 기준)
export type ReportType =
  | 'INAPPROPRIATE_IMAGE'
  | 'COPYRIGHT_INFRINGEMENT'
  | 'FRAUD_OR_FALSE_INFORMATION'
  | 'SPAM_OR_ADVERTISEMENT'
  | 'OTHER';

export interface LookbookTag {
  tagId: number;
  tagName: string;
}

export interface LookbookDetail {
  id: number;
  // 마이 클로젯 저장 항목 ID. 내가 저장한 적 없으면 null — 저장 취소(DELETE) 호출 시 필요하다.
  saveId: number | null;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  createdAt: string;
  originalImageUrl: string;
  matchedImageUrl: string | null;
  // 매칭 상품이 실제 상품 카탈로그에 있을 때만 채워짐 — 있으면 GET /api/v1/products/{id}로 상세(이름/가격/판매처) 조회
  matchedProductId: number | null;
  purchaseUrl: string | null;
  tags: LookbookTag[];
  comment: string | null;
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

const USE_MOCK = false;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDetail: LookbookDetail = {
  id: 1,
  saveId: null,
  authorNickname: '@minji_style',
  authorProfileImageUrl: null,
  createdAt: new Date().toISOString(),
  originalImageUrl: 'https://picsum.photos/seed/original/800/1000',
  matchedImageUrl: 'https://picsum.photos/seed/matched/800/1000',
  matchedProductId: 1,
  purchaseUrl: 'https://example.com',
  tags: [
    { tagId: 1, tagName: '미니멀' },
    { tagId: 2, tagName: '와이드핏' },
    { tagId: 3, tagName: '베이지톤' },
  ],
  comment:
    '무신사에서 3만원대에 찾았어요! 핏이 거의 똑같고 소재도 생각보다 좋아서 만족 😊',
  likeCount: 128,
  isLiked: false,
  isOwner: false,
};

/** GET /api/v1/lookbooks/{lookbookId} */
export const getLookbookDetail = async (
  lookbookId: number,
): Promise<LookbookDetail> => {
  if (USE_MOCK) {
    await delay(400);
    return { ...mockDetail, id: lookbookId };
  }
  const response = await api.get<ApiEnvelope<Omit<LookbookDetail, 'id'>>>(
    `/api/v1/lookbooks/${lookbookId}`,
  );
  return { id: lookbookId, ...response.data.data };
};

/** POST /api/v1/lookbooks/{lookbookId}/likes — 좋아요 등록 */
export const likeLookbook = async (
  lookbookId: number,
): Promise<{ isLiked: boolean; likeCount: number }> => {
  if (USE_MOCK) {
    await delay(200);
    return { isLiked: true, likeCount: mockDetail.likeCount + 1 };
  }
  const response = await api.post<
    ApiEnvelope<{ isLiked: boolean; likeCount: number }>
  >(`/api/v1/lookbooks/${lookbookId}/likes`);
  return response.data.data;
};

/** DELETE /api/v1/lookbooks/{lookbookId}/likes — 좋아요 취소 */
export const unlikeLookbook = async (
  lookbookId: number,
): Promise<{ isLiked: boolean; likeCount: number }> => {
  if (USE_MOCK) {
    await delay(200);
    return { isLiked: false, likeCount: Math.max(mockDetail.likeCount - 1, 0) };
  }
  const response = await api.delete<
    ApiEnvelope<{ isLiked: boolean; likeCount: number }>
  >(`/api/v1/lookbooks/${lookbookId}/likes`);
  return response.data.data;
};

/**
 * 룩북 저장(찜)은 룩북 전용 엔드포인트가 없고 공용 마이 클로젯 API를 사용한다
 * (POST /api/v1/closet-saves, targetType: 'LOOKBOOK'). 생성된 saveId를 돌려줘서
 * 화면 상태를 바로 "저장됨"으로 갱신하고, 이후 저장 취소(unsaveLookbook) 호출에 쓴다.
 */
export const saveLookbook = async (
  lookbookId: number,
): Promise<{ saveId: number }> => {
  if (USE_MOCK) {
    await delay(200);
    return { saveId: 1 };
  }
  const response = await api.post<ApiEnvelope<{ saveId: number }>>(
    '/api/v1/closet-saves',
    { targetType: 'LOOKBOOK', targetId: lookbookId },
  );
  return { saveId: response.data.data.saveId };
};

/** DELETE /api/v1/closet-saves/{saveId} — 룩북 저장 취소 */
export const unsaveLookbook = async (saveId: number): Promise<void> => {
  if (USE_MOCK) {
    await delay(200);
    return;
  }
  await api.delete(`/api/v1/closet-saves/${saveId}`);
};

/** POST /api/v1/lookbooks/{lookbookId}/reports */
export const reportLookbook = async (
  lookbookId: number,
  reason: ReportType,
): Promise<void> => {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await api.post(`/api/v1/lookbooks/${lookbookId}/reports`, { reason });
};

/** DELETE /api/v1/lookbooks/{lookbookId} */
export const deleteLookbook = async (lookbookId: number): Promise<void> => {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await api.delete(`/api/v1/lookbooks/${lookbookId}`);
};

/**
 * ==========================================
 *  룩북 피드 목록(SCR-04 홈) 관련 API 통신 정의
 * ==========================================
 */
export interface LookbookFeedItem {
  id: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  originalImageUrl: string;
  matchedImageUrl: string | null;
  matchedProductId: number | null;
  tags: string[];
  likeCount: number;
  isLiked: boolean;
}

// 서버 응답 원본 형태 (lookbookId 등 Swagger 그대로)
interface LookbookFeedApiItem {
  lookbookId: number;
  originalImageUrl: string;
  matchedImageUrl: string | null;
  matchedProductId: number | null;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  tags: string[];
  likeCount: number;
  isLiked: boolean;
}

interface LookbookFeedApiResponse {
  items: LookbookFeedApiItem[];
  nextCursor: number | null;
  hasNext: boolean;
  pageSize: number;
}

const toFeedItem = (raw: LookbookFeedApiItem): LookbookFeedItem => ({
  id: raw.lookbookId,
  authorNickname: raw.authorNickname,
  authorProfileImageUrl: raw.authorProfileImageUrl,
  originalImageUrl: raw.originalImageUrl,
  matchedImageUrl: raw.matchedImageUrl,
  matchedProductId: raw.matchedProductId,
  tags: raw.tags,
  likeCount: raw.likeCount,
  isLiked: raw.isLiked,
});

const USE_MOCK_FEED = false;

const mockFeedRaw: LookbookFeedApiItem[] = [
  {
    lookbookId: 1,
    originalImageUrl: 'https://picsum.photos/seed/feed1-original/600/600',
    matchedImageUrl: 'https://picsum.photos/seed/feed1-matched/600/600',
    matchedProductId: 1,
    authorNickname: '@minji_style',
    authorProfileImageUrl: null,
    tags: ['미니멀', '와이드핏'],
    likeCount: 128,
    isLiked: false,
  },
];

/** GET /api/v1/lookbooks - 홈 화면 가성비 룩북 피드 목록 (tag를 주면 해당 태그로 필터링) */
export const getLookbookFeed = async (
  cursor?: number,
  tag?: string,
): Promise<{
  items: LookbookFeedItem[];
  hasNext: boolean;
  nextCursor: number | null;
}> => {
  if (USE_MOCK_FEED) {
    await delay(400);
    return {
      items: mockFeedRaw.map(toFeedItem),
      hasNext: false,
      nextCursor: null,
    };
  }
  const response = await api.get<ApiEnvelope<LookbookFeedApiResponse>>(
    '/api/v1/lookbooks',
    { params: { ...(cursor ? { cursor } : {}), ...(tag ? { tag } : {}) } },
  );
  return {
    items: response.data.data.items.map(toFeedItem),
    hasNext: response.data.data.hasNext,
    nextCursor: response.data.data.nextCursor,
  };
};

/** GET /api/v1/lookbooks/mine - 마이 클로젯 "내가 올린 룩북" 목록 (로그인 필요) */
export const getMyLookbooks = async (
  cursor?: number,
): Promise<{
  items: LookbookFeedItem[];
  hasNext: boolean;
  nextCursor: number | null;
}> => {
  const response = await api.get<ApiEnvelope<LookbookFeedApiResponse>>(
    '/api/v1/lookbooks/mine',
    { params: cursor ? { cursor } : {} },
  );
  return {
    items: response.data.data.items.map(toFeedItem),
    hasNext: response.data.data.hasNext,
    nextCursor: response.data.data.nextCursor,
  };
};
