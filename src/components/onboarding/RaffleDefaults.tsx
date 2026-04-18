import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { FormSelect } from './FormSelect';
import { FormInput } from './FormInput';

const currencies = [
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'USD', label: 'USD - US Dollar' },
];

const ticketVolumes = [
  { value: 'under_100', label: 'Under 100' },
  { value: '100_500', label: '100–500' },
  { value: '500_1000', label: '500–1000' },
  { value: '1000_plus', label: '1000+' },
];

export const RaffleDefaults: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    navigate('/onboarding/complete');
  };

  const handleBack = () => {
    navigate('/onboarding/payments');
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={7}
      onNext={handleNext}
      onBack={handleBack}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Raffle Default Settings</h2>
      <p className="text-gray-600 mb-8">
        Set your default preferences for raffles (you can change these later)
      </p>

      <FormSelect
        label="Default Currency"
        value={data.default_currency}
        onChange={(value) => updateData('default_currency', value)}
        options={currencies}
        required
      />

      <FormInput
        label="Typical Ticket Price"
        type="number"
        value={data.default_ticket_price}
        onChange={(value) => updateData('default_ticket_price', value)}
        placeholder="e.g., 5.00"
        required
      />

      <FormSelect
        label="Expected Ticket Volume"
        value={data.expected_volume}
        onChange={(value) => updateData('expected_volume', value)}
        options={ticketVolumes}
        required
      />
    </OnboardingLayout>
  );
};
