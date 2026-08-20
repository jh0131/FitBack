import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useSaveReport } from '../hooks/useSaveReport';
import { useUploadStore } from '../store/useUploadStore';
import type { RecommendationItem } from '../api/analysis';
import { REASON_CODE_MAP } from '../constants/tag';
import type { LookbookUploadNavState } from './LookbookUpload/LookbookUploadPage';

const CATEGORY_LABELS: Record<string, string> = {
  OUTER: '아우터',
  TOP: '상의',
  BOTTOM: '하의',
  DRESS: '원피스',
  SHOES: '신발',
  BAG: '가방',
  ACCESSORY: '액세서리',
  OTHER: '기타',
};

export const ResultReportPage: React.FC = () => {
  const navigate = useNavigate();
  const reportId = useUploadStore((state) => state.reportId);
  const imageId = useUploadStore((state) => state.imageId);
  const imageUri = useUploadStore((state) => state.imageUri);
  const tags = useUploadStore((state) => state.aiTags);
  const suggestedTags = useUploadStore((state) => state.suggestedTags);
  const recommendationGroups = useUploadStore((state) => state.recommendationGroups);
  const partial = useUploadStore((state) => state.partial);
  const warnings = useUploadStore((state) => state.warnings);

  const { mutate: submitSaveReport, isPending, isSuccess: isSaved } = useSaveReport();

  // 카테고리별로 선택된 상품 productId
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, number>>({});

  // 백엔드 선정 자체는 태그 매칭 점수 기준(가격 미반영)이라 이미 뽑힌 대안들 중에서는
  // 여전히 매칭 순위가 진짜 순위다. 다만 "가성비" 화면인 만큼, 보여주는 순서는
  // 가격이 낮은 것부터 보이도록 정렬한다 (가격 미확정 상품은 맨 뒤로).
  const nonEmptyGroups = useMemo(
    () =>
      recommendationGroups
        .filter((group) => group.items.length > 0)
        .map((group) => ({
          ...group,
          items: [...group.items].sort((a, b) => {
            if (a.price == null && b.price == null) return 0;
            if (a.price == null) return 1;
            if (b.price == null) return -1;
            return a.price.amount - b.price.amount;
          }),
        })),
    [recommendationGroups],
  );

  // 카테고리마다 하나씩 채우도록 강제하지 않는다 — 한 개만 마음에 들어도 그것만
  // 선택해서 저장할 수 있어야 한다. 저장은 "선택한 상품이 1개 이상"이면 가능.
  const hasSelection = Object.keys(selectedByCategory).length > 0;

  const handleSave = () => {
    if (!reportId) return;
    if (!hasSelection) {
      alert('저장하려면 상품을 1개 이상 선택해주세요.');
      return;
    }
    submitSaveReport({
      reportId,
      selectedItems: Object.entries(selectedByCategory).map(([category, productId]) => ({
        category,
        productId,
      })),
    });
  };

  const handleSelect = (category: string, productId: number) => {
    setSelectedByCategory((prev) => ({ ...prev, [category]: productId }));
  };

  // 룩북은 "매칭 상품" 하나만 지원(백엔드 LookbookRequest.matchedProductId가 단일 값) —
  // 여러 카테고리를 선택했다면 첫 번째 선택을 대표 상품으로 사용한다.
  const handleUploadAsLookbook = () => {
    if (!reportId || !imageId || !hasSelection) return;
    const firstSelectedProductId = Object.values(selectedByCategory)[0];
    const matchedItem = nonEmptyGroups
      .flatMap((group) => group.items)
      .find((item) => item.productId === firstSelectedProductId);
    // TEMPORARILY_UNRESOLVED 상품은 선택 자체가 막혀있어 보통 여기 안 걸리지만,
    // 타입상 imageUrl/name/purchaseUrl이 null일 수 있으니 방어적으로 한 번 더 확인한다.
    if (!matchedItem || !matchedItem.imageUrl || !matchedItem.name || !matchedItem.purchaseUrl) return;

    const suggestedByName = new Map(suggestedTags.map((tag) => [tag.tagName, tag]));
    const confirmedTags = tags
      .map((tagName) => suggestedByName.get(tagName))
      .filter((tag): tag is (typeof suggestedTags)[number] => tag !== undefined);

    const navState: LookbookUploadNavState = {
      originalImageId: imageId,
      originalImageUrl: imageUri,
      sourceReportId: reportId,
      matchedProduct: {
        productId: matchedItem.productId,
        imageUrl: matchedItem.imageUrl,
        name: matchedItem.name,
        purchaseUrl: matchedItem.purchaseUrl,
      },
      tags: confirmedTags,
    };
    navigate('/upload', { state: navState });
  };

  const ItemCard = ({
    item,
    category,
    isSelected,
    displayRank,
  }: {
    item: RecommendationItem;
    category: string;
    isSelected: boolean;
    // item.rank는 백엔드가 매긴 "매칭 품질" 순위인데, 화면은 가성비 화면 취지에 맞게
    // 가격순으로 다시 정렬해서 보여준다 — 그 원본 rank를 그대로 배지에 쓰면 화면에
    // 보이는 순서(가격순)와 배지 숫자(매칭순)가 어긋나 1위 다음에 3위, 2위 순으로
    // 뒤죽박죽 보이는 문제가 있었음. 배지는 항상 "지금 보이는 순서" 기준으로 표시.
    displayRank: number;
  }) => (
    <div
      className={`flex gap-[10px] rounded-[11px] p-[10px] items-center transition-colors border-[1px] ${
        isSelected ? 'border-primary-400 bg-primary-50' : 'border-border bg-white'
      }`}
    >
      {/* Radio Button — 룩북 조합용 선택. 상세 정보를 아직 못 가져온 상품(TEMPORARILY_UNRESOLVED)은
          선택할 수 없게 막는다 — 선택해봐야 저장/룩북 연동에 쓸 데이터가 없다. */}
      <button
        type="button"
        onClick={() => handleSelect(category, item.productId)}
        disabled={item.availability === 'TEMPORARILY_UNRESOLVED'}
        aria-label="이 상품 선택"
        className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
          isSelected ? 'border-primary-400 bg-primary-400' : 'border-border bg-bg-secondary'
        }`}
      >
        {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
      </button>

      {/* 이미지/이름 — 상품 상세로 이동. availability가 TEMPORARILY_UNRESOLVED면 상세 정보가
          아직 없는 상태라(imageUrl/name/price 등이 null) 안내 문구만 보여준다. */}
      <button
        type="button"
        onClick={() => navigate(`/product/${item.productId}`)}
        disabled={item.availability === 'TEMPORARILY_UNRESOLVED'}
        className="flex flex-1 min-w-0 gap-[10px] items-center text-left disabled:cursor-not-allowed"
      >
        <div
          className="w-[44px] h-[44px] rounded-[8px] bg-bg-secondary shrink-0 bg-cover bg-center"
          style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}
        ></div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-[12px] text-text font-bold truncate">
            {item.name ?? '상품 정보를 불러오는 중이에요'}
          </div>
          {item.sellerName && (
            <div className="text-[10px] text-text-secondary mt-[2px]">{item.sellerName}</div>
          )}
          {item.reasonCode && REASON_CODE_MAP[item.reasonCode] && (
            <div className="mt-[6px]">
              <span className={`px-[6px] py-[3px] text-[10px] leading-none rounded-full ${REASON_CODE_MAP[item.reasonCode].color}`}>
                {REASON_CODE_MAP[item.reasonCode].label}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <div className="text-[10px] px-[6px] py-[2px] rounded-[6px] font-extrabold bg-[#FAEEDA] text-[#633806] mb-[4px]">
            {displayRank}위 매칭
          </div>
          <div className="text-[14px] font-extrabold text-primary-800">
            {item.price
              ? `${item.price.amount.toLocaleString()}${item.price.currency === 'KRW' ? '원' : ` ${item.price.currency}`}`
              : '가격 확인 중'}
          </div>
        </div>
      </button>
    </div>
  );

  // min-h-screen(100vh)만 쓰면 모바일 브라우저의 주소창/툴바 높이가 빠진 채로 계산돼서
  // 하단 고정 버튼이 실제 보이는 화면 아래로 밀려날 수 있음 — dvh(동적 뷰포트 높이)로 보정
  return (
    <div className="w-full max-w-[480px] min-h-screen min-h-[100dvh] mx-auto bg-bg flex flex-col text-text relative">
      {/* Header */}
      <div className="flex items-center justify-between p-[12px_20px_8px] shrink-0 bg-bg z-10 sticky top-0">
        <span onClick={() => navigate(-1)} className="text-text-secondary cursor-pointer p-1" role="button" aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </span>
        <div className="flex flex-col items-center">
          <span className="text-[16px] font-bold text-text">분석 결과</span>
        </div>
        {/* 저장은 하단 버튼으로 옮겨서(룩북 올리기와 나란히) 둘 다 눈에 잘 띄게 함 — 자리 균형용 spacer */}
        <span className="w-[30px]" aria-hidden="true" />
      </div>

      {/* Tags */}
      <div className="flex gap-[6px] px-[20px] pt-[4px] pb-[12px] flex-wrap shrink-0 border-b border-border bg-bg">
        {tags.map((tag) => (
          <div key={tag} className="inline-flex items-center gap-[5px] text-[11px] bg-primary-50 text-primary-800 px-[10px] py-[4px] rounded-full font-semibold">
            #{tag}
          </div>
        ))}
      </div>

      {partial && warnings.length > 0 && (
        <div className="mx-[20px] mt-[10px] rounded-[10px] bg-[#FFF6E5] border border-[#F3D9A0] px-[12px] py-[8px] text-[11px] text-[#7A5B00]">
          {warnings.join(' ')}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[20px] flex flex-col gap-[12px] pb-[190px] pt-[14px]">
        {nonEmptyGroups.length === 0 && (
          <p className="py-10 text-center text-xs text-text-secondary">추천 결과가 없습니다</p>
        )}

        {nonEmptyGroups.map((group) => (
          <div key={group.category}>
            <div className="text-[12px] font-bold text-text pb-[4px] flex items-center gap-[6px]">
              {CATEGORY_LABELS[group.category] ?? group.category}{' '}
              <span className="text-[10px] bg-bg-secondary text-text-secondary px-[6px] py-[2px] rounded-[6px] font-semibold">
                {group.items.length}개 대안
              </span>
            </div>
            <div className="flex flex-col gap-[8px] mb-[10px]">
              {group.items.map((item, index) => (
                <ItemCard
                  key={item.productId}
                  item={item}
                  category={group.category}
                  isSelected={selectedByCategory[group.category] === item.productId}
                  displayRank={index + 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Buttons — 저장하기가 주 행동, 룩북 올리기는 "저장했다면 이어서
          올려보자"는 제안 톤의 보조 버튼으로 분리 (기존엔 룩북 올리기만 있었고 저장은
          헤더의 작은 텍스트 링크라 눈에 잘 안 띄었음) */}
      <div className="absolute bottom-[20px] left-[20px] right-[20px] z-20 flex flex-col items-center gap-[8px]">
        {!hasSelection && nonEmptyGroups.length > 0 && (
          <p className="text-[11px] text-text-secondary bg-bg/90 px-[10px] py-[4px] rounded-full">
            상품을 1개 이상 선택해주세요
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={!hasSelection || isPending}
          className="w-full text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 hover:bg-primary-500 transition-colors shadow-[0_5px_12px_rgba(127,119,221,0.3)] disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
        >
          {isPending ? '저장 중...' : isSaved ? '저장 완료 ✓' : '저장하기'}
        </button>
        <button
          onClick={handleUploadAsLookbook}
          disabled={!hasSelection}
          className="w-full text-primary-600 text-[13px] font-semibold rounded-[14px] p-[12px] bg-white border border-primary-200 hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          룩북으로 올리기
        </button>
      </div>
    </div>
  );
};
