import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { TREND_ARTICLES } from '../constants/trendArticles';
import { useLookbooksByTag } from '../hooks/useLookbookDetail';
import { useClosetItems, useDeleteClosetItem, useSaveTrend } from '../hooks/useMyCloset';

const TrendDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const trend = TREND_ARTICLES.find((t) => t.id === Number(id)) ?? TREND_ARTICLES[0];
  const { data: relatedLookbooks, isLoading: isRelatedLoading } = useLookbooksByTag(
    trend.tag.replace('#', ''),
  );

  // 저장 여부를 로컬 상태로만 흉내내던 것 — 실제로는 마이 클로젯에 전혀 반영이
  // 안 됐음(새로고침하면 사라짐). 진짜 저장/삭제 API로 교체.
  const { data: closetItems = [] } = useClosetItems();
  const savedItem = closetItems.find(
    (item) => item.category === 'trend' && item.targetId === trend.id,
  );
  const isSaved = !!savedItem;
  const saveTrend = useSaveTrend();
  const deleteClosetItem = useDeleteClosetItem();

  const toggleSave = () => {
    if (savedItem) {
      deleteClosetItem.mutate(savedItem.id);
    } else {
      saveTrend.mutate(trend.id);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag.replace('#', ''))}`);
  };

  const handleLookbookClick = (lookbookId: number) => {
    navigate(`/lookbooks/${lookbookId}`);
  };

  const handleMatchStartClick = () => {
    navigate('/image-upload');
  };

  return (
    <div className="h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-bg h-screen flex flex-col shadow-lg relative">
        {/* Header */}
      <header className="flex items-center justify-between p-5 shrink-0 bg-bg">
        <button onClick={() => navigate(-1)} className="cursor-pointer" aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-text">트렌드</h1>
        <button onClick={toggleSave} className="cursor-pointer" aria-label="저장">
          <Bookmark
            size={20}
            strokeWidth={2}
            fill={isSaved ? '#3c3489' : 'none'}
            stroke={isSaved ? '#3c3489' : 'var(--color-text-secondary)'}
          />
        </button>
      </header>

      {/* Scrollable Body — 히어로 이미지도 본문과 함께 스크롤되도록 같은 컨테이너에 둔다.
          (예전엔 이미지가 shrink-0로 헤더 아래 고정돼 있어서 화면이 작을 때 본문을 볼 공간이 부족했음) */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Main Visual — 콘텐츠 타입별로 다르게 렌더링 */}
        {trend.contentType === 'youtube' ? (
          <div className="relative bg-black">
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${trend.youtubeVideoId}`}
              title={trend.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute top-3 left-3 text-[11px] bg-primary-400 text-white px-2.5 py-1 rounded-full font-bold">
              {trend.tag}
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center relative bg-cover bg-center ${
              trend.contentType === 'magazine' ? 'h-[320px]' : 'h-[150px]'
            }`}
            style={
              trend.contentType === 'photo'
                ? { backgroundImage: `url(${trend.imageUrl})` }
                : trend.contentType === 'magazine'
                  ? { backgroundImage: `url(${trend.photos[0]})` }
                  : { background: trend.bgGradient }
            }
          >
            <div className="absolute top-3 left-3 text-[11px] bg-primary-400 text-white px-2.5 py-1 rounded-full font-bold">
              {trend.tag}
            </div>
            {trend.contentType === 'article' && (
              <span className="text-sm text-primary-800">📰 {trend.sourceName}</span>
            )}
          </div>
        )}

        <div className="px-5 pt-4">
        <h2 className="text-[20px] font-extrabold text-text mb-2.5">{trend.title}</h2>

        {trend.contentType === 'magazine' ? (
          <p className="text-[14px] text-text font-semibold leading-[1.7] mb-4">
            {trend.intro}
          </p>
        ) : (
          <p className="text-[13px] text-text-secondary leading-[1.7] mb-3.5">
            {trend.description}
          </p>
        )}

        {trend.contentType === 'magazine' && (
          <div className="mb-5">
            <h3 className="text-[12px] font-bold text-text-secondary mb-2.5">컬러 팔레트</h3>
            <div className="flex gap-4">
              {trend.colorPalette.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1.5">
                  <span
                    className="h-9 w-9 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] text-text-secondary">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {trend.contentType === 'magazine' && trend.photos.length > 1 && (
          <div className="mb-5 grid grid-cols-2 gap-2">
            {trend.photos.slice(1).map((photo, i) => (
              <div
                key={i}
                className="aspect-[0.8] rounded-xl bg-bg-secondary bg-cover bg-center"
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}
          </div>
        )}

        {trend.contentType === 'article' && (
          <a
            href={trend.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-primary-600 mb-3.5"
          >
            {trend.sourceName}에서 원문 보기 ↗
          </a>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-4.5">
          {trend.relatedTags.map((tag) => (
            <span
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full font-medium cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Related Lookbooks — 이 트렌드 태그와 같은 태그를 가진 실제 룩북 */}
        <h3 className="text-[14px] font-bold text-text mb-3">이 트렌드의 가성비 룩북</h3>
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          {isRelatedLoading && (
            <p className="text-[12px] text-text-secondary">불러오는 중...</p>
          )}
          {!isRelatedLoading && (relatedLookbooks?.items.length ?? 0) === 0 && (
            <p className="text-[12px] text-text-secondary">
              아직 이 트렌드로 올라온 룩북이 없어요
            </p>
          )}
          {relatedLookbooks?.items.map((lb) => (
            <div
              key={lb.id}
              onClick={() => handleLookbookClick(lb.id)}
              className="w-[110px] shrink-0 aspect-[0.8] rounded-xl cursor-pointer overflow-hidden bg-bg-secondary bg-cover bg-center transition-transform active:scale-95"
              style={{ backgroundImage: `url(${lb.originalImageUrl})` }}
            />
          ))}
        </div>

        {/* Bottom Button */}
        <button
          onClick={handleMatchStartClick}
          className="w-full bg-primary-400 text-white py-4 rounded-xl font-bold text-[15px] active:bg-primary-600 transition-colors"
        >
          이 트렌드로 매칭 시작하기
        </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TrendDetailPage;
