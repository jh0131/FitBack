import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadLookbook } from '../api/lookbook'

export const useLookbookUpload = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadLookbook,
    onSuccess: () => {
      // 업로드 직후 홈 피드가 바로 반영되도록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['lookbookFeed'] })
    },
  })
}
