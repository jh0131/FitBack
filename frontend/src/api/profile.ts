import { api } from './axiosInstance'
import type { StyleTag } from './tags'

/**
 * ==========================================
 *  마이페이지(SCR-11) 관련 API 통신 정의
 * ==========================================
 *
 * 현재는 USE_MOCK = true로 가짜 응답을 반환하며, 추후 백엔드 연동 시 아래 실제 API 호출 로직으로 교체할 예정이다.
 * 컴포넌트에서 직접 호출하지 말고 src/hooks/useMyPage.ts 훅을 사용할 것.
 */

export interface UserProfile {
  name: string
  email: string
  avatarUrl: string
  isSocialLogin: boolean
  styleTags: string[]
  stats: {
    saved: number
    analyzed: number
    uploaded: number
  }
}

// GET /api/v1/members/me 응답 형태 (api-spec.md 참고) — name/avatarUrl/stats.* 필드명이 화면 쪽과 다름
interface MyProfileApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    memberId: number
    email: string
    nickname: string
    profileImageUrl: string
    loginProvider: 'EMAIL' | 'KAKAO'
    savedCount: number
    analysisCount: number
    uploadCount: number
    tags: { tagId: number; tagName: string; tagType: string }[]
  }
}

// 기능별로 USE_MOCK 분리 — 확정 스펙이 다르게 진행되므로 따로 관리
const USE_MOCK_GET = false
const USE_MOCK_SAVE = false
const USE_MOCK_NICKNAME_CHECK = false
const USE_MOCK_LOGOUT = false

const USE_MOCK_CHANGE_PASSWORD = false
const USE_MOCK_WITHDRAW = false

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getMyProfile = async (): Promise<UserProfile> => {
  if (USE_MOCK_GET) {
    await delay(1500)
    return {
      name: '이지연',
      email: 'minji_style@email.com',
      avatarUrl: 'https://picsum.photos/seed/myprofile/200',
      isSocialLogin: false,
      styleTags: ['미니멀', '스트릿'],
      stats: { saved: 12, analyzed: 8, uploaded: 3 },
    }
  }

  const response = await api.get<MyProfileApiResponse>('/api/v1/members/me')
  const data = response.data.data
  return {
    name: data.nickname,
    email: data.email,
    avatarUrl: data.profileImageUrl,
    isSocialLogin: data.loginProvider !== 'EMAIL',
    styleTags: data.tags.map((tag) => tag.tagName),
    stats: {
      saved: data.savedCount,
      analyzed: data.analysisCount,
      uploaded: data.uploadCount,
    },
  }
}

export interface UpdateProfilePayload {
  name: string
  styleTags: StyleTag[]
  // useImageUpload 훅이 imageId를 string(UUID)으로 관리하므로 이에 맞춤
  avatarImageId?: string
}

interface MembersMePatchApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    memberId: number
    nickname: string
    profileImageUrl: string
  }
}

interface MembersMeTagsApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    tags: { tagId: number; tagName: string; tagType: string }[]
  }
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  if (USE_MOCK_SAVE) {
    await delay(800)
    return {
      name: payload.name,
      email: 'minji_style@email.com',
      avatarUrl: payload.avatarImageId
        ? `https://picsum.photos/seed/${payload.avatarImageId}/200`
        : 'https://picsum.photos/seed/myprofile/200',
      isSocialLogin: false,
      styleTags: payload.styleTags.map((tag) => tag.tagName),
      stats: { saved: 12, analyzed: 8, uploaded: 3 },
    }
  }

  const patchResponse = await api.patch<MembersMePatchApiResponse>('/api/v1/members/me', {
    nickname: payload.name,
    ...(payload.avatarImageId ? { profileImageId: payload.avatarImageId } : {}),
  })

  const tagsResponse = await api.put<MembersMeTagsApiResponse>('/api/v1/members/me/tags', {
    tagIds: payload.styleTags.map((tag) => tag.tagId),
  })

  const freshProfile = await getMyProfile()
  return {
    ...freshProfile,
    name: patchResponse.data.data.nickname,
    avatarUrl: patchResponse.data.data.profileImageUrl,
    styleTags: tagsResponse.data.data.tags.map((tag) => tag.tagName),
  }
}

interface NicknameAvailabilityApiResponse {
  success: boolean
  code: string
  message: string
  data: {
    nickname: string
    available: boolean
  }
}

export const checkNicknameAvailable = async (nickname: string): Promise<{ available: boolean }> => {
  if (USE_MOCK_NICKNAME_CHECK) {
    await delay(400)
    return { available: nickname !== '이미사용중' }
  }

  const response = await api.get<NicknameAvailabilityApiResponse>('/api/v1/members/me/nickname-availability', {
    params: { nickname },
  })
  return { available: response.data.data.available }
}

export const logout = async (): Promise<void> => {
  if (USE_MOCK_LOGOUT) {
    await delay(300)
    return
  }

  await api.post('/api/v1/auth/logout')
}

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  if (USE_MOCK_CHANGE_PASSWORD) {
    await delay(500)
    // 가짜 성공 응답 반환
    return { success: true, code: "COMMON200_1", message: "성공적으로 요청을 처리했습니다.", data: null }
  }

  const response = await api.patch('/api/v1/members/me/password', data) 
  return response.data
}

export const withdraw = async () => {
  if (USE_MOCK_WITHDRAW) {
    await delay(500)
    // 가짜 성공 응답 반환
    return { success: true, code: "COMMON200_1", message: "성공적으로 요청을 처리했습니다.", data: null }
  }

  const response = await api.delete('/api/v1/members/me') 
  return response.data
}