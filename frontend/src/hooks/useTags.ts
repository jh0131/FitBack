import { useQuery } from '@tanstack/react-query'
import { getTags } from '../api/tags'

export const useTags = () =>
  useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  })
