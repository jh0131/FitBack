import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/axiosInstance';
import { useMyProfile } from '../hooks/useMyPage';

// 비밀번호 숨김/표시 눈 아이콘 SVG 컴포넌트
const EyeIcon = ({ show }: { show: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
    {show ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    )}
  </svg>
);

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  // --- 소셜 로그인 유저 접근 제어 ---
  const { data: profile } = useMyProfile();

  useEffect(() => {
    if (profile?.isSocialLogin) {
      alert('소셜 로그인 계정은 비밀번호를 변경할 수 없어요.');
      navigate('/mypage', { replace: true });
    }
  }, [profile, navigate]);

  // --- 상태 관리 ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 비밀번호 숨김/표시 토글 상태
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 실시간 에러 메시지 상태
  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // --- 비밀번호 강도 계산 ---
  const passwordStrength = useMemo(() => {
    if (newPassword.length === 0) return 0;
    if (newPassword.length < 8) return 1;

    let score = 0;
    if (/[a-zA-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;

    if (score <= 1) return 1;
    if (score === 2) return 2;
    if (score >= 3) return 3;
    return 0;
  }, [newPassword]);

  const strengthText = ['', '약', '보통', '강'];
  const strengthColors = ['bg-[#E0E0E0]', 'bg-[#FF6B6B]', 'bg-[#FFB84D]', 'bg-[#2ECC71]'];

  // --- 변경하기 버튼 활성화 조건 ---
  const isFormValid = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      newPassword.length >= 8 &&
      confirmPassword.length > 0 &&
      errors.new === '' &&
      errors.confirm === ''
    );
  }, [currentPassword, newPassword, confirmPassword, errors]);


  // --- 실시간 유효성 검사 ---
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    let newError = '';
    if (value.length > 0 && value.length < 8) {
      newError = '8자 이상 입력해주세요';
    }
    
    setErrors(prev => ({ ...prev, new: newError }));

    if (confirmPassword.length > 0 && value !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm: '비밀번호가 일치하지 않습니다' }));
    } else if (value === confirmPassword) {
      setErrors(prev => ({ ...prev, confirm: '' }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    let confirmError = '';
    if (value.length > 0 && newPassword !== value) {
      confirmError = '비밀번호가 일치하지 않습니다';
    }

    setErrors(prev => ({ ...prev, confirm: confirmError }));
  };


  // --- 비밀번호 변경 제출 ---
  const handleChangePassword = async () => {
    if (!isFormValid) return;

    try {
      await api.patch('/api/v1/members/me/password', {
        currentPassword,
        newPassword,
      });
      alert('비밀번호가 변경되었습니다.'); // TODO: 토스트 UI 적용
      navigate('/mypage', { replace: true });
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      
      if (error.response?.status === 401) {
        setErrors(prev => ({ ...prev, current: '현재 비밀번호가 올바르지 않습니다' }));
        alert('현재 비밀번호가 올바르지 않습니다.');
      } else {
        alert('변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F8] flex justify-center text-[#1C1C1E]">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col font-sans shadow-lg relative overflow-y-auto px-8 py-10">
        
        {/* 헤더 - 좌측 정렬 및 간격 조정 */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 mr-3 mb-1" aria-label="뒤로가기">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-[#1C1C1E]">비밀번호 변경</h1>
        </div>

        {/* 진행 단계 바 - 헤더 아래, 둥근 모서리, 간격 추가 */}
        <div className="flex gap-2 mb-8 h-1">
          <div className="w-1/2 h-full bg-[#8B78FF] rounded-full"></div>
          <div className="w-1/2 h-full bg-[#E0E0E0] rounded-full"></div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* 안내 문구 - 좌측 정렬 */}
          <p className="text-gray-500 mb-10 text-left text-sm">보안을 위해 현재 비밀번호를 먼저 확인합니다</p>

          {/* 폼 영역 */}
          <div className="flex flex-col gap-6 mb-8">
            
            {/* 현재 비밀번호 */}
            <div>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword} 
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.current) setErrors(prev => ({...prev, current: ''}));
                  }} 
                  placeholder="현재 비밀번호 입력" 
                  className={`w-full bg-[#F4F4F8] p-4 pr-12 rounded-xl focus:outline-none focus:ring-1 ${errors.current ? 'ring-1 ring-[#FF6B6B]' : 'focus:ring-[#8B78FF]'}`}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
              {errors.current && <p className="text-[#FF6B6B] text-xs mt-1.5 ml-2">{errors.current}</p>}
            </div>

            {/* 새 비밀번호 */}
            <div>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"}
                  value={newPassword} 
                  onChange={handleNewPasswordChange}
                  placeholder="새 비밀번호 입력 (8자 이상)" 
                  className={`w-full bg-[#F4F4F8] p-4 pr-12 rounded-xl focus:outline-none focus:ring-1 ${errors.new ? 'ring-1 ring-[#FF6B6B]' : 'focus:ring-[#8B78FF]'}`}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <EyeIcon show={showNew} />
                </button>
              </div>
              {errors.new && <p className="text-[#FF6B6B] text-xs mt-1.5 ml-2">{errors.new}</p>}
              <p className="text-gray-400 text-xs mt-1.5 ml-2">영문, 숫자, 특수문자 포함 8자 이상</p>
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword} 
                  onChange={handleConfirmPasswordChange} 
                  placeholder="새 비밀번호 다시 입력" 
                  className={`w-full bg-[#F4F4F8] p-4 pr-12 rounded-xl focus:outline-none focus:ring-1 ${errors.confirm ? 'ring-1 ring-[#FF6B6B]' : 'focus:ring-[#8B78FF]'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {errors.confirm && <p className="text-[#FF6B6B] text-xs mt-1.5 ml-2">{errors.confirm}</p>}
            </div>
            
            {/* 비밀번호 강도 표시 UI */}
            {newPassword.length >= 8 && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-gray-400">비밀번호 강도</span>
                <div className="flex gap-1 h-1.5 flex-1 max-w-[150px]">
                  <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? strengthColors[1] : strengthColors[0]}`}></div>
                  <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? strengthColors[2] : strengthColors[0]}`}></div>
                  <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? strengthColors[3] : strengthColors[0]}`}></div>
                </div>
                <span className={`text-xs font-bold ${strengthColors[passwordStrength].replace('bg-', 'text-')}`}>
                  {strengthText[passwordStrength]}
                </span>
              </div>
            )}

          </div>

          {/* 변경하기 버튼 */}
          <div className="mt-auto">
            <button 
              onClick={handleChangePassword} 
              disabled={!isFormValid}
              className={`w-full py-4 rounded-xl font-bold transition-colors ${
                isFormValid 
                  ? 'bg-[#8B78FF] text-white cursor-pointer hover:bg-[#7a68e6]' 
                  : 'bg-[#E0E0E0] text-[#8E8E93] cursor-not-allowed'
              }`}
            >
              변경하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}