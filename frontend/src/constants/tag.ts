import type { CategoryType, TagMaster } from '../types/tag';

export const TAG_CATEGORIES: { type: CategoryType; label: string }[] = [
  { type: 'STYLE', label: '스타일' },
  { type: 'SILHOUETTE', label: '실루엣/핏 & 기장 & 밑위' },
  { type: 'MATERIAL', label: '소재' },
  { type: 'DETAIL', label: '디테일' },
  { type: 'COLOR', label: '컬러' },
];

export const TAG_MASTER_DB: TagMaster[] = [
  // STYLE
  { tagName: "스트릿", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "캐주얼", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "빈티지", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "고프코어", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "아메카지", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "프레피", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "미니멀", categoryType: "STYLE", targetClothing: ["ALL"] },
  { tagName: "스포티", categoryType: "STYLE", targetClothing: ["ALL"] },
  
  // SILHOUETTE
  { tagName: "와이드핏", categoryType: "SILHOUETTE", targetClothing: ["바지"] },
  { tagName: "A라인", categoryType: "SILHOUETTE", targetClothing: ["스커트", "원피스", "아우터"] },
  { tagName: "크롭", categoryType: "SILHOUETTE", targetClothing: ["상의"] },
  { tagName: "오버핏", categoryType: "SILHOUETTE", targetClothing: ["상의", "아우터"] },
  { tagName: "슬림핏", categoryType: "SILHOUETTE", targetClothing: ["상의", "바지"] },
  { tagName: "테이퍼드", categoryType: "SILHOUETTE", targetClothing: ["바지"] },
  { tagName: "로우라이즈", categoryType: "SILHOUETTE", targetClothing: ["바지", "스커트"] },
  { tagName: "하이웨이스트", categoryType: "SILHOUETTE", targetClothing: ["바지", "스커트"] },
  { tagName: "맥시", categoryType: "SILHOUETTE", targetClothing: ["스커트", "원피스", "아우터"] },
  
  // MATERIAL
  { tagName: "데님", categoryType: "MATERIAL", targetClothing: ["ALL"] },
  { tagName: "레더", categoryType: "MATERIAL", targetClothing: ["아우터", "바지", "스커트"] },
  { tagName: "니트", categoryType: "MATERIAL", targetClothing: ["상의"] },
  { tagName: "코튼", categoryType: "MATERIAL", targetClothing: ["ALL"] },
  { tagName: "나일론", categoryType: "MATERIAL", targetClothing: ["아우터", "바지"] },
  { tagName: "리넨", categoryType: "MATERIAL", targetClothing: ["상의", "바지"] },
  
  // DETAIL
  { tagName: "브이넥", categoryType: "DETAIL", targetClothing: ["상의", "원피스", "아우터"] },
  { tagName: "버튼다운", categoryType: "DETAIL", targetClothing: ["상의"] },
  { tagName: "포켓", categoryType: "DETAIL", targetClothing: ["상의", "바지", "아우터"] },
  { tagName: "지퍼", categoryType: "DETAIL", targetClothing: ["아우터", "상의", "바지"] },
  { tagName: "레이스", categoryType: "DETAIL", targetClothing: ["상의", "스커트", "원피스"] },
  { tagName: "그래픽", categoryType: "DETAIL", targetClothing: ["상의"] },
  { tagName: "스트라이프", categoryType: "DETAIL", targetClothing: ["상의", "원피스"] },
  
  // COLOR
  { tagName: "블랙", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "화이트", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "블루", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "레드", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "그린", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "옐로우", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "그레이", categoryType: "COLOR", targetClothing: ["ALL"] },
  { tagName: "브라운", categoryType: "COLOR", targetClothing: ["ALL"] },
];

export const REASON_CODE_MAP: Record<string, { label: string; color: string }> = {
  FULL_ATTRIBUTE_MATCH: { label: '모든 속성 완벽 일치 ✨', color: 'bg-blue-100 text-blue-700' },
  HIGH_SIMILARITY: { label: '매칭률 80% 이상 🔥', color: 'bg-indigo-100 text-indigo-700' },
  PARTIAL_ATTRIBUTE_MATCH: { label: '일부 태그 매칭', color: 'bg-gray-100 text-gray-700' },
  NO_ATTRIBUTE_MATCH: { label: '일치하는 속성 없음', color: 'bg-gray-100 text-gray-500' },
  NO_SCORABLE_TAGS: { label: '추가 속성 태그 없음', color: 'bg-purple-100 text-purple-700' },
};
