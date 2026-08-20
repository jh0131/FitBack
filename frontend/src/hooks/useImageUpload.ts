import { useState, useCallback } from 'react';
import axios from 'axios';
import { api } from '../api/axiosInstance';

// 업로드 용도(목적)를 명확한 타입으로 정의
export type UploadPurpose = 'ANALYSIS' | 'LOOKBOOK' | 'PROFILE';

export const useImageUpload = (purpose: UploadPurpose) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // 진행률(%) 상태
  const [imageId, setImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  // 1. 파일 유효성 검증 
  const validateFile = (file: File): boolean => {
    const MAX_SIZE = 5 * 1024 * 1024; // 최대 파일 크기 5MB 이하 정책
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']; // 허용 파일 형식 

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.');
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError('파일 용량은 최대 5MB를 초과할 수 없습니다.');
      return false;
    }

    setError(null);
    return true;
  };

  // 2. 실제 백엔드 연동 업로드 프로세스
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setLastFile(file);
    setIsUploading(true);
    setUploadProgress(0); // 업로드 시작 시 진행률 0으로 초기화
    setError(null);
    setImageId(null);

    try {
      // 1단계: Presigned URL 발급 요청 (FIT-BACK API — JWT 자동 첨부)
      const requestRes = await api.post('/api/v1/images/upload-requests', {
        purpose,
        contentType: file.type,
        fileSize: file.size,
      });

      const { imageId: newImageId, uploadUrl, uploadFields } = requestRes.data.data;

      // 2단계: S3 직접 업로드 (Presigned POST)
      const formData = new FormData();

      // 백엔드에서 받은 uploadFields의 모든 키-값 쌍을 먼저 추가
      Object.entries(uploadFields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      // 반드시 마지막에 파일 추가
      formData.append('file', file);

      // S3 업로드 시 FIT-BACK JWT가 들어가지 않도록 깨끗한 새 axios 인스턴스 사용
      const s3Axios = axios.create();

      // 브라우저가 boundary를 자동 설정하도록 Content-Type 임의 지정 안 함 (FormData가 알아서 처리)
      const s3Response = await s3Axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (s3Response.status !== 204) {
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
      }

      // 3단계: 업로드 완료 API 호출 (매우 중요)
      // 이 완료 API까지 에러 없이 통과해야만 최종적으로 훅의 상태 업데이트
      const completeRes = await api.post(`/api/v1/images/${newImageId}/complete`);
      if (completeRes.data.data.status !== 'READY') {
        throw new Error('이미지 업로드 완료 확인에 실패했습니다.');
      }

      // 모든 단계 성공 시 상태 업데이트
      setImageId(newImageId);
      setUploadProgress(100);
      return newImageId as string;
    } catch (err: any) {
      setError(err.response?.data?.message || '이미지 업로드 중 오류가 발생했습니다.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [purpose]);

  // 3. 에러 발생 시 호출할 재시도 함수
  const retryUpload = useCallback(async () => {
    if (!lastFile) {
      setError('다시 시도할 파일이 존재하지 않습니다.');
      return;
    }
    await uploadImage(lastFile);
  }, [lastFile, uploadImage]);

  return {
    uploadImage,    // 이미지를 업로드하는 함수
    retryUpload,    // 업로드 실패 시 마지막 파일 객체로 업로드를 재시도하는 함수
    isUploading,    // 현재 이미지 업로드가 진행 중인지 여부 (boolean)
    uploadProgress, // 이미지 업로드 진행률 (0 ~ 100 사이의 숫자 %)
    imageId,        // 업로드 완료 후 발급받은 이미지 고유 ID (string | null)
    error,          // 파일 검증 실패 또는 업로드 중 발생한 에러 메시지 (string | null)
    lastFile,       // 에러 발생 시 재시도를 위해 기억해 둔 직전 파일 객체 (File | null)
  };
};