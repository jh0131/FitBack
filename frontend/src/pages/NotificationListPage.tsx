import { Heart, Info, X } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../hooks/useNotification';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { navigate } from '../utils/navigate';
import type { NotificationItem } from '../api/notificationFeed';

// C-17-03 딥링크 처리
const getDeepLink = (n: NotificationItem): string | null => {
  if (n.targetId == null) return null;
  switch (n.targetType) {
    case 'LOOKBOOK':
      return `/lookbooks/${n.targetId}`;
    case 'TREND':
      return `/trend/${n.targetId}`;
    case 'ANALYSIS_REPORT':
      // 과거 리포트를 id로 다시 보는 화면이 아직 없어 마이 클로젯으로 안내
      return '/closet';
    default:
      return null;
  }
};
const NotificationIcon = ({ type }: { type: NotificationItem['type'] }) => {
  const config = {
    LOOKBOOK_LIKED: {
      bg: 'bg-purple-400',
      icon: <Heart size={14} strokeWidth={2} fill='#fff' stroke='#fff' />,
    },
    ANALYSIS_COMPLETE: {
      bg: 'bg-[#1D9E75]',
      icon: <Info size={14} strokeWidth={2} stroke='#fff' />,
    },
    TREND_UPDATE: {
      bg: 'bg-gray-100',
      icon: (
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#9E9BB0'
          strokeWidth='2'
        >
          <polyline points='17 1 21 5 17 9' />
          <path d='M3 11V9a4 4 0 0 1 4-4h14' />
        </svg>
      ),
    },
    MARKETING: {
      bg: 'bg-gray-100',
      icon: (
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#9E9BB0'
          strokeWidth='2'
        >
          <rect x='3' y='5' width='18' height='14' rx='2' />
          <path d='M3 7l9 6 9-6' />
        </svg>
      ),
    },
  }[type];

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}
    >
      {config.icon}
    </div>
  );
};

export default function NotificationListPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const hasUnread = notifications.some((n) => !n.isRead);

  const handleClick = (n: NotificationItem) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    const link = getDeepLink(n);
    if (link) navigate(link);
    else alert('아직 준비 중인 화면이에요');
  };

  if (isLoading) return <div className='p-4 text-center'>불러오는 중...</div>;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-4 py-2.5'>
        <span className='font-bold text-sm'>알림</span>
        <button
          className='text-xs font-bold text-primary-400 disabled:text-gray-300'
          disabled={!hasUnread}
          onClick={() => markAllAsRead.mutate()}
        >
          모두 읽음
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className='flex-1 flex items-center justify-center text-gray-400 text-sm'>
          아직 알림이 없어요
        </div>
      ) : (
        // 구분선(border-b) 대신 카드 사이 여백과 안읽음 배경 대비만으로 구분한다 —
        // 항목마다 줄이 그어져 있으니 답답해 보인다는 피드백으로 제거.
        <div className='flex flex-col gap-1.5 px-3 py-1'>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`relative flex items-start gap-1 rounded-xl pl-3 pr-2 py-3 ${
                n.isRead ? 'bg-transparent' : 'bg-primary-50'
              }`}
            >
              {/* 버튼 안에 버튼이 중첩되면 안 돼서(삭제 X버튼과 별개 요소여야 함),
                  줄 전체가 아니라 내용 부분만 버튼으로 감싼다 */}
              <button
                type='button'
                onClick={() => handleClick(n)}
                className='flex flex-1 items-start gap-2.5 text-left min-w-0'
              >
                <NotificationIcon type={n.type} />
                <div className='flex-1 min-w-0'>
                  <div
                    className={`text-xs ${n.isRead ? 'text-text-secondary' : 'font-bold text-text'}`}
                  >
                    {n.title}
                  </div>
                  {n.body && (
                    <div className='text-[11px] text-text-tertiary mt-0.5'>
                      {n.body}
                    </div>
                  )}
                  <div className='text-[10px] text-text-tertiary mt-1'>
                    {formatRelativeTime(n.createdAt)}
                  </div>
                </div>
                {!n.isRead && (
                  <div className='absolute right-8 top-3 w-1.5 h-1.5 rounded-full bg-primary-400' />
                )}
              </button>

              <button
                type='button'
                onClick={() => deleteNotification.mutate(n.id)}
                aria-label='알림 삭제'
                className='shrink-0 self-start p-1.5 text-text-tertiary'
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
