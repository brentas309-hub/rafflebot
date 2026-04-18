import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  organisation_name: string;
  organisation_type: string;
  country: string;
  region: string;
  address: string;
  phone: string;
  website: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_role: string;
  contact_email: string;
  contact_phone: string;
  password: string;
  registration_type: string;
  registration_number: string;
  not_formally_registered: boolean;
  confirmed_permitted: boolean;
  stripe_connected: boolean;
  default_currency: string;
  default_ticket_price: string;
  expected_volume: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string | boolean) => void;
  updateMultiple: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const initialData: OnboardingData = {
  organisation_name: '',
  organisation_type: '',
  country: '',
  region: '',
  address: '',
  phone: '',
  website: '',
  contact_first_name: '',
  contact_last_name: '',
  contact_role: '',
  contact_email: '',
  contact_phone: '',
  password: '',
  registration_type: '',
  registration_number: '',
  not_formally_registered: false,
  confirmed_permitted: false,
  stripe_connected: false,
  default_currency: 'NZD',
  default_ticket_price: '',
  expected_volume: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (field: keyof OnboardingData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateMultiple = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, updateMultiple, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
