import { create } from 'zustand';
import type { RecommendationGroup, SuggestedTag } from '../api/analysis';

// 1) State 타입
interface UploadState {
  imageUri: string | null; // 로컬 미리보기(선택 직후) 또는 분석 응답의 서명 이미지 URL
  imageId: string | null; // 업로드 완료 후 발급된 이미지 식별자
  reportId: number | null; // 분석 생성 후 발급된 리포트 식별자
  aiTags: string[]; // 화면에 보이는 태그 칩 목록 (추출 태그 + 사용자가 추가한 태그)
  suggestedTags: SuggestedTag[]; // 분석 응답이 준 원본 추천 태그(tagId 포함) — 확정/직접입력 구분용
  matchPercentage: number;
  recommendationGroups: RecommendationGroup[];
  partial: boolean;
  warnings: string[];
  analysisStatus: 'idle' | 'analyzing' | 'done' | 'error';
}

// 2) Action 타입
interface UploadActions {
  setImage: (uri: string) => void;
  setImageId: (imageId: string) => void;
  setAnalysisResult: (params: {
    reportId: number;
    imageUrl: string;
    matchPercentage: number;
    suggestedTags: SuggestedTag[];
  }) => void;
  setAiTags: (tags: string[]) => void;
  setRecommendations: (params: {
    recommendationGroups: RecommendationGroup[];
    partial: boolean;
    warnings: string[];
  }) => void;
  setStatus: (status: UploadState['analysisStatus']) => void;
  resetUpload: () => void; // 리포트 확인 후 다음 업로드를 위해 초기화
}

type UploadStore = UploadState & UploadActions;

// 3) 초기값
const initialState: UploadState = {
  imageUri: null,
  imageId: null,
  reportId: null,
  aiTags: [],
  suggestedTags: [],
  matchPercentage: 70,
  recommendationGroups: [],
  partial: false,
  warnings: [],
  analysisStatus: 'idle',
};

// 4) 스토어 생성 — persist 불필요 (새로고침 시 유지할 필요 없는 임시 데이터)
export const useUploadStore = create<UploadStore>((set) => ({
  ...initialState,

  setImage: (imageUri) => set({ imageUri, analysisStatus: 'idle' }),
  setImageId: (imageId) => set({ imageId }),
  setAnalysisResult: ({ reportId, imageUrl, matchPercentage, suggestedTags }) =>
    set({
      reportId,
      imageUri: imageUrl,
      matchPercentage,
      suggestedTags,
      aiTags: suggestedTags.map((tag) => tag.tagName),
    }),
  setAiTags: (aiTags) => set({ aiTags }),
  setRecommendations: ({ recommendationGroups, partial, warnings }) =>
    set({ recommendationGroups, partial, warnings }),
  setStatus: (analysisStatus) => set({ analysisStatus }),
  resetUpload: () => set({ ...initialState }),
}));
