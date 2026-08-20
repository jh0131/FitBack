import { useQuery } from '@tanstack/react-query'
import { getTrends } from '../api/trends'

export const useTrendsQuery = () =>
  useQuery({
    queryKey: ['trends'],
    queryFn: getTrends,
  })
