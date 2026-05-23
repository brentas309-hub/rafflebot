import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Lock, Copy, Check, Send, Users } from 'lucide-react';
import { getRaffleById, getRaffleStats, updateRaffleStatus, getWinner, getDrawAudit } from '../services/raffleService';
import { createDrawSession, executeDrawWinner } from '../services/drawService';
import { supabase } from '../lib/supabase';
import DrawModal from './DrawModal';
import RafflebotLogo from './RafflebotLogo';

interface Props {
  raffleId: string;
  onBack: () => void;
}

export default function RaffleDetail({ raffleId, onBack }: Props) {
  const [raffle, setRaffle] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [drawSession, setDrawSession] = useState<any>(null);
  const [coachName, setCoachName] = useState('');
  const [coachMobile, setCoachMobile] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [prizeDescriptions, setPrizeDescriptions] = useState<{description: string, sponsor: string}[]>([]);
  const [savingPrizes, setSavingPrizes] = useState(false);
  const [prizesSaved, setPrizesSaved] = useState(false);
  const [editingPrizes, setEditingPrizes] = useState(false);
  const [orgStatus, setOrgStatus] = useState<string | null>(null);

  useEffect(() => {
    loadRaffleData();
    const interval = setInterval(() => {
      if (!editingPrizes) loadRaffleData();
    }, 5000);
    return () => clearInterval(interval);
  }, [raffleId, editingPrizes]);

  async function loadRaffleData() {
    try {
      const raffleData = await getRaffleById(raffleId);
      setRaffle(raffleData);
      if (raffleData?.prize_descriptions) {
        setPrizeDescriptions(raffleData.prize_descriptions);
      } else {
        const count = raffleData?.number_of_prizes || 1;
        setPrizeDescriptions(Array.from({ length: count }, () => ({ description: '', sponsor: '' })));
      }

      const statsData = await getRaffleStats(raffleId);
      setStats(statsData);

      const winnerData = await getWinner(raffleId);
      setWinners(winnerData ?? []);
      loadPurchases();
    } catch (error) {
      console.error('Failed to load raffle:', error);
    } finally {
      setLoading(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: orgData } = await supabase
          .from('organisations')
          .select('status')
          .eq('owner_user_id', user.id)
          .maybeSingle();
        setOrgStatus(orgData?.status ?? null);
      }
    }
  }

  async function loadPurchases() {
    const { data } = await supabase
      .from('purchases')
      .select('email, quantity, amount, created_at, buyer_name, buyer_phone')
      .eq('raffle_id', raffleId)
      .order('created_at', { ascending: false });
    setPurchases(data ?? []);
  }

  async function handleStatusChange(newStatus: string) {
    try {
      await updateRaffleStatus(raffleId, newStatus as any);
      await loadRaffleData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function handleDrawClick() {
    const session = await createDrawSession();
    setDrawSession(session);
    setShowDrawModal(true);
  }

  const raffleLink = `${window.location.origin}/raffle/${(raffle as any)?.slug || raffleId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(raffleLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToCoach = async () => {
    if (!coachName || !coachMobile) {
      alert('Please enter coach name and mobile number');
      return;
    }

    setSent(true);
    setTimeout(() => {
      alert(`Raffle link sent to ${coachName} at ${coachMobile}\n\nThey can now share this with team parents to purchase tickets.`);
      setSent(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <p className="text-slate-600">Raffle not found</p>
      </div>
    );
  }

  const soldPercentage = stats ? (stats.sold / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <RafflebotLogo size={96} className="text-blue-600" />
            <span className="text-lg font-bold text-slate-900">Rafflebot</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{raffle.title}</h1>
              <p className="text-slate-600 mt-2">{raffle.description}</p>
            </div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total || 0}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600 text-sm">Sold</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats?.sold || 0}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600 text-sm">Available</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.available || 0}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${stats?.revenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-700 font-medium">Sales Progress</p>
              <p className="text-sm text-slate-600">{soldPercentage.toFixed(1)}%</p>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            {raffle.status === 'draft' && (
              orgStatus === 'approved' ? (
                <button
                  onClick={() => handleStatusChange('open')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Open Raffle
                </button>
              ) : (
                <div className="px-6 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-medium">
                  Your organisation is under review — you cannot open your raffle until approved.
                </div>
              )
            )}
            {raffle.status === 'open' && (
              <button
                onClick={() => handleStatusChange('closed')}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Close Raffle
              </button>
            )}
            {(raffle.status === 'draft' || raffle.status === 'open') && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this raffle? This cannot be undone.')) {
                    handleStatusChange('cancelled');
                  }
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel Raffle
              </button>
            )}
            {raffle.status === 'closed' && stats?.sold > 0 && (
              <button
                onClick={handleDrawClick}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Draw Winner
              </button>
            )}
            {raffle.status === 'closed' && !stats?.sold && (
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                No Tickets Sold
              </button>
            )}
          </div>
        </div>

        {raffle.status === 'open' && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 rounded-full p-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Send Raffle To Team</h3>
              </div>

              <p className="text-slate-600 mb-6">
                Share this raffle with your team manager or coach so they can distribute it to parents.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Coach / Manager Name
                    </label>
                    <input
                      type="text"
                      value={coachName}
                      onChange={(e) => setCoachName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Enter coach or manager name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Coach Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={coachMobile}
                      onChange={(e) => setCoachMobile(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="+64 21 123 4567"
                    />
                  </div>

                  <button
                    onClick={handleSendToCoach}
                    disabled={!coachName || !coachMobile || sent}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    {sent ? 'Link Sent Successfully!' : 'Send Raffle Link'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Public Raffle Link
                    </label>
                    <div className="bg-white border border-slate-300 rounded-lg p-3 mb-3">
                      <p className="text-sm text-slate-600 break-all font-mono">{raffleLink}</p>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied to Clipboard
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-900">How it works:</strong><br />
                      Send this link to your team manager who can share it with parents. Parents can click the link to view the raffle and purchase tickets directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">🏆 Prizes</h2>
          {raffle.status === 'draft' ? (
            <>
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
                ⚠️ Prize descriptions can only be edited before the raffle opens. Please add your prize details now.
              </p>
              <div className="space-y-4">
                {prizeDescriptions.map((prize, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-3">
                      Prize {index + 1}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Prize Description
                        </label>
                        <input
                          type="text"
                          value={prize.description}
                          onChange={(e) => {
                            setEditingPrizes(true);
                            const updated = [...prizeDescriptions];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setPrizeDescriptions(updated);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Meat package"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Sponsor <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={prize.sponsor}
                          onChange={(e) => {
                            setEditingPrizes(true);
                            const updated = [...prizeDescriptions];
                            updated[index] = { ...updated[index], sponsor: e.target.value };
                            setPrizeDescriptions(updated);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. My Local Butcher"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  setSavingPrizes(true);
                  await supabase.from('raffles').update({ prize_descriptions: prizeDescriptions }).eq('id', raffleId);
                  setSavingPrizes(false);
                  setPrizesSaved(true);
                  setEditingPrizes(false);
                  setTimeout(() => setPrizesSaved(false), 2000);
                }}
                disabled={savingPrizes}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {prizesSaved ? '✅ Saved!' : savingPrizes ? 'Saving...' : 'Save Prizes'}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              {prizeDescriptions.map((prize, index) => (
                <div key={index} className="flex items-start gap-4 bg-slate-50 rounded-lg p-4">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider whitespace-nowrap mt-1">
                    Prize {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{prize.description || '-'}</p>
                    {prize.sponsor && (
                      <p className="text-sm text-slate-500">Sponsored by {prize.sponsor}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {winners.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-l-4 border-purple-600">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">🎉 Draw Winners</h2>
            <div className="space-y-4">
              {winners.map((winner) => (
                <div key={winner.id} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-4">
                    Prize {winner.prize_number}
                  </p>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                      <p className="text-lg font-bold text-slate-900">{winner.winner_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-slate-900">{winner.winner_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-slate-900">{winner.winner_phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Drawn</p>
                      <p className="text-slate-900">{new Date(winner.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${winner.winner_email}?subject=Congratulations — You won the ${raffle.title} raffle!&body=Hi ${winner.winner_name || 'there'},%0D%0A%0D%0ACongratulations! You have been selected as the winner of our ${raffle.title} raffle.%0D%0A%0D%0APlease contact us to arrange collection of your prize.%0D%0A%0D%0AKind regards`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    ✉️ Email Winner
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ticket Buyers</h2>
          {purchases.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <p className="text-slate-600">No tickets sold yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Tickets</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{p.buyer_name || '-'}</td>
                      <td className="py-3 px-4 text-slate-900">{p.email}</td>
                      <td className="py-3 px-4 text-slate-900">{p.buyer_phone || '-'}</td>
                      <td className="py-3 px-4 text-slate-900">{p.quantity}</td>
                      <td className="py-3 px-4 text-slate-900">${(p.amount / 100).toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Audit Log</h2>
          <AuditLog raffleId={raffleId} />
        </div>
      </div>

      {showDrawModal && drawSession && (
        <DrawModal
          raffleId={raffleId}
          drawSession={drawSession}
          onClose={() => setShowDrawModal(false)}
          onDrawComplete={() => {
            setShowDrawModal(false);
            loadRaffleData();
          }}
        />
      )}
    </div>
  );
}

function AuditLog({ raffleId }: { raffleId: string }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLog();
  }, [raffleId]);

  async function loadAuditLog() {
    try {
      const data = await getDrawAudit(raffleId);
      setAudits(data);
    } catch (error) {
      console.error('Failed to load audit log:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading...</p>;
  }

  if (audits.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600">No draw history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {audits.map((audit: any) => (
        <div key={audit.id} className="border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            {new Date(audit.timestamp).toLocaleString()}
          </p>
          <p className="font-mono text-xs text-slate-500 mt-2 break-all">
            Hash: {audit.seed_hash.substring(0, 32)}...
          </p>
        </div>
      ))}
    </div>
  );
}
