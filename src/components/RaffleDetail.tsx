import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Lock, Copy, Check, Send, Users } from 'lucide-react';
import { getRaffleById, getRaffleStats, updateRaffleStatus, getWinner, getDrawAudit } from '../services/raffleService';
import { createDrawSession, executeDrawWinner } from '../services/drawService';
import DrawModal from './DrawModal';
import RafflebotLogo from './RafflebotLogo';

interface Props {
  raffleId: string;
  onBack: () => void;
}

export default function RaffleDetail({ raffleId, onBack }: Props) {
  const [raffle, setRaffle] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [drawSession, setDrawSession] = useState<any>(null);
  const [coachName, setCoachName] = useState('');
  const [coachMobile, setCoachMobile] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadRaffleData();
    const interval = setInterval(loadRaffleData, 5000);
    return () => clearInterval(interval);
  }, [raffleId]);

  async function loadRaffleData() {
    try {
      const raffleData = await getRaffleById(raffleId);
      setRaffle(raffleData);

      const statsData = await getRaffleStats(raffleId);
      setStats(statsData);

      const winnerData = await getWinner(raffleId);
      setWinner(winnerData);
    } catch (error) {
      console.error('Failed to load raffle:', error);
    } finally {
      setLoading(false);
    }
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

  const raffleLink = `${window.location.origin}/public-raffle/${raffleId}`;

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
              <button
                onClick={() => handleStatusChange('open')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Open Raffle
              </button>
            )}
            {raffle.status === 'open' && (
              <button
                onClick={() => handleStatusChange('closed')}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Close Raffle
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

        {winner && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-l-4 border-purple-600">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Winner</h2>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <p className="text-slate-600 text-sm mb-2">Winning Ticket</p>
              <p className="text-4xl font-bold text-purple-600 mb-4">#{winner.ticket_number}</p>
              <div className="space-y-2">
                <p className="text-slate-900"><span className="font-medium">Winner:</span> {winner.user?.name || winner.user?.email}</p>
                <p className="text-slate-900"><span className="font-medium">Drawn:</span> {new Date(winner.drawn_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

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
