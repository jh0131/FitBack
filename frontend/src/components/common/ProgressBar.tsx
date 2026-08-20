import React from 'react';
import { Check } from 'lucide-react';

export interface ProgressBarProps {
  currentStep?: number;
  steps?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep = 1,
  steps = ['업로드 완료', '태그 분석 중', '아이템 매칭'],
}) => {
  const safeCurrentStep = Math.max(0, Math.min(currentStep, 3));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber <= safeCurrentStep;
          const isActive = stepNumber === safeCurrentStep + 1;

          return (
            <div key={index} className="flex items-center gap-3">
              {/* Dot */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-primary-400 text-bg'
                    : isActive
                    ? 'bg-primary-50 border-[1.5px] border-primary-400'
                    : 'bg-bg-secondary border-[1.5px] border-border'
                }`}
              >
                {isDone && <Check size={12} strokeWidth={3} />}
              </div>

              {/* Text */}
              <span
                className={`text-[10px] ${
                  isActive ? 'text-primary-800 font-bold' : 'text-text-secondary'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* 하단 Bar */}
      <div className="mt-8 h-1 bg-bg-secondary rounded-full w-full overflow-hidden">
        <div
          className={`h-full bg-primary-400 rounded-full transition-all duration-300 ease-in-out ${
            safeCurrentStep === 0
              ? 'w-0'
              : safeCurrentStep === 1
              ? 'w-1/3'
              : safeCurrentStep === 2
              ? 'w-2/3'
              : 'w-full'
          }`}
        />
      </div>
    </div>
  );
};
