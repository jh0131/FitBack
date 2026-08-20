import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('resetToken');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!resetToken) return;

    if (newPassword.length < 8 || newPassword.length > 64) {
      setErrorMessage('새 비밀번호는 8~64자여야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    try {
      await resetPassword({ resetToken, newPassword });
      alert('비밀번호가 재설정되었어요. 새 비밀번호로 로그인해주세요.');
      navigate('/login');
    } catch (error: any) {
      // 토큰은 5분간 유효하고 1회용 — 만료/재사용 시 여기로 떨어진다.
      setErrorMessage(
        error?.response?.data?.message || '링크가 만료되었거나 이미 사용됐어요. 다시 요청해주세요.',
      );
      setStatus('idle');
    }
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-bg flex justify-center">
        <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col items-center justify-center p-8 text-center font-sans shadow-lg">
          <p className="text-[14px] text-text-secondary mb-6">
            유효하지 않은 링크예요. 비밀번호 찾기를 다시 시도해주세요.
          </p>
          <button
            onClick={() => navigate('/find-password')}
            className="text-[14px] font-bold text-primary-600 underline"
          >
            비밀번호 찾기로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col p-8 font-sans shadow-lg relative">
        <div className="flex items-center gap-2 h-[48px] mb-6">
          <h1 className="text-[18px] font-bold text-primary-900">
            새 비밀번호 설정
          </h1>
        </div>

        <p className="text-[14px] text-text-secondary mb-10 leading-relaxed">
          새로 사용할 비밀번호를 입력해주세요
        </p>

        <div className="flex flex-col flex-1">
          <label className="text-[14px] font-medium text-text-secondary mb-2 block">
            새 비밀번호
          </label>
          <input
            type="password"
            placeholder="8~64자"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrorMessage('');
            }}
            className="w-full p-4 border rounded-[14px] outline-none text-[15px] transition bg-white border-border focus:border-primary-400 mb-4"
            disabled={status === 'loading'}
          />

          <label className="text-[14px] font-medium text-text-secondary mb-2 block">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            placeholder="다시 한 번 입력해주세요"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage('');
            }}
            className="w-full p-4 border rounded-[14px] outline-none text-[15px] transition bg-white border-border focus:border-primary-400"
            disabled={status === 'loading'}
          />

          {errorMessage && (
            <p className="mt-2 text-[13px] text-red-500 font-medium">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!newPassword || !confirmPassword || status === 'loading'}
            className="w-full mt-6 bg-[#7E69E8] text-white py-[16px] rounded-[14px] text-[16px] font-bold transition active:scale-95 disabled:bg-border disabled:text-text-tertiary flex justify-center items-center"
          >
            {status === 'loading' ? '변경 중...' : '비밀번호 변경하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
