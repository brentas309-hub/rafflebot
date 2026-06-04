import LegalPage from './LegalPage';

export default function TrustSafetyPage() {
  return (
    <LegalPage title="Trust & Safety">
      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">1. Purpose</h2>
        <p>RaffleBot is committed to maintaining a safe, transparent, and trustworthy platform for organizations and participants. This Trust & Safety Policy explains how we investigate misuse, verify organizations, and respond to potential fraud or misconduct.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">2. Our Role</h2>
        <p>RaffleBot provides software services only. RaffleBot does not operate raffles, select winners, or distribute prizes. However, RaffleBot reserves the right to investigate activity that may threaten the integrity of the platform.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">3. Verification</h2>
        <p className="mb-2">Organizations may be required to provide:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proof of identity</li>
          <li>Proof of organization status</li>
          <li>Proof of authority to represent an organization</li>
          <li>Proof of prize ownership</li>
          <li>Proof of prize delivery</li>
          <li>Additional compliance information</li>
        </ul>
        <p className="mt-3">Verification requirements may vary depending on risk factors and jurisdiction.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">4. Monitoring</h2>
        <p className="mb-2">RaffleBot may monitor platform activity for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fraudulent activity</li>
          <li>Misleading information</li>
          <li>Suspicious transactions</li>
          <li>Abuse of the platform</li>
          <li>Violations of applicable laws or our Terms</li>
        </ul>
        <p className="mt-3">Monitoring may be automated, manual, or both.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">5. Prize Verification</h2>
        <p className="mb-2">RaffleBot may request evidence that a prize exists, is owned or controlled by the organizer, and can legally be awarded. Evidence may include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Purchase receipts</li>
          <li>Ownership records</li>
          <li>Photographs</li>
          <li>Agreements or other supporting documentation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">6. Winner Verification</h2>
        <p>Where concerns arise, RaffleBot may request evidence that a winner was properly selected, notified, and that the prize was delivered as advertised.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">7. Restricted Activities</h2>
        <p className="mb-2">Organizations must not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Conduct fraudulent raffles</li>
          <li>Manipulate raffle outcomes</li>
          <li>Misrepresent prizes</li>
          <li>Mislead participants</li>
          <li>Impersonate another organization</li>
          <li>Provide false information</li>
          <li>Use the platform for unlawful activities</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">8. Reports and Complaints</h2>
        <p>Participants may report prize delivery issues, suspected fraud, misleading information, or suspicious activity to <a href="mailto:support@getrafflebot.com" className="text-blue-600 hover:underline">support@getrafflebot.com</a></p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">9. Enforcement Actions</h2>
        <p className="mb-2">RaffleBot may, at its sole discretion:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request additional information</li>
          <li>Restrict platform access</li>
          <li>Suspend organizations</li>
          <li>Remove raffles</li>
          <li>Freeze publishing privileges</li>
          <li>Terminate accounts</li>
          <li>Report unlawful conduct to relevant authorities</li>
        </ul>
        <p className="mt-3">We are not obligated to provide advance notice before taking action.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">10. No Guarantee</h2>
        <p>Although RaffleBot undertakes reasonable measures to protect platform integrity, we do not guarantee that all organizations, raffles, participants, prizes, or claims are legitimate. Participants remain responsible for exercising their own judgment before entering a raffle.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">11. Cooperation</h2>
        <p>Organizations agree to cooperate with reasonable Trust & Safety investigations and requests. Failure to cooperate may result in suspension or termination of platform access.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">12. Changes</h2>
        <p>RaffleBot may update this Policy at any time. Continued use of the platform constitutes acceptance of any updated version.</p>
      </section>
    </LegalPage>
  );
}
