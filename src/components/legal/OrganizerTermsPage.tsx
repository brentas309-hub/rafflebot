import LegalPage from './LegalPage';

export default function OrganizerTermsPage() {
  return (
    <LegalPage title="Organizer Terms">
      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">1. Introduction</h2>
        <p>These Organizer Terms apply to all organizations using RaffleBot to conduct fundraising raffles. These terms supplement the Terms of Service.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">2. Organizer Responsibilities</h2>
        <p className="mb-2">The organizer is solely responsible for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Conducting raffles lawfully</li>
          <li>Complying with all applicable laws</li>
          <li>Obtaining permits and approvals</li>
          <li>Maintaining accurate raffle information</li>
          <li>Managing participant communications</li>
          <li>Selecting winners</li>
          <li>Delivering prizes</li>
        </ul>
        <p className="mt-3">RaffleBot does not conduct or administer raffles.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">3. Prize Ownership</h2>
        <p>The organizer warrants that it owns each advertised prize or has legal authority to award it. The organizer must not advertise prizes it cannot legally provide.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">4. Prize Fulfilment</h2>
        <p className="mb-2">The organizer is solely responsible for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Delivering prizes</li>
          <li>Shipping costs</li>
          <li>Customs obligations</li>
          <li>Prize-related disputes</li>
          <li>Replacement or substitute prizes</li>
        </ul>
        <p className="mt-3">RaffleBot bears no responsibility for prize fulfilment.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">5. Compliance With Laws</h2>
        <p>The organizer is solely responsible for ensuring that every raffle complies with laws applicable in its jurisdiction. RaffleBot makes no representation that use of the platform satisfies legal requirements in any country, state, province, territory, or region.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">6. Cash Prizes</h2>
        <p>Where cash prizes are offered, the organizer is solely responsible for ensuring such prizes are lawful and permitted within the relevant jurisdiction.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">7. Verification Rights</h2>
        <p className="mb-2">RaffleBot may request:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proof of identity</li>
          <li>Proof of organizational status</li>
          <li>Proof of prize ownership</li>
          <li>Proof of prize delivery</li>
          <li>Regulatory documentation</li>
        </ul>
        <p className="mt-3">Failure to provide requested information may result in suspension or termination.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">8. Fraud Prevention</h2>
        <p className="mb-2">Organizers must not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mislead participants</li>
          <li>Falsify winner information</li>
          <li>Manipulate raffle outcomes</li>
          <li>Misrepresent prizes</li>
          <li>Provide false fundraising claims</li>
        </ul>
        <p className="mt-3">RaffleBot may suspend or terminate access where fraud is suspected.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">9. Record Keeping</h2>
        <p>Organizers agree to maintain accurate records relating to ticket sales, winner selection, prize delivery, and regulatory compliance. Such records must be provided upon reasonable request.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">10. Suspension and Removal</h2>
        <p>RaffleBot may suspend, restrict, remove, or terminate any raffle or organization where we reasonably believe a law may have been breached, fraud may have occurred, participants may be at risk, or platform integrity may be compromised.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">11. Indemnity</h2>
        <p>The organizer agrees to indemnify and hold harmless RaffleBot, its directors, officers, employees, contractors, affiliates, and representatives from any claims, losses, damages, liabilities, penalties, costs, or legal expenses arising from any raffle conducted by the organizer, prize disputes, participant disputes, breach of law, fraudulent conduct, misrepresentation, or failure to deliver prizes.</p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">12. Relationship of Parties</h2>
        <p className="mb-2">The organizer acknowledges that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>RaffleBot is a software provider only</li>
          <li>RaffleBot is not the raffle operator</li>
          <li>RaffleBot is not a promoter or sponsor</li>
          <li>RaffleBot is not responsible for raffle outcomes</li>
        </ul>
        <p className="mt-3">No agency, partnership, joint venture, employment, or fiduciary relationship is created through use of the platform.</p>
      </section>
    </LegalPage>
  );
}
