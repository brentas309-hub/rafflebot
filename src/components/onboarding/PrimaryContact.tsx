import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { FormInput } from './FormInput';

export const PrimaryContact: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    navigate('/onboarding/legal');
  };

  const handleBack = () => {
    navigate('/onboarding/organisation');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={7}
      onNext={handleNext}
      onBack={handleBack}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Primary Contact</h2>
      <p className="text-gray-600 mb-8">Who will be the main contact for this account?</p>

      <FormInput
        label="First Name"
        value={data.contact_first_name}
        onChange={(value) => updateData('contact_first_name', value)}
        placeholder="John"
        required
      />

      <FormInput
        label="Last Name"
        value={data.contact_last_name}
        onChange={(value) => updateData('contact_last_name', value)}
        placeholder="Smith"
        required
      />

      <FormInput
        label="Role / Position"
        value={data.contact_role}
        onChange={(value) => updateData('contact_role', value)}
        placeholder="e.g., Treasurer, Fundraising Coordinator"
        required
      />

      <FormInput
        label="Email Address"
        type="email"
        value={data.contact_email}
        onChange={(value) => updateData('contact_email', value)}
        placeholder="john.smith@example.com"
        required
      />

      <FormInput
        label="Phone Number"
        type="tel"
        value={data.contact_phone}
        onChange={(value) => updateData('contact_phone', value)}
        placeholder="+64 21 123 4567"
        required
      />

      <FormInput
        label="Create Password"
        type="password"
        value={data.password}
        onChange={(value) => updateData('password', value)}
        placeholder="Minimum 8 characters"
        required
      />
    </OnboardingLayout>
  );
};
