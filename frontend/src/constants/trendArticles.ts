/**
 * ==========================================
 *  트렌드 아티클 콘텐츠 (SCR-18/19)
 * ==========================================
 *
 * 트렌드 아티클은 별도 업로드 화면 없이, 이 파일을 레포에 push할 권한이 있는
 * 사람(=사실상 관리자)만 수정해서 올리는 방식으로 관리한다.
 * 사진(photo) / 외부 기사(article) / 유튜브 영상(youtube) / 자체 매거진(magazine) 네 가지
 * 타입을 지원한다. magazine은 컬러 팔레트와 화보 사진을 곁들인 자체 제작 스타일 가이드다
 * (외부 기사 링크가 없는 에디토리얼 콘텐츠라는 점에서 article과 구분됨).
 */

export type TrendContentType = 'photo' | 'article' | 'youtube' | 'magazine';

interface TrendArticleBase {
  id: number;
  tag: string;
  title: string;
  tagColor: string;
  bgGradient: string;
  description: string;
  relatedTags: string[];
}

export interface PhotoTrendArticle extends TrendArticleBase {
  contentType: 'photo';
  imageUrl: string;
}

export interface ArticleTrendArticle extends TrendArticleBase {
  contentType: 'article';
  sourceName: string;
  sourceUrl: string;
}

export interface YoutubeTrendArticle extends TrendArticleBase {
  contentType: 'youtube';
  youtubeVideoId: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface MagazineTrendArticle extends TrendArticleBase {
  contentType: 'magazine';
  intro: string;
  colorPalette: ColorSwatch[];
  photos: string[];
}

export type TrendArticle =
  | PhotoTrendArticle
  | ArticleTrendArticle
  | YoutubeTrendArticle
  | MagazineTrendArticle;

export const TREND_ARTICLES: TrendArticle[] = [
  {
    id: 1,
    tag: '#미니멀',
    title: '미니멀 무드',
    tagColor: '#3c3489',
    bgGradient: 'linear-gradient(160deg, #EEE9FF, #D5CCF5)',
    description:
      '군더더기 없는 깔끔한 실루엣과 뉴트럴 컬러로 완성하는 미니멀 스타일. 이번 시즌 가장 핫한 트렌드예요.',
    relatedTags: ['#미니멀', '#뉴트럴', '#와이드핏'],
    contentType: 'magazine',
    intro:
      '미니멀은 작은 악세서리와 함께 매치하면 더 아름답게 연출할 수 있어요',
    colorPalette: [
      { name: '화이트', hex: '#FFFFFF' },
      { name: '블랙', hex: '#1C1C1C' },
      { name: '아이보리', hex: '#F0E4D0' },
    ],
    photos: [
      'https://i.pinimg.com/1200x/6f/fe/1e/6ffe1ea673bc95190a513535c00678b9.jpg',
    ],
  },
  {
    id: 2,
    tag: '#스트릿',
    title: '스트릿패션을 표현하는 방법',
    tagColor: '#3c3489',
    bgGradient: 'linear-gradient(160deg, #F0EDF9, #DDD5F5)',
    description:
      '오버사이즈 실루엣과 레이어드 룩으로 완성하는 스트릿 스타일링.',
    relatedTags: ['#스트릿', '#오버사이즈', '#캐주얼'],
    contentType: 'magazine',
    intro:
      '스트릿은 오버사이즈 아이템에 포인트 액세서리를 더하면 개성있게 연출할 수 있어요',
    colorPalette: [
      { name: '화이트', hex: '#FFFFFF' },
      { name: '블랙', hex: '#1C1C1C' },
      { name: '데님블루', hex: '#5B7B9A' },
    ],
    photos: [
      'https://i.pinimg.com/736x/58/89/bd/5889bdca4cc29df44f87ab87f0b6dfe6.jpg',
      'https://i.pinimg.com/736x/a6/29/95/a62995db8ff64d83d733861ea7fb5fd3.jpg',
      'https://i.pinimg.com/736x/3e/b0/49/3eb04975a5fbf8fc44269d4ad8648470.jpg',
    ],
  },
  {
    id: 3,
    tag: '#러블리',
    title: '러블리 무드',
    tagColor: '#B23A6B',
    bgGradient: 'linear-gradient(160deg, #FDECF1, #F6C9DA)',
    description: '부드러운 실루엣과 파스텔 컬러로 완성하는 러블리 스타일링.',
    relatedTags: ['#러블리', '#페미닌'],
    contentType: 'photo',
    imageUrl: 'https://i.pinimg.com/1200x/9a/7d/47/9a7d473fb2b6d3e7ba3b82f7fe2e50a2.jpg',
  },
  {
    id: 4,
    tag: '#캐주얼',
    title: '캐주얼 무드',
    tagColor: '#9C620B',
    bgGradient: 'linear-gradient(160deg, #FEF5E8, #FAD9A0)',
    description: '데일리로 편하게 입기 좋은 캐주얼 코디 모음.',
    relatedTags: ['#캐주얼', '#데일리룩'],
    contentType: 'magazine',
    intro:
      '편안함과 스타일을 동시에 챙기는 데일리 캐주얼 룩! 기본 티셔츠와 데님에 볼캡이나 스니커즈를 믹스매치해 감각적인 이지룩을 연출해보세요.',
    colorPalette: [
      { name: '멜란지 그레이', hex: '#D1D5DB' },
      { name: '인디고 데님', hex: '#2563EB' },
      { name: '크림 베이지', hex: '#F3E5AB' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    tag: '#포멀',
    title: '오피스 포멀 무드',
    tagColor: '#3c3489',
    bgGradient: 'linear-gradient(160deg, #EAF0FA, #C9D9F0)',
    description: '단정하면서도 트렌디한 오피스룩 세팅 가이드.',
    relatedTags: ['#포멀', '#오피스룩'],
    contentType: 'magazine',
    intro:
      '격식 있는 자리부터 데일리 출근룩까지 커버하는 오피스 포멀 스타일. 깔끔한 핏의 블레이저와 슬랙스, 미니멀한 숄더백으로 지적인 분위기를 완벽 완성해보세요.',
    colorPalette: [
      { name: '네이비', hex: '#1E293B' },
      { name: '차콜', hex: '#475569' },
      { name: '클래식 화이트', hex: '#F8FAFC' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 6,
    tag: '#캐주얼 #포멀',
    title: '어떤 자리에서도 손색없는 캐주얼+포멀조합',
    tagColor: '#7A5C2E',
    bgGradient: 'linear-gradient(160deg, #F5EFE6, #E4D3B8)',
    description:
      '캐주얼함은 유지하면서 포멀한 자리에서도 손색없는 밸런스를 잡은 조합.',
    // 캐주얼/포멀 태그를 둘 다 선택한 사람 모두에게 노출되도록 두 태그를 함께 등록
    relatedTags: ['#캐주얼', '#포멀'],
    contentType: 'magazine',
    intro:
      '깔끔한 재킷 하나로 캐주얼 무드와 포멀 무드를 동시에 챙겨보세요. 미팅부터 저녁 약속까지, 옷을 갈아입지 않아도 자리에 맞게 자연스럽게 녹아드는 조합이에요.',
    colorPalette: [
      { name: '샌드 베이지', hex: '#D8C3A0' },
      { name: '차콜 그레이', hex: '#3A3A3A' },
      { name: '오프 화이트', hex: '#F2EEE6' },
    ],
    photos: [
      'https://i.pinimg.com/1200x/55/60/18/55601858d817ccd0c52f8a611b7faed0.jpg',
    ],
  },
];
