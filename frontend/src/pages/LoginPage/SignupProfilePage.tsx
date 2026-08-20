import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/axiosInstance';
import { useTags } from '../../hooks/useTags';
import { useImageUpload } from '../../hooks/useImageUpload';

export default function SignupProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kakaoNickname, kakaoProfileImage } = location.state || {};

  const { data: tags = [] } = useTags();
  const { uploadImage, isUploading, error: uploadError } = useImageUpload('PROFILE');

  const [nickname, setNickname] = useState(kakaoNickname || '');
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(kakaoProfileImage || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // uploadImage()의 error는 실제 제출(가입 완료) 시점에만 채워져서, 사진을 고르자마자
  // 형식/용량이 안 맞는 걸 알려줄 방법이 없었음 — 미리보기가 정상으로 뜨고 나중에야
  // "업로드에 실패했습니다"만 뜨는 게 원인 파악이 안 되는 문제였을 가능성이 높음(특히
  // 아이폰 기본 사진 형식인 HEIC는 여기서 허용하는 JPEG/PNG/WEBP가 아님). 선택 즉시 검증.
  const [selectError, setSelectError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStyle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      if (selectedTagIds.length >= 5) {
        alert('스타일은 최대 5개까지 선택할 수 있습니다.');
        return;
      }
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // 프로필 동그라미를 클릭하면 숨겨진 파일 선택 창을 대신 클릭
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 유저가 이미지를 선택하면 화면에 미리보기를 띄워주고, 실제 파일은 제출 시 업로드.
  // uploadImage()와 동일한 규칙(JPEG/PNG/WEBP, 5MB 이하)을 선택 시점에도 먼저 검사해서,
  // 안 맞는 파일을 골랐을 때 미리보기가 뜬 채로 방치되지 않고 바로 이유를 보여준다.
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectError(
        file.type === 'image/heic' || file.type === 'image/heif' || file.type === ''
          ? 'HEIC 등 아이폰 기본 사진 형식은 지원하지 않아요. JPG/PNG/WEBP로 변환하거나 다른 사진을 선택해주세요.'
          : 'JPG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.',
      );
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setSelectError('파일 용량은 최대 5MB를 초과할 수 없습니다.');
      e.target.value = '';
      return;
    }

    setSelectError(null);
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleComplete = async () => {
    if (nickname.trim().length < 2) {
      alert('닉네임은 2자 이상 입력해주세요.');
      return;
    }
    if (selectedTagIds.length === 0) {
      alert('관심 스타일을 1개 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 직접 고른 사진이 있을 때만 실제로 업로드해서 이미지 ID를 받는다.
      // (카카오 프로필 사진 같은 외부 URL은 그대로 두고 profileImageId는 생략 — 서버에서도 선택 필드)
      let profileImageId: string | undefined;
      if (profileImageFile) {
        const imageId = await uploadImage(profileImageFile);
        if (!imageId) {
          alert('프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.');
          setIsSubmitting(false);
          return;
        }
        profileImageId = imageId;
      }

      const response = await api.put('/api/v1/members/me/onboarding', {
        nickname,
        profileImageId,
        tagIds: selectedTagIds,
      });

      console.log('2단계(온보딩) 가입 성공:', response.data);

      const selectedStyleNames = tags
        .filter((tag) => selectedTagIds.includes(tag.tagId))
        .map((tag) => tag.tagName);

      navigate('/signup/complete', {
        state: { nickname, selectedStyles: selectedStyleNames },
        replace: true,
      });
    } catch (error) {
      console.error('온보딩 실패:', error);
      alert('프로필 설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = nickname.trim() && selectedTagIds.length > 0 && !isUploading && !isSubmitting;

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col px-8 py-10 font-sans shadow-lg relative overflow-y-auto">

        <div className="flex items-center mb-8 relative">
          <button onClick={() => navigate(-1)} className="text-text-tertiary" aria-label="뒤로가기">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-primary-900">프로필 설정</h1>
        </div>

        <div className="flex gap-2 mb-10">
          <div className="h-1.5 flex-1 bg-primary-400 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-primary-400 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-border rounded-full"></div>
        </div>

        {/* 프로필 이미지 영역 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative w-[100px] h-[100px] cursor-pointer group"
            onClick={handleImageClick}
            title=""
          >
            {/* 실제 이미지가 들어가는 곳 (동그랗게 자르기) */}
            <div className="w-full h-full rounded-full bg-bg border-2 border-border flex items-center justify-center overflow-hidden">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>

            {/* + 버튼 */}
            <div className="absolute bottom-0 right-0 z-10 w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm transition group-hover:scale-110">
              +
            </div>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">프로필 사진을 등록해주세요</p>
          {(selectError || uploadError) && (
            <p className="mt-2 text-xs text-error-400 text-center max-w-[260px]">
              {selectError || uploadError}
            </p>
          )}

          {/* 실제 사진 업로드 인풋 (화면에서는 숨김) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* 닉네임 및 관심 스타일 영역 */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary-900">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="다른 유저에게 보일 이름"
              className="w-full bg-bg p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary-400"
              maxLength={16}
            />
            <p className="text-xs text-text-tertiary">2~16자, 영문·한글·숫자 사용 가능</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-primary-900">관심 스타일 (최대 5개)</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.tagId}
                  onClick={() => toggleStyle(tag.tagId)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTagIds.includes(tag.tagId)
                      ? 'bg-primary-400 text-white border border-primary-400'
                      : 'bg-white text-text-secondary border border-border hover:bg-bg-secondary'
                  }`}
                >
                  {tag.tagName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button
            onClick={handleComplete}
            className={`w-full py-4 rounded-xl text-base font-bold transition shadow-md ${
              canSubmit
                ? 'bg-primary-400 text-white active:scale-95'
                : 'bg-border text-text-tertiary cursor-not-allowed'
            }`}
            disabled={!canSubmit}
          >
            {isUploading ? '사진 업로드 중...' : isSubmitting ? '가입 처리 중...' : '가입 완료'}
          </button>
        </div>

      </div>
    </div>
  );
}
