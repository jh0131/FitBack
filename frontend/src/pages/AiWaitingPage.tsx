import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCreateAnalysis } from '../hooks/useAiAnalysis';
import { useUploadStore } from '../store/useUploadStore';

export const AiWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const imageId = useUploadStore((state) => state.imageId);
  const imageUri = useUploadStore((state) => state.imageUri);
  const setAnalysisResult = useUploadStore((state) => state.setAnalysisResult);

  const { mutateAsync: createAnalysis } = useCreateAnalysis();
  const [progress, setProgress] = useState(0);
  // 분석 성공/실패는 useMutation의 isPending/isSuccess 대신 로컬 상태로 직접 관리한다 —
  // 이 화면은 진행바 애니메이션 때문에 30ms마다 리렌더되는데, 그 리렌더 빈도 때문인지
  // useMutation이 노출하는 isPending/isSuccess가 실제로 요청이 성공(네트워크상 201)해도
  // 계속 pending에 멈춰있는 문제가 있었음 — mutateAsync를 한 번만 호출하고 그 결과를
  // 직접 로컬 state에 반영하는 방식으로 우회.
  const [analysisState, setAnalysisState] = useState<'pending' | 'success' | 'error'>('pending');
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // '/analyze'는 실제로 존재하지 않는 경로였음 — 업로드 화면의 진짜 경로인
    // '/image-upload'로 보내야 리다이렉트가 실제로 동작한다.
    if (!imageId) {
      navigate('/image-upload');
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    createAnalysis(imageId)
      .then((data) => {
        setAnalysisResult({
          reportId: data.reportId,
          imageUrl: data.imageUrl,
          matchPercentage: data.matchPercentage,
          suggestedTags: data.suggestedTags,
        });
        setAnalysisState('success');
      })
      .catch((err: Error) => {
        setAnalysisErrorMessage(err.message);
        setAnalysisState('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId]);

  const isPending = analysisState === 'pending';
  const isSuccess = analysisState === 'success';
  const isError = analysisState === 'error';

  useEffect(() => {
    // UX용 진행바 애니메이션 — 실제 분석 완료 여부와는 별개로 최소 시청 시간을 보장한다.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const canProceed = progress >= 100 && isSuccess;

  const handleNext = () => {
    if (!canProceed) return;
    navigate('/tag-edit');
  };

  return (
    <div className="w-full max-w-[480px] min-h-screen mx-auto bg-bg flex flex-col text-text">
      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center gap-[24px] px-7">
        <div
          className="w-[180px] h-[220px] rounded-[20px] bg-bg-secondary relative overflow-hidden border border-border bg-cover bg-center"
          style={{ backgroundImage: imageUri ? `url('${imageUri}')` : undefined }}
        >
          {/* Scan Line */}
          <div className="absolute left-0 right-0 h-[3px] animate-scan bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_12px] shadow-primary-400"></div>

          {/* Corners */}
          <div className="absolute w-[18px] h-[18px] border-primary-400 top-[8px] left-[8px] border-t-[2.5px] border-l-[2.5px] rounded-tl-[3px]"></div>
          <div className="absolute w-[18px] h-[18px] border-primary-400 top-[8px] right-[8px] border-t-[2.5px] border-r-[2.5px] rounded-tr-[3px]"></div>
          <div className="absolute w-[18px] h-[18px] border-primary-400 bottom-[8px] left-[8px] border-b-[2.5px] border-l-[2.5px] rounded-bl-[3px]"></div>
          <div className="absolute w-[18px] h-[18px] border-primary-400 bottom-[8px] right-[8px] border-b-[2.5px] border-r-[2.5px] rounded-br-[3px]"></div>
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="text-[16px] text-primary-800 font-bold leading-snug">
            {canProceed ? (
              '분석이 완료됐어요!'
            ) : (
              <>스타일과 실루엣을<br />분석하고 있어요</>
            )}
          </div>
          <div className="text-[12px] text-text-secondary mt-[8px]">
            {isError
              ? (analysisErrorMessage ?? '분석 중 오류가 발생했습니다')
              : '감성은 그대로, 가격은 가볍게'}
          </div>
        </div>

        {/* Progress List */}
        <div className="w-full flex flex-col gap-[10px]">
          {/* Step 1 */}
          <div className="flex items-center gap-[10px]">
            <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${progress > 0 ? 'bg-primary-400' : 'bg-bg-secondary border-[2px] border-border'}`}>
              {progress > 0 && (
                <Check size={10} color="#fff" strokeWidth={3} />
              )}
            </div>
            <span className={`text-[13px] ${progress > 0 ? 'text-text-secondary' : 'text-primary-800 font-bold'}`}>이미지 업로드 완료</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-[10px]">
            <div className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center ${
              progress > 60 ? 'bg-primary-400' : progress > 0 ? 'bg-primary-50 border-[2px] border-primary-400' : 'bg-bg-secondary border-[2px] border-border'
            }`}>
              {progress > 60 && (
                <Check size={10} color="#fff" strokeWidth={3} />
              )}
            </div>
            <span className={`text-[13px] ${progress > 60 ? 'text-text-secondary' : progress > 0 ? 'text-primary-800 font-bold' : 'text-text-secondary'}`}>
              스타일 태그 분석 중
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-[10px]">
            <div className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center ${
              progress >= 100 ? 'bg-primary-400' : progress > 60 ? 'bg-primary-50 border-[2px] border-primary-400' : 'bg-bg-secondary border-[2px] border-border'
            }`}>
              {progress >= 100 && (
                <Check size={10} color="#fff" strokeWidth={3} />
              )}
            </div>
            <span className={`text-[13px] ${progress >= 100 ? 'text-text-secondary' : progress > 60 ? 'text-primary-800 font-bold' : 'text-text-secondary'}`}>
              가성비 아이템 매칭
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[6px] bg-bg-secondary rounded-[10px] overflow-hidden mt-[6px]">
            <div
              className="h-full bg-gradient-to-r from-primary-200 to-primary-400 rounded-[10px] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {isError ? (
          // AI가 태그를 하나도 못 뽑는 등 409(ANALYSIS_NOT_READY)로 분석이 끝내 실패하면
          // canProceed가 영영 false로 고정돼 아래 버튼이 비활성 상태로만 남고, 이 화면을
          // 벗어날 방법이 전혀 없었음(재시도/나가기 버튼 부재로 인한 막다른 화면).
          // 다른 사진으로 다시 시도하거나 홈으로 나갈 수 있게 두 버튼을 추가.
          <div className="w-full flex flex-col gap-[10px] mt-4">
            <button
              onClick={() => navigate('/image-upload')}
              className="w-full text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 hover:bg-primary-500 transition-colors"
            >
              다른 사진으로 다시 시도
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-text-secondary text-[13px] font-bold border-none rounded-[14px] p-[12px] bg-transparent"
            >
              나가기
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full mt-4 text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 disabled:opacity-50 transition-opacity"
          >
            {isPending ? '분석 중...' : '태그 확인하기 →'}
          </button>
        )}
      </div>
    </div>
  );
};
