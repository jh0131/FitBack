import { ArrowLeft } from 'lucide-react'
import { Toggle } from '../../components/common'
import type { NotificationSettings } from '../../api/notifications'
import {
  useNotificationSettings,
  useUpdateNotificationSetting,
} from '../../hooks/useNotificationSettings'
import { navigate } from '../../utils/navigate'

const SERVICE_ITEMS: { key: keyof NotificationSettings; title: string; description: string }[] = [
  { key: 'analysisCompleteEnabled', title: 'AI 분석 완료 알림', description: '분석이 완료되면 알려드려요' },
  { key: 'lookbookLikedEnabled', title: '룩북 찜 알림', description: '내 룩북을 누군가 찜했을 때' },
  { key: 'trendUpdateEnabled', title: '트렌드 업데이트 알림', description: '새 트렌드가 등록되면 알려드려요' },
]

const MARKETING_ITEM = {
  key: 'marketingEnabled' as const,
  title: '이벤트 및 혜택 알림',
  description: '프로모션 정보를 받아볼 수 있어요',
}

export default function NotificationSettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings()
  const { mutate: updateSetting, isError } = useUpdateNotificationSetting()

  const handleToggle = (key: keyof NotificationSettings, next: boolean) => {
    updateSetting({ key, value: next })
  }

  return (
    <div className="flex flex-col p-4">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/mypage')}
          className="text-text-secondary"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold text-text">알림 설정</h1>
      </div>

      {isLoading || !settings ? (
        <p className="p-4 text-center text-sm text-text-tertiary">불러오는 중...</p>
      ) : (
        <>
          <span className="pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-text-tertiary">
            서비스 알림
          </span>
          <div className="flex flex-col">
            {SERVICE_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between border-b border-border py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">{item.description}</p>
                </div>
                <Toggle
                  aria-label={item.title}
                  checked={settings[item.key]}
                  onChange={(next) => handleToggle(item.key, next)}
                />
              </div>
            ))}
          </div>

          <span className="pb-2 pt-4 text-xs font-bold uppercase tracking-wide text-text-tertiary">
            마케팅 알림
          </span>
          <div className="flex items-center justify-between border-b border-border py-3">
            <div>
              <p className="text-sm font-semibold text-text">{MARKETING_ITEM.title}</p>
              <p className="mt-0.5 text-xs text-text-tertiary">{MARKETING_ITEM.description}</p>
            </div>
            <Toggle
              aria-label={MARKETING_ITEM.title}
              checked={settings.marketingEnabled}
              onChange={(next) => handleToggle('marketingEnabled', next)}
            />
          </div>

          {isError && (
            <p className="mt-2 text-center text-sm text-error-400">설정 변경에 실패했습니다</p>
          )}

          <p className="mt-4 text-xs text-text-tertiary">
            알림은 기기의 알림 설정에서도 관리할 수 있어요
          </p>
        </>
      )}
    </div>
  )
}
