import { useQuery } from '@tanstack/react-query'
import { searchContent } from '../api/search'

export const useContentSearch = (keyword: string) =>
  useQuery({
    queryKey: ['contentSearch', keyword],
    queryFn: () => searchContent(keyword),
    enabled: keyword.trim().length > 0,
  })
