import LegalPage from './LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">1. Introduction</h2>
        <p>RaffleBot respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and disclose information when you use the RaffleBot platform. By using RaffleBot, you agree to the practices described in this Privacy Policy.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">2. Information We Collect</h2>
        <p className="mb-2">We may collect:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account information — name, organization name, email, phone, country, login credentials</li>
          <li>Transaction information — ticket purchase details, amounts, dates, payment status</li>
          <li>Technical information — IP address, device info, browser type, usage data, cookies</li>
          <li>Verification information — identification documents, proof of organization status, compliance documentation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">3. How We Use Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and operate the platform</li>
          <li>Process transactions</li>
          <li>Verify organizations</li>
          <li>Prevent fraud and abuse</li>
          <li>Respond to support requests</li>
          <li>Improve platform performance</li>
          <li>Comply with legal obligations</li>
          <li>Communicate important updates</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">4. Information Shared With Organizations</h2>
        <p>When participants purchase tickets, relevant information may be shared with the organization operating the raffle, including name, email address, phone number, and purchase details. Organizations are responsible for their own handling of personal information.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">5. Payment Processing</h2>
        <p>Payments are processed by third-party payment providers such as Stripe. RaffleBot does not store full payment card information. Payment providers maintain their own privacy and security practices.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">6. Data Retention</h2>
        <p>We retain information for as long as necessary to operate the platform, maintain records, resolve disputes, comply with legal obligations, and prevent fraud. We may retain certain information after account closure where legally required.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">7. Security</h2>
        <p>We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information. However, no system is completely secure and we cannot guarantee absolute security.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">8. International Users</h2>
        <p>RaffleBot may operate across multiple countries. Information may be stored or processed in jurisdictions different from your own. By using the platform, you consent to such transfers where permitted by law.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">9. Cookies</h2>
        <p>We may use cookies and similar technologies to maintain user sessions, improve functionality, analyze platform usage, and enhance security. Users may disable cookies through browser settings, although some platform features may not function correctly.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">10. Your Rights</h2>
        <p>Subject to applicable law, you may request access to, correction of, or deletion of your information, or withdrawal of consent where applicable. Requests may be submitted to <a href="mailto:support@getrafflebot.com" className="text-blue-600 hover:underline">support@getrafflebot.com</a></p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">12. Contact</h2>
        <p>Questions may be directed to <a href="mailto:support@getrafflebot.com" className="text-blue-600 hover:underline">support@getrafflebot.com</a></p>
      </section>
    </LegalPage>
  );
}
