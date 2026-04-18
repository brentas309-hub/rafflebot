import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from './OnboardingLayout';
import { Check } from 'lucide-react';

export const VideoIntro: React.FC = () => {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);

  const handleSkipVideo = () => {
    navigate('/onboarding/organisation');
  };

  const handleJoinNow = () => {
    navigate('/onboarding/organisation');
  };

  return (
    <OnboardingLayout currentStep={0} totalSteps={7} hideNavigation>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Run your club's raffle online in minutes
        </h1>

        <div className="my-8 bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-white text-lg">
            <div className="mb-4">Video Player</div>
            <button
              onClick={() => setVideoEnded(true)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Simulate Video End
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-700 text-lg">Sell tickets online</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-700 text-lg">Track sales in real time</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-700 text-lg">Automatically draw winners</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleJoinNow}
            disabled={!videoEnded}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              videoEnded
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Join Now
          </button>
          <button
            onClick={handleSkipVideo}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Skip video
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
