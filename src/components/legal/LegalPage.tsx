import { Link } from 'react-router-dom';

const legalLinks = [
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Organizer Terms', path: '/organizer-terms' },
  { label: 'Participant Terms', path: '/participant-terms' },
  { label: 'Trust & Safety', path: '/trust-safety' },
];

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-slate-900 hover:text-blue-600">
          RaffleBot
        </Link>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: 4 June 2026</p>

        <div className="bg-blue-50 border-l-2 border-blue-400 px-4 py-3 rounded-r-lg mb-10">
          <p className="text-sm text-blue-700 leading-relaxed">
            RaffleBot is a software platform only. We are not the organizer, sponsor, or operator of any raffle conducted through the platform.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-8 mt-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-slate-400 mb-4">Legal documents</p>
          <div className="flex flex-wrap gap-4 mb-6">
            {legalLinks.map(link => (
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
