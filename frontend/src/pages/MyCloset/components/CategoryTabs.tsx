export type ClosetTab = 'all' | 'trend' | 'lookbook' | 'report' | 'my-lookbook'

const TABS: { key: ClosetTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'trend', label: '저장한 트렌드' },
  { key: 'lookbook', label: '저장한 룩북' },
  { key: 'report', label: '분석 리포트' },
  { key: 'my-lookbook', label: '내가 올린 룩북' },
]

interface CategoryTabsProps {
  activeTab: ClosetTab
  onChange: (tab: ClosetTab) => void
}

export default function CategoryTabs({ activeTab, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === key
              ? 'bg-primary-600 text-white'
              : 'bg-bg-secondary text-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
