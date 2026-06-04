import LegalPage from './LegalPage';

export default function ParticipantTermsPage() {
  return (
    <LegalPage title="Participant Terms">
      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">1. Introduction</h2>
        <p>These Participant Terms apply to individuals who purchase raffle tickets through the RaffleBot platform.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">2. Relationship Between Parties</h2>
        <p>Each raffle is operated by the organization identified on the raffle page. RaffleBot provides software services only. RaffleBot is not the organizer, promoter, sponsor, administrator, or operator of any raffle.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">3. Ticket Purchases</h2>
        <p>Ticket purchases are transactions between the participant and the organization conducting the raffle. RaffleBot is not a party to that transaction.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">4. Prize Responsibility</h2>
        <p className="mb-2">The organization conducting the raffle is solely responsible for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Prize ownership</li>
          <li>Prize delivery</li>
          <li>Winner selection</li>
          <li>Raffle administration</li>
          <li>Compliance with applicable laws</li>
        </ul>
        <p className="mt-3">RaffleBot is not responsible for any prize-related issues.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">5. Refunds</h2>
        <p>Refund requests must be directed to the organization conducting the raffle. RaffleBot does not issue refunds for raffle tickets unless required by applicable law.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">6. Disputes</h2>
        <p className="mb-2">Any dispute relating to ticket purchases, winner selection, prize delivery, eligibility, or raffle rules must be directed to the organization conducting the raffle. RaffleBot is not responsible for resolving such disputes.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">7. Platform Availability</h2>
        <p>RaffleBot does not guarantee uninterrupted access to the platform and is not liable for interruptions, delays, technical failures, or service outages.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">8. Limitation of Liability</h2>
        <p className="mb-2">To the fullest extent permitted by law, RaffleBot shall not be liable for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Prize disputes</li>
          <li>Organizer misconduct</li>
          <li>Fraud or misrepresentation</li>
          <li>Lost opportunities</li>
          <li>Consequential or indirect damages</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">9. Privacy</h2>
        <p>Participant information is handled in accordance with the RaffleBot <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. Certain information may be shared with the organization operating the raffle to facilitate administration and prize fulfilment.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">10. Governing Law</h2>
        <p>These Terms are governed by the laws of New Zealand unless otherwise required by applicable consumer protection laws.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">11. Contact</h2>
        <p>Questions may be directed to <a href="mailto:support@getrafflebot.com" className="text-blue-600 hover:underline">support@getrafflebot.com</a></p>
      </section>
    </LegalPage>
  );
}
