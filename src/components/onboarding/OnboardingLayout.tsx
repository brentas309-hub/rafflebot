import React, { ReactNode } from 'react';
import { ProgressIndicator } from './ProgressIndicator';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  hideNavigation?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  hideNavigation = false,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Rafflebot
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {currentStep > 0 && (
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          )}

          <div className="mb-8">{children}</div>

          {!hideNavigation && (
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {backLabel}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {nextLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
