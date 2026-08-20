import { useMutation } from '@tanstack/react-query';
import { saveReport, type SaveReportSelectedItem, type SaveReportResult } from '../api/analysis';

export interface SaveReportRequest {
  reportId: number;
  selectedItems: SaveReportSelectedItem[];
}

/**
 * SCR-08: 현재 추천 결과에서 카테고리별로 선택한 상품을 마이 클로젯에 저장하는 훅
 */
export const useSaveReport = () => {
  return useMutation<SaveReportResult, Error, SaveReportRequest>({
    mutationFn: ({ reportId, selectedItems }) => saveReport(reportId, selectedItems),
    onSuccess: () => {
      alert('리포트가 마이 클로젯에 성공적으로 저장되었습니다!');
    },
    onError: (error) => {
      console.error('마이 클로젯 저장 실패:', error);
      alert('마이 클로젯에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });
};
