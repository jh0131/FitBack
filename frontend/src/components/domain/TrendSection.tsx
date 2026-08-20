import { Bookmark } from 'lucide-react';
import {
  TREND_ARTICLES,
  type TrendArticle,
} from '../../constants/trendArticles';
import { useMyProfile } from '../../hooks/useMyPage';

interface TrendSectionProps {
  onOpenTrendDetail?: (id: string) => void;
  onSaveTrend?: (id: string) => void;
  onSeeMoreTrends?: () => void;
}

function getTrendThumbnail(trend: TrendArticle): string | null {
  if (trend.contentType === 'photo') return trend.imageUrl;
  if (trend.contentType === 'magazine') return trend.photos[0] ?? null;
  return null;
}

export default function TrendSection({
  onOpenTrendDetail,
  onSaveTrend,
  onSeeMoreTrends,
}: TrendSectionProps) {
  const { data: profile } = useMyProfile();

  const primaryStyle = profile?.styleTags?.[0];
  const primaryTag = primaryStyle ? `#${primaryStyle}` : undefined;

  const matchedItems = primaryTag
    ? TREND_ARTICLES.filter((item) => item.relatedTags.includes(primaryTag))
    : [];

  const visibleItems = matchedItems.length > 0 ? matchedItems : TREND_ARTICLES;
  const featured = visibleItems[0];
  const thumbnail = featured ? getTrendThumbnail(featured) : null;

  if (!featured) return null;

  return (
    <section className='mt-5 px-5'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-base font-bold text-text'>나를 위한 트렌드</h2>

        <button
          type='button'
          onClick={onSeeMoreTrends}
          className='text-sm text-text-tertiary'
        >
          더보기 &gt;
        </button>
      </div>

      <button
        type='button'
        onClick={() => onOpenTrendDetail?.(String(featured.id))}
        className='block w-full text-left'
      >
        {/* 태그·제목을 전부 사진 위에 얹기 때문에, 그라디언트가 충분히 깔릴 수
            있도록 카드를 이전보다 더 길게 잡는다 */}
        <div className='relative h-[210px] w-full overflow-hidden rounded-2xl'>
          {/* 배경 */}
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={
              thumbnail
                ? { backgroundImage: `url(${thumbnail})` }
                : { background: featured.bgGradient }
            }
          />

          {/* 블랙-보라 그라디언트 — 태그·제목 가독성용, 이미지 아래쪽에 진하게
              깔리다가 위로 갈수록 사라진다 */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-primary-900/40 via-40% to-transparent' />

          {/* 저장 버튼 */}
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onSaveTrend?.(String(featured.id));
            }}
            className='absolute right-3 top-3 grid h-8 w-8 place-items-center text-white drop-shadow'
          >
            <Bookmark size={18} strokeWidth={2} />
          </button>

          {/* 태그 + 제목 — 둘 다 그라디언트 위, 글자는 화이트 */}
          <div className='absolute inset-x-0 bottom-0 p-4'>
            <span className='inline-block rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-primary-600 shadow-sm'>
              {featured.tag}
            </span>
            <p className='mt-2 text-[15px] font-bold leading-tight text-white drop-shadow'>
              {featured.title}
            </p>
          </div>
        </div>
      </button>
    </section>
  );
}
