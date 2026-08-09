import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Success from "./Success";
import Cancel from "./Cancel";
import PublicRafflePage from "./components/PublicRafflePage";
import RaffleDashboard from "./components/RaffleDashboard";
import ClubSettingsPage from "./components/ClubSettingsPage";
import OnboardingShell from "./components/onboarding/OnboardingShell";
import CreateRaffleStep from "./components/onboarding/CreateRaffleStep";
import { OrganisationDetails } from "./components/onboarding/OrganisationDetails";
import { VideoIntro } from "./components/onboarding/VideoIntro";
import { PrimaryContact } from "./components/onboarding/PrimaryContact";
import { LegalDetails } from "./components/onboarding/LegalDetails";
import { ConnectStripe } from "./components/onboarding/ConnectStripe";
import { RaffleDefaults } from "./components/onboarding/RaffleDefaults";
import { CompletionPage } from "./components/onboarding/CompletionPage";
import RafflePreview from './components/onboarding/RafflePreview';
import StripeSuccess from './components/onboarding/StripeSuccess';
import CreateAccount from './components/onboarding/CreateAccount';
import ConfirmEmail from './components/onboarding/ConfirmEmail';
import TermsPage from './components/legal/TermsPage';
import PrivacyPage from './components/legal/PrivacyPage';
import OrganizerTermsPage from './components/legal/OrganizerTermsPage';
import ParticipantTermsPage from './components/legal/ParticipantTermsPage';
import TrustSafetyPage from './components/legal/TrustSafetyPage';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage';
import ResetPassword from './components/ResetPassword';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<RaffleDashboard />} />
      <Route path="/club/settings" element={<ClubSettingsPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      <Route path="/onboarding/create-raffle" element={<CreateRaffleStep />} />
      <Route path="/onboarding/organisation" element={<OrganisationDetails />} />
      <Route path="/onboarding/preview" element={<RafflePreview />} />
      <Route path="/onboarding/stripe-success" element={<StripeSuccess />} />
      <Route path="/onboarding/create-account" element={<CreateAccount />} />
      <Route path="/onboarding/confirm-email" element={<ConfirmEmail />} />

      <Route path="/onboarding" element={<OnboardingShell />}>
        <Route path="intro" element={<VideoIntro />} />
        <Route path="contact" element={<PrimaryContact />} />
        <Route path="legal" element={<LegalDetails />} />
        <Route path="payments" element={<ConnectStripe />} />
        <Route path="raffle-defaults" element={<RaffleDefaults />} />
        <Route path="complete" element={<CompletionPage />} />
      </Route>

      <Route path="/raffle/:raffleSlug" element={<PublicRafflePage />} />
      <Route path="/public-raffle/:raffleSlug" element={<PublicRafflePage />} />
      <Route path="/r/:raffleSlug" element={<PublicRafflePage />} />

      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/organizer-terms" element={<OrganizerTermsPage />} />
      <Route path="/participant-terms" element={<ParticipantTermsPage />} />
      <Route path="/trust-safety" element={<TrustSafetyPage />} />
    </Routes>
  );
}
