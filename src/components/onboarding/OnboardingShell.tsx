import { Outlet } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

export default function OnboardingShell() {
  return (
    <OnboardingProvider>
      <Outlet />
    </OnboardingProvider>
  );
}
