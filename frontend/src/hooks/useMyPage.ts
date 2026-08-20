import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyProfile,
  logout,
  updateProfile,
  type UpdateProfilePayload,
  type UserProfile,
} from '../api/profile'

const PROFILE_QUERY_KEY = ['myProfile']

export const useMyProfile = () =>
  useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, profile)
    },
  })
}

export const useLogout = () =>
  useMutation({
    mutationFn: logout,
  })
