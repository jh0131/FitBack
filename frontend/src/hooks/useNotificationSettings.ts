import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotificationSettings,
  updateNotificationSetting,
  type NotificationSettings,
} from '../api/notifications'

const SETTINGS_QUERY_KEY = ['notificationSettings']

export const useNotificationSettings = () =>
  useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getNotificationSettings,
  })

interface UpdateSettingVars {
  key: keyof NotificationSettings
  value: boolean
}

export const useUpdateNotificationSetting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: UpdateSettingVars) => updateNotificationSetting(key, value),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_QUERY_KEY })
      const previous = queryClient.getQueryData<NotificationSettings>(SETTINGS_QUERY_KEY)
      queryClient.setQueryData<NotificationSettings>(SETTINGS_QUERY_KEY, (old) =>
        old ? { ...old, [key]: value } : old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SETTINGS_QUERY_KEY, context.previous)
      }
    },
  })
}
