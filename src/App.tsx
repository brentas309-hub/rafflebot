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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<RaffleDashboard />} />
      <Route path="/club/settings" element={<ClubSettingsPage />} />

      <Route path="/onboarding/create-raffle" element={<CreateRaffleStep />} />
      <Route path="/onboarding/organisation" element={<OrganisationDetails />} />
      <Route path="/onboarding/preview" element={<RafflePreview />} />

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
      <Route path="/r/:raffleId" element={<PublicRafflePage />} />

      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
    </Routes>
  );
}
