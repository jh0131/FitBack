import { api } from './axiosInstance';

/**
 * ==========================================
 *  알림 목록(SCR-17) 관련 API 통신 정의
 * ==========================================
 * 알림 "설정"(SCR-13)은 api/notifications.ts를 따로 사용합니다.
 * 컴포넌트에서 직접 부르지 말고 src/hooks/useNotification.ts를 사용하세요.
 */

export type NotificationType =
  | 'ANALYSIS_COMPLETE'
  | 'LOOKBOOK_LIKED'
  | 'TREND_UPDATE'
  | 'MARKETING';

export type NotificationTargetType =
  | 'ANALYSIS_REPORT'
  | 'LOOKBOOK'
  | 'TREND'
  | null;

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: number | null;
  hasNext: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

interface NotificationApiItem {
  notificationId: number;
  notificationType: NotificationType;
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetId: number | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationListApiResponse {
  items: NotificationApiItem[];
  unreadCount: number;
  nextCursor: number | null;
  hasNext: boolean;
  pageSize: number;
}

// 서버 응답(readAt 등)을 프론트 내부 타입(isRead)으로 변환
const toNotificationItem = (raw: NotificationApiItem): NotificationItem => ({
  id: raw.notificationId,
  type: raw.notificationType,
  title: raw.title,
  body: raw.body,
  targetType: raw.targetType,
  targetId: raw.targetId,
  isRead: raw.readAt !== null,
  createdAt: raw.createdAt,
});

const USE_MOCK = false;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 새 스키마 기준으로 다시 작성한 mock 데이터
const baseMockNotifications: Omit<NotificationItem, 'isRead'>[] = [
  {
    id: 1,
    type: 'LOOKBOOK_LIKED',
    title: 'minji_style님이 내 룩북을 좋아해요 ❤️',
    body: '',
    targetType: 'LOOKBOOK',
    targetId: 101,
    createdAt: new Date(Date.now() - 1000 * 60).toISOString(), // 방금
  },
  {
    id: 2,
    type: 'ANALYSIS_COMPLETE',
    title: '분석이 완료됐어요! 지금 바로 확인해보세요 👗',
    body: '',
    targetType: 'ANALYSIS_REPORT',
    targetId: 202,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5분 전
  },
  {
    id: 3,
    type: 'TREND_UPDATE',
    title: '새 트렌드가 올라왔어요! #스트릿 무드 지금 확인하기 🔥',
    body: '',
    targetType: 'TREND',
    targetId: 303,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 어제
  },
];

// 세션 동안 읽음 처리를 기억하는 간단한 인메모리 저장소
// (새로고침하면 초기화됨. 실제 서버 연동 시 이 블록 삭제)
const mockReadIds = new Set<number>([3]); // id=3(트렌드)은 원래 읽은 상태로 시작
const mockDeletedIds = new Set<number>();

const buildMockList = (): NotificationItem[] =>
  baseMockNotifications
    .filter((n) => !mockDeletedIds.has(n.id))
    .map((n) => ({ ...n, isRead: mockReadIds.has(n.id) }));

/** GET /api/v1/notifications - 알림 목록 조회 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
  if (USE_MOCK) {
    await delay(400);
    return buildMockList();
  }
  const { data } = await api.get<ApiEnvelope<NotificationListApiResponse>>(
    '/api/v1/notifications',
  );
  return data.data.items.map(toNotificationItem);
};

/** PATCH /api/v1/notifications/{notificationId}/read - 개별 읽음 처리 */
export const markNotificationAsRead = async (
  notificationId: number,
): Promise<void> => {
  if (USE_MOCK) {
    await delay(200);
    mockReadIds.add(notificationId);
    return;
  }
  await api.patch(`/api/v1/notifications/${notificationId}/read`);
};

/** PATCH /api/v1/notifications/read - 전체 읽음 처리 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  if (USE_MOCK) {
    await delay(200);
    baseMockNotifications.forEach((n) => mockReadIds.add(n.id));
    return;
  }
  await api.patch('/api/v1/notifications/read');
};

/** DELETE /api/v1/notifications/{notificationId} - 개별 삭제 */
export const deleteNotification = async (
  notificationId: number,
): Promise<void> => {
  if (USE_MOCK) {
    await delay(200);
    mockDeletedIds.add(notificationId);
    return;
  }
  await api.delete(`/api/v1/notifications/${notificationId}`);
};
