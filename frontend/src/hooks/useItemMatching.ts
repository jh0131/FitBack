import { useMutation } from '@tanstack/react-query';
import {
  createRecommendations,
  type CreateRecommendationsRequest,
  type RecommendationsResult,
} from '../api/analysis';

/**
 * SCR-07: 사용자가 태그를 수정한 뒤 추천 결과를 생성하는 훅
 * @param reportId 리포트 식별자
 */
export const useItemMatching = (reportId: number) => {
  return useMutation<RecommendationsResult, Error, CreateRecommendationsRequest>({
    mutationFn: (body: CreateRecommendationsRequest) => createRecommendations(reportId, body),
    onError: (error) => {
      console.error('추천 결과 생성 실패:', error);
    },
  });
};
