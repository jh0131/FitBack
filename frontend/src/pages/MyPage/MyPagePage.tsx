import { useState } from 'react'
import { Bell, Lock, LogOut, User, UserX } from 'lucide-react'
import { navigate } from '../../utils/navigate'
import { useMyProfile, useLogout } from '../../hooks/useMyPage'
import ProfileHeader from './components/ProfileHeader'
import SettingsListItem from './components/SettingsListItem'
import StatSummary from './components/StatSummary'
import LogoutModal from '../../components/common/LogoutModal'

export default function MyPagePage() {
  const { data: profile, isLoading, isError } = useMyProfile()
  const { mutate: logout } = useLogout()
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const executeLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        localStorage.removeItem('accessToken')
        setIsLogoutModalOpen(false) 
        window.location.href = '/login'
      },
    })
  }

  if (isLoading) {
    return <p className="p-4 text-center text-sm text-text-tertiary">불러오는 중...</p>
  }

  if (isError || !profile) {
    return <p className="p-4 text-center text-sm text-error-400">데이터를 불러오지 못했습니다</p>
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <ProfileHeader
        name={profile.name}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        onAvatarClick={() => navigate('/profile-edit')}
      />

      <StatSummary
        {...profile.stats}
        onSavedClick={() => navigate('/closet?tab=all')}
        onAnalyzedClick={() => navigate('/closet?tab=report')}
        // "업로드" 수는 내가 만든 룩북 개수인데 클로젯엔 아직 "내가 만든 룩북" 전용 화면이
        // 없어서(저장한 룩북 탭만 있음) 가장 가까운 화면으로 임시 연결 — 전용 화면 생기면 교체
        onUploadedClick={() => navigate('/closet?tab=lookbook')}
      />

      <span className="pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-text-tertiary">
        계정
      </span>
      <div className="flex flex-col">
        <SettingsListItem
          label="회원정보 수정"
          icon={<User size={16} />}
          onClick={() => navigate('/profile-edit')}
        />
        <SettingsListItem
          label="알림 설정"
          icon={<Bell size={16} />}
          onClick={() => navigate('/notifications')}
        />
        <SettingsListItem
          label="비밀번호 변경"
          icon={<Lock size={16} />}
          onClick={() => navigate('/change-password')}
          disabled={profile.isSocialLogin}
        />
        <SettingsListItem
          label="로그아웃"
          icon={<LogOut size={16} />}
          onClick={() => setIsLogoutModalOpen(true)}
        />
        <SettingsListItem
          label="회원 탈퇴"
          icon={<UserX size={16} />}
          onClick={() => navigate('/withdraw')}
        />
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={executeLogout}
      />
    </div>
  )
}