import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { FormSelect } from './FormSelect';
import { FormInput } from './FormInput';
import { FormCheckbox } from './FormCheckbox';

const registrationTypes = [
  { value: 'registered_charity', label: 'Registered Charity' },
  { value: 'incorporated_association', label: 'Incorporated Association' },
  { value: 'school', label: 'School' },
  { value: 'non_profit', label: 'Non-profit' },
  { value: 'community_group', label: 'Community group' },
];

export const LegalDetails: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    navigate('/onboarding/payments');
  };

  const handleBack = () => {
    navigate('/onboarding/contact');
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={7}
      onNext={handleNext}
      onBack={handleBack}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Legal Details</h2>
      <p className="text-gray-600 mb-8">
        We need to verify your organisation's legal status
      </p>

      <FormSelect
        label="Organisation Registration Type"
        value={data.registration_type}
        onChange={(value) => updateData('registration_type', value)}
        options={registrationTypes}
        required
      />

      <FormInput
        label="Registration / Charity Number"
        value={data.registration_number}
        onChange={(value) => updateData('registration_number', value)}
        placeholder="Enter your registration number"
        disabled={data.not_formally_registered}
      />

      <FormCheckbox
        label="Our organisation is not formally registered"
        checked={data.not_formally_registered}
        onChange={(checked) => updateData('not_formally_registered', checked)}
      />

      <FormCheckbox
        label="I confirm our organisation is permitted to run raffles in our jurisdiction"
        checked={data.confirmed_permitted}
        onChange={(checked) => updateData('confirmed_permitted', checked)}
        required
      />
    </OnboardingLayout>
  );
};
