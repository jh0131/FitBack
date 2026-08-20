import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useContentSearch } from '../hooks/useContentSearch';
import { useTags } from '../hooks/useTags';

const RECENT_SEARCH_KEY = 'fitback:recentSearches';
const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(list: string[]) {
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(list));
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());

  const { data: tags = [] } = useTags();

  // 입력 300ms 후에만 검색 실행 (매 타이핑마다 요청 나가는 것 방지)
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isLoading } = useContentSearch(keyword);

  const hasQuery = keyword.trim().length > 0;
  const hasResults = !!data && (data.trends.length > 0 || data.lookbooks.length > 0);

  // 실제 검색 결과가 나온 키워드만 최근 검색어에 남긴다 (빈 결과·오타는 제외)
  useEffect(() => {
    if (!hasQuery || isLoading || !hasResults) return;
    const trimmed = keyword.trim();
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((term) => term !== trimmed)].slice(0, MAX_RECENT);
      saveRecentSearches(next);
      return next;
    });
  }, [hasQuery, isLoading, hasResults, keyword]);

  const runSearch = (term: string) => {
    setInput(term);
    setKeyword(term);
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((t) => t !== term);
      saveRecentSearches(next);
      return next;
    });
  };

  return (
    <div className='flex flex-col text-text'>
      <header className='flex items-center gap-2 px-4 pt-5 pb-3 shrink-0'>
        <button
          type='button'
          onClick={() => navigate(-1)}
          aria-label='뒤로가기'
          className='grid h-9 w-9 place-items-center text-text shrink-0'
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>

        <div className='flex-1 flex items-center gap-2 rounded-2xl bg-primary-50/50 px-3.5 py-2.5'>
          <Search size={16} strokeWidth={2} className='text-text-tertiary shrink-0' />
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='스타일, 브랜드, 태그 검색'
            // 모바일 브라우저는 input의 폰트 크기가 16px보다 작으면 포커스 시 자동으로
            // 화면을 확대함 — text-sm(14px) 대신 text-base(16px)로 올려서 확대를 막는다.
            className='flex-1 text-base outline-none bg-transparent placeholder:text-text-secondary'
          />
        </div>
      </header>

      <div className='flex-1 overflow-y-auto px-5 pb-8'>
        {!hasQuery && (
          <div className='pt-2'>
            {recentSearches.length > 0 && (
              <section className='mb-6'>
                <h2 className='text-xs font-bold text-text-secondary mb-2'>최근 검색어</h2>
                <div className='flex flex-wrap gap-2'>
                  {recentSearches.map((term) => (
                    <span
                      key={term}
                      className='inline-flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5 text-xs text-text'
                    >
                      <button type='button' onClick={() => runSearch(term)}>
                        {term}
                      </button>
                      <button
                        type='button'
                        onClick={() => removeRecentSearch(term)}
                        aria-label={`${term} 삭제`}
                        className='text-text-tertiary'
                      >
                        <X size={11} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}

            {tags.length > 0 && (
              <section>
                <h2 className='text-xs font-bold text-text-secondary mb-2'>추천 태그</h2>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <button
                      key={tag.tagId}
                      type='button'
                      onClick={() => runSearch(tag.tagName)}
                      className='rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700'
                    >
                      #{tag.tagName}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {recentSearches.length === 0 && tags.length === 0 && (
              <p className='pt-16 text-center text-xs text-text-secondary'>
                찾고 싶은 스타일이나 태그를 검색해보세요
              </p>
            )}
          </div>
        )}

        {hasQuery && isLoading && (
          <p className='pt-16 text-center text-xs text-text-secondary'>검색 중...</p>
        )}

        {hasQuery && !isLoading && !hasResults && (
          <p className='pt-16 text-center text-xs text-text-secondary'>
            '{keyword}'에 대한 검색 결과가 없어요
          </p>
        )}

        {/* 트렌드 섹션: id -> trendId, label -> title 수정 완료 */}
        {hasQuery && !isLoading && data && data.trends.length > 0 && (
          <section className='mt-2'>
            <h2 className='text-xs font-bold text-text-secondary mb-2'>트렌드</h2>
            <div className='flex gap-3 overflow-x-auto pb-1'>
              {data.trends.map((trend) => (
                <button
                  key={trend.trendId} 
                  type='button'
                  onClick={() => navigate(`/trend/${trend.trendId}`)}
                  className='relative w-28 h-28 shrink-0 rounded-xl bg-bg-secondary border border-border overflow-hidden text-left'
                >
                  <img src={trend.imageUrl} alt={trend.title} className='h-full w-full object-cover' />
                  <span className='absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-text'>
                    #{trend.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 룩북 섹션: id -> lookbookId, imageUrl -> originalImageUrl 수정 완료, 신규 필드 UI 반영 */}
        {hasQuery && !isLoading && data && data.lookbooks.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-xs font-bold text-text-secondary mb-2'>룩북</h2>
            <div className='grid grid-cols-2 gap-3'>
              {data.lookbooks.map((lookbook) => (
                <button
                  key={lookbook.lookbookId}
                  type='button'
                  onClick={() => navigate(`/lookbooks/${lookbook.lookbookId}`)}
                  className='rounded-xl overflow-hidden border border-border bg-white text-left'
                >
                  <div
                    className='aspect-square bg-bg-secondary bg-cover bg-center'
                    style={{ backgroundImage: `url(${lookbook.originalImageUrl})` }}
                  />
                  <div className='p-2 flex items-center justify-between gap-1.5'>
                    <div className='flex items-center gap-1.5 min-w-0'>
                      {/* 프로필 사진이 없는 유저가 대부분인데 src가 undefined인 img를 그대로 그려서
                          브라우저 기본 '깨진 이미지' 아이콘이 뜨고 비율이 깨졌음 — 값 있을 때만
                          img를 그리고, 없으면 배경색 원으로 대체(다른 화면들과 동일 패턴). */}
                      <div className='w-5 h-5 rounded-full bg-bg-secondary overflow-hidden shrink-0'>
                        {lookbook.authorProfileImageUrl && (
                          <img
                            src={lookbook.authorProfileImageUrl}
                            alt=''
                            className='h-full w-full object-cover'
                          />
                        )}
                      </div>
                      <span className='text-[11px] text-text-secondary truncate'>
                        {lookbook.authorNickname}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 text-[11px] text-text-secondary shrink-0'>
                      <span>{lookbook.isLiked ? '❤️' : '🤍'}</span>
                      <span>{lookbook.likeCount}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
