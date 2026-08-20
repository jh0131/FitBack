import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { TREND_ARTICLES } from '../constants/trendArticles';
import { useMyProfile } from '../hooks/useMyPage';
import { useClosetItems, useDeleteClosetItem, useSaveTrend } from '../hooks/useMyCloset';

const FILTER_TABS = [
  { id: 'all', label: '전체' },
  { id: 'my-style', label: '내 스타일' },
  { id: 'minimal', label: '#미니멀', tag: '#미니멀' },
  { id: 'street', label: '#스트릿', tag: '#스트릿' },
  { id: 'lovely', label: '#러블리', tag: '#러블리' },
  { id: 'casual', label: '#캐주얼', tag: '#캐주얼' },
  { id: 'formal', label: '#포멀', tag: '#포멀' },
];

const MoreTrendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const { data: profile } = useMyProfile();

  // 저장 여부를 로컬 Set으로만 흉내내던 것 — 실제로는 마이 클로젯에 반영이 안 됐음
  // (새로고침하면 사라짐). 진짜 저장/삭제 API로 교체.
  const { data: closetItems = [] } = useClosetItems();
  const savedItemByTrendId = useMemo(() => {
    const map = new Map<number, number>(); // trendId -> closetSave id
    closetItems.forEach((item) => {
      if (item.category === 'trend') map.set(item.targetId, item.id);
    });
    return map;
  }, [closetItems]);
  const saveTrend = useSaveTrend();
  const deleteClosetItem = useDeleteClosetItem();

  const activeTag = FILTER_TABS.find((tab) => tab.id === activeFilter)?.tag;
  const myStyleTags = useMemo(
    () => (profile?.styleTags ?? []).map((name) => `#${name}`),
    [profile],
  );

  const trends = useMemo(() => {
    if (activeFilter === 'my-style') {
      return TREND_ARTICLES.filter((t) => t.relatedTags.some((tag) => myStyleTags.includes(tag)));
    }
    return activeTag ? TREND_ARTICLES.filter((t) => t.relatedTags.includes(activeTag)) : TREND_ARTICLES;
  }, [activeFilter, activeTag, myStyleTags]);

  const toggleSave = (e: React.MouseEvent, trendId: number) => {
    e.stopPropagation();
    const savedId = savedItemByTrendId.get(trendId);
    if (savedId != null) {
      deleteClosetItem.mutate(savedId);
    } else {
      saveTrend.mutate(trendId);
    }
  };

  const handleTrendClick = (id: number) => {
    navigate(`/trend/${id}`);
  };

  return (
    <div className="h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] bg-bg h-screen flex flex-col shadow-lg relative">
        {/* Header */}
      <header className="flex items-center justify-between p-5 shrink-0">
        <button onClick={() => navigate(-1)} className="cursor-pointer" aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-text">요즘 트렌드</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto shrink-0 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full shrink-0 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-primary-400 text-white font-bold'
                  : 'bg-bg-secondary text-text-secondary font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Body - Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {trends.length === 0 ? (
          <p className="pt-16 text-center text-xs text-text-secondary">해당하는 트렌드가 없어요</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 content-start">
            {trends.map((trend) => (
              <div
                key={trend.id}
                onClick={() => handleTrendClick(trend.id)}
                className="rounded-[18px] aspect-[0.85] flex flex-col justify-end p-3 relative cursor-pointer overflow-hidden"
                style={
                  trend.contentType === 'photo'
                    ? { backgroundImage: `url(${trend.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : trend.contentType === 'magazine' && trend.photos[0]
                      ? { backgroundImage: `url(${trend.photos[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: trend.bgGradient }
                }
              >
                {/* Bookmark Icon */}
                <button
                  className="absolute top-2.5 right-2.5 cursor-pointer z-10"
                  onClick={(e) => toggleSave(e, trend.id)}
                >
                  {/* 홈 화면 트렌드 카드와 같은 흰색으로 통일 — 사진 위에 얹히는
                      아이콘이라 보라색보다 흰색이 배경과 상관없이 더 잘 보임 */}
                  <Bookmark
                    size={16}
                    strokeWidth={2}
                    fill={savedItemByTrendId.has(trend.id) ? '#fff' : 'none'}
                    stroke="#fff"
                    className="drop-shadow"
                  />
                </button>

                {/* Tag Badge */}
                <span
                  className="text-[10px] bg-white/90 px-2 py-0.5 rounded-full font-bold self-start mb-1.5"
                  style={{ color: trend.tagColor }}
                >
                  {trend.tag}
                </span>
                {/* Title */}
                <span
                  className={`text-[13px] font-bold ${
                    trend.contentType === 'photo' || (trend.contentType === 'magazine' && trend.photos[0])
                      ? 'text-white drop-shadow'
                      : ''
                  }`}
                  style={
                    trend.contentType === 'photo' || (trend.contentType === 'magazine' && trend.photos[0])
                      ? undefined
                      : { color: trend.tagColor }
                  }
                >
                  {trend.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default MoreTrendsPage;
