import { create } from 'zustand';

// 1) State 타입 -------------------------------------------------
export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationState {
  notifications: NotificationItem[];
}

// 2) Action 타입 -------------------------------------------------
interface NotificationActions {
  setNotification: (notification: NotificationItem) => void; // 알림 1개 추가
  clearNotification: (id: string) => void; // 알림 1개 제거 (닫기 버튼 등)
  clearAllNotifications: () => void; // 전체 초기화 (화면 이탈 시 등)
}

type NotificationStore = NotificationState & NotificationActions;

// 3) 초기값 -------------------------------------------------
const initialState: NotificationState = {
  notifications: [],
};

// 4) 스토어 생성 -------------------------------------------------
// persist 불필요: 알림은 새로고침 시 유지할 필요 없는 임시 데이터
export const useNotificationStore = create<NotificationStore>((set) => ({
  ...initialState,

  setNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () => set({ ...initialState }),
}));
