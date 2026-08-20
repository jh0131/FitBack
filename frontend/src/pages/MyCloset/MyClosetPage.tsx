import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ClosetItem } from '../../api/closet'
import {
  useClosetItems,
  useDeleteClosetItem,
  useMyLookbooks,
  useDeleteMyLookbook,
} from '../../hooks/useMyCloset'
import LookbookFeedCard from '../../components/domain/LookbookFeedCard'
import CategoryTabs, { type ClosetTab } from './components/CategoryTabs'
import ClosetGrid from './components/ClosetGrid'

const VALID_TABS: ClosetTab[] = ['all', 'trend', 'lookbook', 'report', 'my-lookbook']

export default function MyClosetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<ClosetTab>(
    VALID_TABS.includes(initialTab as ClosetTab) ? (initialTab as ClosetTab) : 'all',
  )
  const { data: items = [], isLoading, isError } = useClosetItems()
  const { mutate: deleteItem } = useDeleteClosetItem()

  // "내가 올린 룩북"은 저장(찜)한 항목이 아니라 직접 업로드한 룩북이라 별도 API/탭으로
  // 분리돼 있음. 다만 "전체" 탭은 말 그대로 전부 다 보여줘야 하므로, "전체"·"내가
  // 올린 룩북" 두 탭에서는 같이 불러온다(그 외 탭에서는 안 씀 — 불필요한 요청 방지).
  const showMyLookbooks = activeTab === 'all' || activeTab === 'my-lookbook'
  const {
    data: myLookbooksData,
    isLoading: isMyLookbooksLoading,
    isError: isMyLookbooksError,
    refetch: refetchMyLookbooks,
    isRefetching: isMyLookbooksRefetching,
  } = useMyLookbooks({ enabled: showMyLookbooks })
  const { mutate: deleteMyLookbook } = useDeleteMyLookbook()
  const myLookbooks = myLookbooksData?.items ?? []

  const filteredItems = useMemo(
    () => (activeTab === 'all' ? items : items.filter((item) => item.category === activeTab)),
    [items, activeTab],
  )

  const handleSelect = (item: ClosetItem) => {
    if (item.category === 'trend') {
      navigate(`/trend/${item.targetId}`)
      return
    }
    if (item.category === 'lookbook') {
      navigate(`/lookbooks/${item.targetId}`)
      return
    }
    if (item.category === 'report') {
      navigate(`/reports/${item.targetId}`)
    }
  }

  const handleDelete = (item: ClosetItem) => {
    // 여기 있는 항목은 전부 이미 저장된 것들이라, "삭제"보다는 "저장 취소"가
    // 실제로 하는 일에 더 가까운 표현이라 문구를 그렇게 바꿈
    if (window.confirm('저장을 취소할까요?')) {
      deleteItem(item.id)
    }
  }

  const handleDeleteMyLookbook = (lookbookId: number) => {
    if (window.confirm('이 룩북을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) {
      deleteMyLookbook(lookbookId)
    }
  }

  const showClosetGrid = activeTab !== 'my-lookbook'

  const myLookbookSection = (
    <>
      {activeTab === 'all' && (
        <h2 className="text-sm font-semibold text-text-secondary">내가 올린 룩북</h2>
      )}
      {isMyLookbooksLoading && (
        <p className="py-8 text-center text-sm text-text-tertiary">불러오는 중...</p>
      )}
      {isMyLookbooksError && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-center text-sm text-error-400">데이터를 불러오지 못했습니다</p>
          <button
            type="button"
            onClick={() => refetchMyLookbooks()}
            disabled={isMyLookbooksRefetching}
            className="rounded-full bg-primary-400 px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {isMyLookbooksRefetching ? '다시 시도 중...' : '다시 시도'}
          </button>
        </div>
      )}
      {!isMyLookbooksLoading && !isMyLookbooksError && myLookbooks.length === 0 && (
        <p className="py-8 text-center text-sm text-text-tertiary">아직 올린 룩북이 없어요</p>
      )}
      {!isMyLookbooksLoading && !isMyLookbooksError && myLookbooks.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* 길게 누르면 삭제 — 마이클로젯 다른 탭(ClosetGrid)과 동일한 조작 방식 */}
          {myLookbooks.map((item) => (
            <LookbookFeedCard
              key={item.id}
              item={item}
              onOpenDetail={() => navigate(`/lookbooks/${item.id}`)}
              onDelete={() => handleDeleteMyLookbook(item.id)}
            />
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold text-text">마이 클로젯</h1>

      <CategoryTabs activeTab={activeTab} onChange={setActiveTab} />

      {showClosetGrid && (
        <>
          {activeTab === 'all' && items.length > 0 && (
            <h2 className="text-sm font-semibold text-text-secondary">저장한 항목</h2>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-text-tertiary">불러오는 중...</p>
          )}
          {isError && (
            <p className="py-8 text-center text-sm text-error-400">
              데이터를 불러오지 못했습니다
            </p>
          )}
          {!isLoading && !isError && (
            <ClosetGrid items={filteredItems} onSelect={handleSelect} onDelete={handleDelete} />
          )}
        </>
      )}

      {showMyLookbooks && myLookbookSection}
    </div>
  )
}
