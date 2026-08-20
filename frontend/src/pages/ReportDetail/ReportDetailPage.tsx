import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAnalysis, type SavedAnalysisItem } from '../../api/analysis';
import { getAllTags } from '../../api/tags';
import type { LookbookUploadNavState } from '../LookbookUpload/LookbookUploadPage';

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

// 마이 클로젯에서 저장된 분석 리포트를 다시 볼 때 쓰는 읽기 전용 상세 화면.
// 새로 매칭을 돌리는 화면(ResultReportPage)과 달리, 이미 저장을 마친 selectedItems를
// 그대로 보여주기만 한다 — 재선택/재저장 UI는 없음.
export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const id = Number(reportId);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['analysisReportDetail', id],
    queryFn: () => getAnalysis(id),
    enabled: Number.isFinite(id),
  });

  // 룩북으로 올릴 때 확정 태그(이름만 있고 tagId가 없음)를 tagId 있는 형태로 되찾기 위해
  // 전체 태그 카탈로그를 이름으로 대조한다.
  const { data: allTags = [] } = useQuery({ queryKey: ['allTags'], queryFn: getAllTags });

  if (isLoading) return <div className="p-4 text-center text-sm text-text-secondary">불러오는 중...</div>;
  if (isError || !report) {
    return <div className="p-4 text-center text-sm text-text-secondary">삭제되었거나 볼 수 없는 리포트입니다</div>;
  }

  // 룩북 조합용 대표 상품 — 매칭 이미지/상품 중 하나만 요구하는 백엔드 계약상 표시 정보가
  // 전부 갖춰진(구매 링크까지 있는) 첫 저장 상품을 대표로 쓴다.
  const matchableItem = report.selectedItems.find(
    (item): item is SavedAnalysisItem & { imageUrl: string; name: string; purchaseUrl: string } =>
      !!item.imageUrl && !!item.name && !!item.purchaseUrl,
  );

  const handleUploadAsLookbook = () => {
    if (!matchableItem) return;
    const tagByName = new Map(allTags.map((tag) => [tag.tagName, tag]));
    const matchedTags = report.tags
      .map((tagName) => tagByName.get(tagName))
      .filter((tag): tag is (typeof allTags)[number] => tag !== undefined);

    const navState: LookbookUploadNavState = {
      originalImageId: report.originalImageId,
      originalImageUrl: report.imageUrl,
      sourceReportId: report.reportId,
      matchedProduct: {
        productId: matchableItem.productId,
        imageUrl: matchableItem.imageUrl,
        name: matchableItem.name,
        purchaseUrl: matchableItem.purchaseUrl,
      },
      tags: matchedTags,
    };
    navigate('/upload', { state: navState });
  };

  const itemsByCategory = report.selectedItems.reduce<Record<string, typeof report.selectedItems>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col text-text">
      <div className="flex items-center justify-between px-[20px] py-[12px] sticky top-0 bg-bg z-10 border-b border-border">
        <button type="button" onClick={() => navigate(-1)} className="text-text-secondary p-1" aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <span className="text-[16px] font-bold text-text">분석 리포트</span>
        <span className="w-[30px]" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[16px]">
        <div className="aspect-square rounded-xl bg-bg-secondary overflow-hidden">
          <img src={report.imageUrl} alt="분석한 사진" className="h-full w-full object-cover" />
        </div>

        <div className="flex gap-[6px] flex-wrap">
          {report.tags.map((tag) => (
            <span key={tag} className="text-[11px] bg-primary-50 text-primary-800 px-[10px] py-[4px] rounded-full font-semibold">
              #{tag}
            </span>
          ))}
        </div>

        {report.selectedItems.length === 0 ? (
          <p className="py-10 text-center text-xs text-text-secondary">저장된 상품이 없습니다</p>
        ) : (
          Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <div className="text-[12px] font-bold text-text pb-[6px]">
                {CATEGORY_LABELS[category] ?? category}
              </div>
              <div className="flex flex-col gap-[8px]">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-[10px] rounded-[11px] p-[10px] items-center border border-border bg-white"
                  >
                    <div
                      className="w-[52px] h-[52px] rounded-[8px] bg-bg-secondary shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-text font-bold truncate">{item.name ?? '상품 정보 없음'}</div>
                      {item.sellerName && (
                        <div className="text-[10px] text-text-secondary mt-[2px]">{item.sellerName}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-[6px] shrink-0">
                      {item.price && (
                        <div className="text-[13px] font-extrabold text-primary-800">
                          {item.price.amount.toLocaleString()}
                          {item.price.currency === 'KRW' ? '원' : ` ${item.price.currency}`}
                        </div>
                      )}
                      {item.purchaseUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(item.purchaseUrl!, '_blank', 'noopener,noreferrer')}
                          className="text-[10px] font-bold text-primary-600 underline"
                        >
                          구매하러 가기 →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {report.selectedItems.length > 0 && (
        <div className="sticky bottom-0 bg-bg border-t border-border px-[20px] py-[14px]">
          <button
            type="button"
            onClick={handleUploadAsLookbook}
            disabled={!matchableItem}
            className="w-full text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이 조합으로 룩북 올리기
          </button>
          {!matchableItem && (
            <p className="mt-[6px] text-center text-[11px] text-text-secondary">
              저장된 상품의 정보를 아직 불러오지 못해 지금은 올릴 수 없어요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
