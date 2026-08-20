import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoreVertical, Heart, Bookmark } from 'lucide-react';
import { getProductDetail } from '../../api/products';
import { TREND_ARTICLES } from '../../constants/trendArticles';
import {
  useLookbookDetail,
  useToggleLike,
  useSaveLookbook,
  useUnsaveLookbook,
  useDeleteLookbook,
} from '../../hooks/useLookbookDetail';
import ReportBottomSheet from './components/ReportBottomSheet';

export default function LookbookDetailPage() {
  const navigate = useNavigate();
  const { lookbookId } = useParams();
  const id = Number(lookbookId);

  const {
    data: lookbook,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useLookbookDetail(id);
  const toggleLike = useToggleLike(id);
  const saveLookbook = useSaveLookbook(id);
  const unsaveLookbook = useUnsaveLookbook(id);
  const deleteLookbookMutation = useDeleteLookbook(id);

  // 매칭 상품이 실제 카탈로그 상품일 때만 상세(이름/가격/판매처)를 조회한다.
  const { data: product } = useQuery({
    queryKey: ['productDetail', lookbook?.matchedProductId],
    queryFn: () => getProductDetail(lookbook!.matchedProductId!),
    enabled: !!lookbook?.matchedProductId,
  });

  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠어요?')) return;
    await deleteLookbookMutation.mutateAsync();
    navigate('/');
  };

  const isSaved = lookbook?.saveId != null;
  const handleToggleSave = () => {
    if (!lookbook) return;
    if (lookbook.saveId != null) {
      unsaveLookbook.mutate(lookbook.saveId);
    } else {
      saveLookbook.mutate();
    }
  };

  if (isLoading) return <div className='p-4 text-center'>불러오는 중...</div>;
  if (isError || !lookbook) {
    // 404(실제로 삭제·비공개 처리된 룩북)일 때만 "삭제된 콘텐츠"라고 알려준다 —
    // 그 외(네트워크 오류, 로그인 만료 등 일시적 실패)까지 전부 "삭제됨"으로
    // 보여줘서 실제로는 멀쩡한 룩북도 삭제된 것처럼 오해하게 만들던 문제 수정.
    const status = (error as { response?: { status?: number } } | null)?.response
      ?.status;
    if (status === 404) {
      return <div className='p-4 text-center'>삭제된 콘텐츠입니다</div>;
    }
    return (
      <div className='flex flex-col items-center gap-3 p-4 pt-10 text-center'>
        <p className='text-text-secondary'>
          룩북을 불러오지 못했어요. 네트워크 상태를 확인하고 다시 시도해주세요.
        </p>
        <button
          type='button'
          onClick={() => refetch()}
          disabled={isRefetching}
          className='rounded-full bg-primary-400 px-5 py-2 text-sm font-bold text-white disabled:opacity-50'
        >
          {isRefetching ? '다시 시도 중...' : '다시 시도'}
        </button>
      </div>
    );
  }

  const purchaseUrl = product
    ? (product.affiliateUrl ?? product.purchaseUrl)
    : lookbook.purchaseUrl;

  // 룩북 태그와 겹치는 트렌드가 있으면 뱃지로 연결 (화면설계서 C-04B-06)
  const lookbookTagNames = lookbook.tags.map((tag) => `#${tag.tagName}`);
  const relatedTrend = TREND_ARTICLES.find((trend) =>
    trend.relatedTags.some((relatedTag) => lookbookTagNames.includes(relatedTag)),
  );

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-4 py-2'>
        {/* 원래 있던 화면(홈/클로젯/검색 등)으로 정확히 돌아가야 하는데, '/'로
            고정해뒀더니 클로젯에서 들어왔을 때도 항상 홈으로 튕겼음 — 브라우저
            히스토리로 되돌아가도록 원복 */}
        <button onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <span className='font-bold text-sm'>룩북</span>
        <button onClick={() => setShowMoreSheet(true)} aria-label="더보기">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </div>

      <div className='flex gap-1.5 px-4'>
        {/* 폰카메라 원본처럼 큰 사진이 들어와도 화면 밖으로 안 넘치도록 정사각 비율로 잘라서 보여준다
            (flex-1 img만 있으면 이미지 원본 크기 때문에 가로 스크롤이 생겼음 — 피드 카드와 동일 패턴) */}
        <div className='flex-1 aspect-square rounded-xl bg-bg-secondary overflow-hidden'>
          <img
            src={lookbook.originalImageUrl}
            alt='원본 룩'
            className='h-full w-full object-cover'
          />
        </div>
        {lookbook.matchedImageUrl && (
          <div className='flex-1 aspect-square rounded-xl bg-bg-secondary overflow-hidden'>
            <img
              src={lookbook.matchedImageUrl}
              alt='가성비 매칭'
              className='h-full w-full object-cover'
            />
          </div>
        )}
      </div>

      <div className='px-4 pt-3 flex items-center gap-2'>
        <div className='w-7 h-7 rounded-full bg-gray-200 overflow-hidden'>
          {lookbook.authorProfileImageUrl && (
            <img
              src={lookbook.authorProfileImageUrl}
              alt=''
              className='h-full w-full object-cover'
            />
          )}
        </div>
        <div>
          <div className='text-xs font-bold'>{lookbook.authorNickname}</div>
          <div className='text-[9px] text-gray-400'>
            {new Date(lookbook.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* 디자인 시스템 Tag Chip(chip-p) 스펙과 동일하게 — 이전엔 앱 전체가 쓰는
          primary-* 토큰이 아니라 Tailwind 기본 purple-*를 써서 다른 화면의
          태그들과 미묘하게 다른 보라색으로 보였음 */}
      <div className='flex gap-1 flex-wrap px-4 pt-2'>
        {lookbook.tags.slice(0, 5).map((tag) => (
          <span
            key={tag.tagId}
            className='text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200 px-2 py-1 rounded-full'
          >
            #{tag.tagName}
          </span>
        ))}
      </div>

      {lookbook.comment && (
        <p className='px-4 pt-2 text-xs leading-relaxed'>{lookbook.comment}</p>
      )}

      {relatedTrend && (
        <div className='flex items-center gap-1.5 px-4 pt-2 text-[11px] text-text-tertiary'>
          <span>관련 트렌드</span>
          <button
            type='button'
            onClick={() => navigate(`/trend/${relatedTrend.id}`)}
            className='rounded-full bg-primary-50 text-primary-800 px-2 py-0.5 font-bold'
          >
            {relatedTrend.title} →
          </button>
        </div>
      )}

      {purchaseUrl && (
        <div className='mx-4 mt-2 bg-gray-50 rounded-xl p-3'>
          <div className='text-xs font-bold mb-2'>🛍️ 구매한 상품</div>
          {product && (
            <div className='flex items-center gap-2 mb-1'>
              <div className='flex-1'>
                <div className='text-xs font-semibold'>{product.name}</div>
                <div className='text-[9px] text-gray-400'>
                  {product.sellerName}
                </div>
              </div>
              <div className='text-sm font-bold text-primary-800'>
                {product.price.amount.toLocaleString()}
                {product.price.currency === 'KRW'
                  ? '원'
                  : ` ${product.price.currency}`}
              </div>
            </div>
          )}
          <button
            className='w-full bg-primary-400 text-white rounded-lg py-2 text-xs font-bold mt-1'
            onClick={() =>
              window.open(purchaseUrl, '_blank', 'noopener,noreferrer')
            }
          >
            구매하러 가기 →
          </button>
        </div>
      )}

      <div className='mt-auto flex items-center justify-between px-4 py-3'>
        <button
          onClick={() => toggleLike.mutate(lookbook.isLiked)}
          className='flex items-center gap-1.5'
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={lookbook.isLiked ? 'currentColor' : 'none'}
            className={lookbook.isLiked ? 'text-error-400' : 'text-text-secondary'}
          />
          <span className='text-xs font-bold'>{lookbook.likeCount}</span>
        </button>
        <button
          onClick={handleToggleSave}
          disabled={saveLookbook.isPending || unsaveLookbook.isPending}
          aria-label={isSaved ? '마이 클로젯 저장 취소' : '마이 클로젯에 저장'}
          className='disabled:opacity-40'
        >
          <Bookmark
            size={18}
            strokeWidth={2}
            fill={isSaved ? '#3c3489' : 'none'}
            className={isSaved ? 'text-primary-800' : 'text-text-secondary'}
          />
        </button>
      </div>

      {showMoreSheet && (
        <div
          // z-index가 없어서 하단 TabBar의 동동 뜬 업로드 버튼(z-40)한테 클릭이
          // 가로채였음 — TabBar보다 높은 z-index로 고정.
          className='fixed inset-0 z-50 bg-black/30 flex items-end'
          onClick={() => setShowMoreSheet(false)}
        >
          <div
            className='w-full bg-white rounded-t-2xl p-4'
            onClick={(e) => e.stopPropagation()}
          >
            {lookbook.isOwner ? (
              <>
                <button
                  className='w-full text-left py-3'
                  onClick={() => navigate(`/lookbooks/${id}/edit`)}
                >
                  수정하기
                </button>
                <button
                  className='w-full text-left py-3 text-error-400'
                  onClick={handleDelete}
                >
                  삭제하기
                </button>
              </>
            ) : (
              <button
                className='w-full text-left py-3'
                onClick={() => {
                  setShowMoreSheet(false);
                  setShowReportSheet(true);
                }}
              >
                신고하기
              </button>
            )}
          </div>
        </div>
      )}

      {showReportSheet && (
        <ReportBottomSheet
          isOpen={showReportSheet}
          lookbookId={id}
          onClose={() => setShowReportSheet(false)}
        />
      )}
    </div>
  );
}
