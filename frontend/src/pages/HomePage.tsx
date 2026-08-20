import { type UploadPurpose } from '../components/domain/UploadSelectSheet';
import SearchBar from '../components/domain/SearchBar';
import TrendSection from '../components/domain/TrendSection';
import LookbookFeedCard from '../components/domain/LookbookFeedCard';
import { useLookbookFeed } from '../hooks/useLookbookDetail';

interface HomePageProps {
  onOpenUploadSheet?: (purpose: UploadPurpose) => void;
  onOpenSearch?: () => void;
  onOpenImageSearch?: () => void;
  onOpenTrendDetail?: (id: string) => void;
  onSaveTrend?: (id: string) => void;
  onSeeMoreTrends?: () => void;
  onOpenLookbookDetail?: (id: string) => void;
}

export default function HomePage({
  onOpenSearch,
  onOpenImageSearch,
  onOpenTrendDetail,
  onSaveTrend,
  onSeeMoreTrends,
  onOpenLookbookDetail,
}: HomePageProps) {
  const { data: feed, isLoading } = useLookbookFeed();
  const items = feed?.items ?? [];

  return (
    <div className='text-text'>
      <SearchBar
        onOpenSearch={onOpenSearch}
        onOpenImageSearch={onOpenImageSearch}
      />

      <TrendSection
        onOpenTrendDetail={onOpenTrendDetail}
        onSaveTrend={onSaveTrend}
        onSeeMoreTrends={onSeeMoreTrends}
      />

      <section className='mt-8 px-5 pb-8'>
        <h2 className='text-sm font-bold text-text'>가성비 룩북 피드</h2>

        {isLoading && (
          <p className='pt-8 text-center text-xs text-text-secondary'>
            불러오는 중...
          </p>
        )}

        {!isLoading && items.length === 0 && (
          <p className='pt-8 text-center text-xs text-text-secondary'>
            아직 등록된 룩북이 없어요
          </p>
        )}

        <div className='mt-3 flex flex-col gap-3'>
          {items.map((item) => (
            <LookbookFeedCard
              key={item.id}
              item={item}
              onOpenDetail={() => onOpenLookbookDetail?.(String(item.id))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
