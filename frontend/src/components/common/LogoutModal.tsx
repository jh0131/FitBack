interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutModal({ isOpen, onClose, onLogout }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]"
      onClick={onClose}
    >
      <div
        className="w-[300px] rounded-[20px] bg-white p-6 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-bold text-gray-900">로그아웃</h2>
        <p className="mb-6 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {`정말 로그아웃 하시겠어요?\n다시 로그인하려면 이메일과\n비밀번호가 필요해요`}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700"
          >
            취소
          </button>
          <button
            onClick={onLogout}
            className="flex-1 rounded-xl bg-[#D64568] py-3 text-sm font-medium text-white"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}