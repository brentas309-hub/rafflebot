import React, { useState } from 'react';
import { Copy, Check, Send, Users } from 'lucide-react';

interface Props {
  raffleId: string;
  raffleTitle: string;
  onClose: () => void;
}

export default function RaffleManagement({ raffleId, raffleTitle, onClose }: Props) {
  const [coachName, setCoachName] = useState('');
  const [coachMobile, setCoachMobile] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

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
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Raffle Created Successfully!</h2>
          <p className="text-slate-600 mt-1">{raffleTitle}</p>
        </div>

        <div className="p-6 space-y-6">
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
                className="w-full px-4 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <Send className="w-6 h-6" />
                {sent ? 'Link Sent Successfully!' : 'Send Raffle Link'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Or Copy Link Manually</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Public Raffle Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={raffleLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
