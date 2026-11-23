import { useState } from 'react';
import { Link } from 'react-router-dom';

const BLUE = '#2366E6';
const BLUE_HOVER = '#1D59CC';

const legalLinks = [
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Organizer Terms', path: '/organizer-terms' },
  { label: 'Participant Terms', path: '/participant-terms' },
  { label: 'Trust & Safety', path: '/trust-safety' },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function LaptopMock() {
  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="relative">
        <div className="rounded-[18px] bg-[#1e293b] p-[10px] sm:p-[12px] shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <span className="h-2 w-2 rounded-full bg-[#64748b]" />
            <span className="h-2 w-2 rounded-full bg-[#64748b]" />
            <span className="h-2 w-2 rounded-full bg-[#64748b]" />
            <div className="ml-3 flex-1 h-5 rounded-md bg-[#334155] flex items-center px-2">
              <span className="text-[9px] text-slate-400 truncate">getrafflebot.com/r/winter-fundraiser</span>
            </div>
          </div>
          <div
            className="overflow-hidden rounded-[10px] bg-[#F8FAFC] px-4 py-4 sm:px-5 sm:py-5"
            style={{ minHeight: 360 }}
          >
            <p className="text-[10px] font-semibold tracking-wide uppercase text-[#2366E6] mb-1">
              Riverside Junior Football
            </p>
            <h3 className="text-[17px] sm:text-[19px] font-extrabold text-slate-900 leading-tight mb-1">
              Winter Fundraiser
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">$10.00 per ticket</p>

            <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-3 mb-3">
              <p className="text-[11px] font-bold text-slate-900 mb-1.5">Prizes</p>
              <p className="text-[11px] text-slate-600">Family hamper · Sponsored by the local butcher</p>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-3 mb-3">
              <p className="text-[11px] font-bold text-slate-900 mb-2">Community Progress</p>
              <div className="h-2 w-full rounded-full overflow-hidden mb-2" style={{ background: '#E8EEF9' }}>
                <div className="h-full rounded-full w-[64%]" style={{ background: BLUE }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="font-semibold text-slate-800">$640 raised</span>
                <span>36 tickets remaining</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {['1', '3', '5', '10'].map((n, i) => (
                <div
                  key={n}
                  className={`text-center rounded-lg py-2 text-[10px] font-semibold border ${
                    i === 1
                      ? 'border-[#2366E6] bg-[#F5F8FF] text-[#2366E6]'
                      : 'border-[#E2E8F0] bg-white text-slate-700'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>

            <div
              className="w-full rounded-[12px] py-2.5 text-center text-[12px] font-bold text-white"
              style={{ background: BLUE }}
            >
              Buy 3 tickets · $30.00
            </div>
          </div>
        </div>
        <div className="mx-auto h-2.5 w-[72%] rounded-b-[10px] bg-[#334155]" />
        <div className="mx-auto h-1.5 w-[88%] rounded-b-[4px] bg-[#94a3b8]" />
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="w-full rounded-[18px] overflow-hidden border border-[#E2E8F0] shadow-[0_20px_50px_rgba(15,23,42,0.10)] bg-white">
      <div className="flex min-h-[360px] sm:min-h-[480px]">
        <aside className="hidden sm:flex w-[180px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white py-5 px-3">
          <div className="flex items-center gap-2 px-2 mb-6">
            <img src="/logo.png" alt="RaffleBot" className="h-7 w-auto object-contain" />
          </div>
          <div className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-slate-900 mb-1">
            My Raffles
          </div>
          <div className="px-2.5 py-1.5 text-[12px] text-slate-500">Create New Raffle</div>
          <div className="mt-auto px-2.5 py-1.5 text-[12px] text-slate-400">Club Settings</div>
        </aside>

        <div className="flex-1 bg-[#F8FAFC] p-4 sm:p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2366E6] mb-1">Open</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Winter Fundraiser</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Riverside Junior Football</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
            {[
              { label: 'Total tickets', value: '100' },
              { label: 'Sold', value: '64' },
              { label: 'Available', value: '36' },
              { label: 'Raised', value: '$640' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-[12px] border border-[#E2E8F0] px-3 py-3">
                <p className="text-[10px] sm:text-[11px] text-slate-500">{stat.label}</p>
                <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-slate-700">Sales progress</p>
              <p className="text-[12px] text-slate-500">64%</p>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#E8EEF9' }}>
              <div className="h-full rounded-full w-[64%]" style={{ background: BLUE }} />
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden">
            <p className="text-[12px] font-semibold text-slate-900 px-4 pt-3 pb-2">Ticket buyers</p>
            <div className="hidden sm:grid grid-cols-4 text-[10px] uppercase tracking-wide text-slate-400 px-4 pb-2">
              <span>Name</span>
              <span>Email</span>
              <span>Tickets</span>
              <span>Amount</span>
            </div>
            {[
              ['Sam P.', 'sam@email.com', '3', '$30.00'],
              ['Jordan L.', 'jordan@email.com', '5', '$50.00'],
              ['Alex M.', 'alex@email.com', '1', '$10.00'],
            ].map((row) => (
              <div
                key={row[1]}
                className="grid grid-cols-2 sm:grid-cols-4 text-[12px] text-slate-700 px-4 py-2 border-t border-slate-100"
              >
                <span className="font-medium">{row[0]}</span>
                <span className="text-slate-500 truncate">{row[1]}</span>
                <span className="hidden sm:block">{row[2]}</span>
                <span className="hidden sm:block">{row[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'product' },
    { label: 'For Organisations', id: 'community' },
  ];

  const onNav = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <div className="bg-white text-[#111827] min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="RaffleBot" className="h-10 w-auto object-contain" />
          </a>

          <nav className="hidden md:flex items-center gap-8 text-[14px] text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                className="hover:text-slate-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-[14px] font-medium text-[#2366E6] rounded-xl hover:bg-blue-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/onboarding/create-account"
              className="px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl transition-colors"
              style={{ background: BLUE }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = BLUE_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = BLUE;
              }}
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-slate-700"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="block w-5 h-0.5 bg-slate-800 mb-1" />
            <span className="block w-5 h-0.5 bg-slate-800 mb-1" />
            <span className="block w-5 h-0.5 bg-slate-800" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                className="block w-full text-left text-[15px] text-slate-700 py-1"
              >
                {item.label}
              </button>
            ))}
            <Link to="/dashboard" className="block text-[15px] font-medium text-[#2366E6] py-1">
              Log in
            </Link>
            <Link
              to="/onboarding/create-account"
              className="block text-center text-[15px] font-semibold text-white rounded-xl py-2.5"
              style={{ background: BLUE }}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      <section id="top" className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-[2.35rem] sm:text-[3.25rem] lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight text-slate-900">
              Fundraising raffles.
              <br />
              Without the hassle.
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] leading-relaxed text-slate-600 max-w-lg">
              Create, sell and draw your raffle in just a few clicks. RaffleBot handles the tickets,
              payments, notifications and sales tracking — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => scrollToId('video')}
                className="px-6 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-colors"
                style={{ background: BLUE }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BLUE_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BLUE;
                }}
              >
                See How It Works
              </button>
              <Link
                to="/onboarding/create-account"
                className="px-6 py-3.5 rounded-xl text-[15px] font-semibold text-[#2366E6] bg-white border border-[#D6E4FF] hover:bg-[#F5F8FF] text-center transition-colors"
              >
                Start a Raffle
              </Link>
            </div>
            <p className="mt-4 text-[14px] text-slate-500">Free to join. No monthly fees.</p>
          </div>
          <LaptopMock />
        </div>
      </section>

      <section id="video" className="bg-[#2366E6] scroll-mt-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-[2rem] sm:text-[2.6rem] font-extrabold tracking-tight text-white leading-tight">
            From idea to winner in 45 seconds.
          </h2>
          <div className="mt-10 aspect-video w-full rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <div
                  className="ml-1 w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px]"
                  style={{ borderLeftColor: BLUE }}
                />
              </div>
              <p className="text-sm text-white/80">Video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <h2 className="text-[2rem] sm:text-[2.75rem] font-extrabold tracking-tight text-slate-900 text-center">
            Create. Share. Draw.
          </h2>
          <div className="mt-16 grid md:grid-cols-3 gap-12 md:gap-16">
            <div>
              <p className="text-[13px] font-semibold text-[#2366E6] mb-3">1</p>
              <h3 className="text-[22px] font-bold text-slate-900 mb-3">Create it</h3>
              <p className="text-[16px] leading-relaxed text-slate-600">
                Add your prize, ticket price, number of tickets and draw date — or set the raffle to
                run until tickets are sold.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2366E6] mb-3">2</p>
              <h3 className="text-[22px] font-bold text-slate-900 mb-3">Share it</h3>
              <p className="text-[16px] leading-relaxed text-slate-600">
                Share your raffle link on social media, by email or by text.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2366E6] mb-3">3</p>
              <h3 className="text-[22px] font-bold text-slate-900 mb-3">Draw it</h3>
              <p className="text-[16px] leading-relaxed text-slate-600">
                RaffleBot manages the tickets, handles the draw and notifies the winner.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="bg-[#F8FAFC] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-[2rem] sm:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-tight">
              Everything handled
              <br />
              in one place.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
              Tickets, payments, notifications, draws, sharing and sales tracking.
            </p>
          </div>
          <DashboardMock />
        </div>
      </section>

      <section id="community" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div
              className="aspect-[4/3] w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center"
              aria-hidden="true"
            >
              <p className="text-sm text-slate-400">Community photograph coming soon</p>
            </div>
            <div>
              <h2 className="text-[2rem] sm:text-[2.6rem] font-extrabold tracking-tight text-slate-900 leading-tight">
                Less time fundraising.
                <br />
                More time doing what
                <br />
                you&apos;re fundraising for.
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-slate-600">
                No paper raffle books. No chasing money. No spreadsheets.
              </p>
              <Link
                to="/onboarding/create-account"
                className="inline-block mt-8 px-6 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-colors"
                style={{ background: BLUE }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BLUE_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BLUE;
                }}
              >
                Start a Raffle
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2366E6]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 sm:py-36 text-center">
          <h2 className="text-[2.2rem] sm:text-[3rem] font-extrabold tracking-tight text-white">
            Ready when you are.
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] text-white/90">
            Start, run and draw your next raffle with RaffleBot.
          </p>
          <Link
            to="/onboarding/create-account"
            className="inline-block mt-10 px-8 py-3.5 rounded-xl text-[15px] font-semibold bg-white text-[#2366E6] hover:bg-slate-50 transition-colors"
          >
            Start a Raffle
          </Link>
          <p className="mt-5 text-[14px] text-white/80">Free to join. No monthly fees.</p>
          <p className="mt-2 text-[13px] text-white/65">
            A 5.75% platform fee (incl. GST) applies when tickets are sold.
          </p>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-slate-400 mb-4">Legal documents</p>
          <div className="flex flex-wrap gap-4 mb-6">
            {legalLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-sm text-slate-500 hover:text-blue-600">
                {link.label}
              </Link>
            ))}
            <a href="mailto:support@getrafflebot.com" className="text-sm text-blue-600 hover:underline">
              support@getrafflebot.com
            </a>
          </div>
          <p className="text-xs text-slate-400">© 2026 RaffleBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
