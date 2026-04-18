import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Success from "./Success";
import Cancel from "./Cancel";
import PublicRafflePage from "./components/PublicRafflePage";

export default function App() {
  return (
    <Routes>
      {/* Admin Dashboard */}
      <Route path="/" element={<Dashboard />} />

      {/* Public buyer page (slug-based) */}
      <Route path="/public-raffle/:raffleSlug" element={<PublicRafflePage />} />

      {/* Optional: support direct ID links too */}
      <Route path="/r/:raffleId" element={<PublicRafflePage />} />

      {/* Stripe redirects */}
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
    </Routes>
  );
}