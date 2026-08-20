import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteClosetItem, getClosetItems, saveTrendToCloset } from '../api/closet'
import { deleteLookbook, getMyLookbooks } from '../api/lookbooks'

export const useClosetItems = () =>
  useQuery({
    queryKey: ['closetItems'],
    queryFn: getClosetItems,
  })

export const useDeleteClosetItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClosetItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['closetItems'] }),
  })
}

// 마이클로젯 "내가 올린 룩북" 탭 — 저장한(찜한) 룩북과는 다른 목록(직접 업로드한 것).
// "전체" 탭에서도 같이 보여줘야 해서 그 화면에서도 쓰는데, "저장한 트렌드"처럼
// 안 쓰는 탭에서까지 불필요하게 요청 나가지 않도록 enabled로 껐다 켤 수 있게 한다.
export const useMyLookbooks = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['myLookbooks'],
    queryFn: () => getMyLookbooks(),
    enabled: options?.enabled ?? true,
  })

export const useDeleteMyLookbook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lookbookId: number) => deleteLookbook(lookbookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLookbooks'] })
      // 홈/트렌드 피드에도 같은 룩북이 노출되고 있었을 수 있어 같이 무효화
      queryClient.invalidateQueries({ queryKey: ['lookbookFeed'] })
    },
  })
}

export const useSaveTrend = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveTrendToCloset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closetItems'] })
      alert('마이 클로젯에 저장했어요')
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || '저장에 실패했습니다. 다시 시도해주세요.')
    },
  })
}
