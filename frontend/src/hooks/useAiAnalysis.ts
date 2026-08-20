import { useMutation } from '@tanstack/react-query';
import { createAnalysis, type AnalysisResult } from '../api/analysis';

/**
 * SCR-06: 업로드된 이미지로 분석 리포트를 생성하는 훅
 * 실제 계약은 폴링이 아니라 POST /api/v1/analyses 단건 생성이다.
 */
export const useCreateAnalysis = () => {
  return useMutation<AnalysisResult, Error, string>({
    mutationFn: (imageId: string) => createAnalysis(imageId),
  });
};
