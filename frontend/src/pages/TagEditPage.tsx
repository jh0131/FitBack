import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useItemMatching } from '../hooks/useItemMatching';
import { useUploadStore } from '../store/useUploadStore';
import { TagChip } from '../components/common/TagChip';
import type { CategoryType } from '../types/tag';
import { TAG_CATEGORIES, TAG_MASTER_DB } from '../constants/tag';

export const TagEditPage: React.FC = () => {
  const navigate = useNavigate();
  const reportId = useUploadStore((state) => state.reportId);
  const imageUri = useUploadStore((state) => state.imageUri);
  const suggestedTags = useUploadStore((state) => state.suggestedTags);
  const tags = useUploadStore((state) => state.aiTags);
  const setTags = useUploadStore((state) => state.setAiTags);
  const setRecommendations = useUploadStore((state) => state.setRecommendations);

  const { mutateAsync: getRecommendations } = useItemMatching(reportId ?? 0);
  // useMutation의 isPending/isSuccess 대신 로컬 state로 직접 관리 —
  // AiWaitingPage.tsx와 같은 이유(잦은 리렌더와 맞물리면 mutation 관찰자 상태가
  // 실제 요청 완료를 못 따라가는 문제가 있었음). mutateAsync 결과를 직접 반영.
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const [tagWarning, setTagWarning] = useState(false);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  
  // Accordion State: Which categories are open
  const [openCategories, setOpenCategories] = useState<Record<CategoryType, boolean>>({
    STYLE: true,
    SILHOUETTE: false,
    MATERIAL: false,
    DETAIL: false,
    COLOR: false,
  });

  // 기본값 70은 이미지유사도×0.7+태그일치도×0.3 공식에서 tagMatch가 거의 항상 낮게 나와
  // 결과가 0개로 뜨는 문제가 있었음(백엔드 서버 기본값은 50으로 이미 조정됨, PR #317/#318).
  // 사용자가 슬라이더를 만지지 않아도 서버 기본값과 일치하도록 프론트도 50으로 맞춤.
  const [matchLevel, setMatchLevel] = useState(50);

  // Grouping tags based on CategoryType
  const groupedTags = useMemo(() => {
    const groups: Record<CategoryType, typeof TAG_MASTER_DB> = {
      STYLE: [],
      SILHOUETTE: [],
      MATERIAL: [],
      DETAIL: [],
      COLOR: [],
    };
    TAG_MASTER_DB.forEach(tag => {
      groups[tag.categoryType].push(tag);
    });
    return groups;
  }, []);

  const toggleCategory = (category: CategoryType) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    // '/analyze'는 실제로 존재하지 않는 경로였음 — 업로드 화면의 진짜 경로인
    // '/image-upload'로 보내야 리다이렉트가 실제로 동작한다.
    if (!reportId) {
      navigate('/image-upload');
    }
  }, [reportId, navigate]);

  const handleDelete = (tagToDelete: string) => {
    if (tags.length <= 1) {
      setTagWarning(true);
      setTimeout(() => setTagWarning(false), 2000);
      return;
    }
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setNewTagInput('');
      return;
    }
    if (tags.length >= 8) {
      alert('태그는 최대 8개까지만 추가할 수 있습니다.');
      return;
    }
    setTags([...tags, trimmed]);
    setNewTagInput('');
    setIsBottomSheetOpen(false);
  };

  const handleToggleTag = (tagToToggle: string) => {
    if (tags.includes(tagToToggle)) {
      handleDelete(tagToToggle);
    } else {
      handleAddTag(tagToToggle);
    }
  };

  const handleConfirm = async () => {
    if (!reportId || isMatching) return;
    // 백엔드가 "확정 태그 합계 1개 이상"을 요구하는데(RecommendationGenerateRequest
    // .hasValidCombinedTagCount), 화면에서 태그가 0개인 채로도 눌려서 400을 그대로
    // 사용자에게 보여주는 문제가 있었음 — 여기서 먼저 막는다.
    if (tags.length === 0) {
      setTagWarning(true);
      setTimeout(() => setTagWarning(false), 2000);
      return;
    }

    // 현재 화면에 남아있는 태그를 원본 추천 태그(tagId 보유)와 대조해
    // 확정된 기본 태그(confirmedTagIds)와 사용자가 직접 추가한 태그(customTagNames)로 분리한다.
    const suggestedByName = new Map(suggestedTags.map((tag) => [tag.tagName, tag.tagId]));
    const confirmedTagIds = tags
      .map((tag) => suggestedByName.get(tag))
      .filter((tagId): tagId is number => tagId !== undefined);
    const customTagNames = tags.filter((tag) => !suggestedByName.has(tag));

    setIsMatching(true);
    setMatchError(null);
    try {
      const data = await getRecommendations({ confirmedTagIds, customTagNames, matchPercentage: matchLevel });
      setRecommendations({
        recommendationGroups: data.recommendationGroups,
        partial: data.partial,
        warnings: data.warnings,
      });
      navigate('/result');
    } catch (err) {
      // axios 에러의 기본 message("Request failed with status code 400")는 사용자한테
      // 의미가 없으니, 서버가 내려준 실제 사유(ApiResponse.message)가 있으면 그걸 우선 보여준다.
      const serverMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setMatchError(serverMessage ?? '추천 결과를 생성하지 못했습니다. 다시 시도해 주세요.');
      setIsMatching(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] min-h-screen mx-auto bg-bg flex flex-col text-text relative overflow-hidden pb-5">
      <div className="flex items-center justify-between p-[20px_20px_8px] shrink-0">
        {/* 분석/태그 추출까지 끝난 뒤에도 나가는 버튼이 아예 없어서 흐름 중간에
            빠져나갈 방법이 없었음 — 홈으로 나가기 버튼 추가 */}
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="나가기"
          className="text-text-secondary cursor-pointer p-1 -ml-1"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <span className="text-[16px] font-bold text-text"></span>
        <span className="w-[30px]" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-y-auto px-[20px] flex flex-col gap-[12px]">
        <div className="pt-[4px] shrink-0">
          <div className="text-[17px] font-extrabold text-text">AI가 이렇게 분석했어요</div>
          <div className="text-[12px] text-text-secondary mt-[6px] leading-relaxed">
            맞지 않는 태그는 빼고, 원하는 매칭 강도를 조절해보세요
          </div>
        </div>

        <div
          className="h-[70px] rounded-[10px] bg-bg-secondary shrink-0 bg-cover bg-center"
          style={{ backgroundImage: imageUri ? `url('${imageUri}')` : undefined }}
        ></div>

        {/* Selected Tags */}
        <div className="mt-2 shrink-0">
          <div className="flex items-center gap-2 mb-[6px]">
            <span className="text-[10px] font-bold text-text-secondary">추출된 스타일 태그</span>
            {tagWarning && (
              <span className="text-error-400 text-[9px] font-semibold transition-opacity duration-300">
                태그를 1개 이상 남겨주세요
              </span>
            )}
          </div>
          <div className="flex gap-[5px] flex-wrap items-center">
            {tags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                variant="deletable"
                onDelete={() => handleDelete(tag)}
              />
            ))}

            {tags.length < 8 && (
              <TagChip
                label="추가"
                variant="add"
                onClick={() => setIsBottomSheetOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Accordion Categories */}
        <div className="flex flex-col gap-[12px] mt-4 mb-4">
          {TAG_CATEGORIES.map((category) => {
            const isOpen = openCategories[category.type];
            const categoryTags = groupedTags[category.type];
            return (
              <div key={category.type} className="border border-border rounded-[12px] overflow-hidden shrink-0">
                <button
                  onClick={() => toggleCategory(category.type)}
                  className="w-full flex justify-between items-center bg-bg-secondary p-[16px] focus:outline-none transition-colors"
                >
                  <span className="text-[14px] font-bold text-text">{category.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100 p-[16px]' : 'max-h-0 opacity-0 p-[0_16px]'
                  } bg-bg overflow-hidden flex flex-wrap gap-[8px]`}
                >
                  {categoryTags.map((tag) => (
                    <TagChip
                      key={tag.tagName}
                      label={tag.tagName}
                      variant="default"
                      selected={tags.includes(tag.tagName)}
                      onClick={() => handleToggleTag(tag.tagName)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {matchError && (
          <p className="text-[11px] text-error-400 text-center shrink-0">{matchError}</p>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Slider Card */}
        <div className="bg-bg-secondary p-[14px] rounded-[12px] shrink-0 border border-border">
          <div className="flex justify-between items-center mb-[12px]">
            <span className="text-[12px] font-bold text-text">매칭 정도</span>
            <span className="text-[14px] font-extrabold text-primary-400">{matchLevel}%</span>
          </div>

          <div className="relative flex items-center h-[24px]">
            <input
              type="range"
              min="0"
              max="100"
              value={matchLevel}
              onChange={(e) => setMatchLevel(Number(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10 m-0"
            />
            <div className="absolute w-full h-[6px] bg-border rounded-[10px] pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-primary-200 to-primary-400 rounded-[10px]"
                style={{ width: `${matchLevel}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-bg border-[2.5px] border-primary-400 shadow-[0_2px_5px_rgba(0,0,0,0.12)] transition-none"
                style={{ left: `${matchLevel}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-text-secondary mt-[8px]">
            <span>더 다양하게</span>
            <span>더 비슷하게</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isMatching || !reportId}
          className="w-full text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 hover:bg-primary-500 transition-colors disabled:opacity-50 shrink-0 mt-2"
        >
          {isMatching ? '매칭 중...' : '이대로 매칭하기'}
        </button>
      </div>

      {/* 태그 추가 바텀시트 */}
      {isBottomSheetOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-primary-900/40 transition-opacity"
            onClick={() => setIsBottomSheetOpen(false)}
          ></div>

          <div className="relative bg-bg w-full rounded-t-[24px] p-[12px_20px_34px] shadow-xl flex flex-col max-h-[90vh]">
            <div className="w-[40px] h-[4px] bg-border rounded-full mx-auto mb-[18px] shrink-0"></div>

            <div className="text-[15px] font-bold text-text mb-[14px] shrink-0">직접 태그 입력</div>

            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag(newTagInput);
              }}
              placeholder="직접 입력 후 엔터"
              className="w-full bg-bg text-text border border-border rounded-[12px] p-[14px_16px] text-[14px] outline-none focus:border-primary-400 focus:bg-primary-50 transition-colors shrink-0"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};
