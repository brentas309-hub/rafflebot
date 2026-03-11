import React, { useState } from 'react';
import { X, Lock, CheckCircle } from 'lucide-react';
import { executeDrawWinner } from '../services/drawService';

interface DrawSession {
  seedHash: string;
  seed: string;
  timestamp: string;
}

interface Props {
  raffleId: string;
  drawSession: DrawSession;
  onClose: () => void;
  onDrawComplete: () => void;
}

export default function DrawModal({ raffleId, drawSession, onClose, onDrawComplete }: Props) {
  const [step, setStep] = useState<'confirm' | 'executing' | 'complete'>('confirm');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  async function handleConfirmDraw() {
    setError('');
    setStep('executing');

    try {
      const drawResult = await executeDrawWinner(raffleId, drawSession);
      setResult(drawResult.winner);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draw winner');
      setStep('confirm');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Draw Winner</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            disabled={step === 'executing'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'confirm' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Provably Fair Draw</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This draw uses cryptographic seeding for fairness and auditability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Seed Hash
                </p>
                <p className="font-mono text-xs text-slate-600 break-all leading-relaxed">
                  {drawSession.seedHash}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-slate-600 mb-6">
                Once you proceed, the winner will be permanently selected and recorded in the audit log.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDraw}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Draw Winner
                </button>
              </div>
            </>
          )}

          {step === 'executing' && (
            <div className="text-center py-8">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              </div>
              <p className="text-slate-600 font-medium">Drawing winner...</p>
            </div>
          )}

          {step === 'complete' && result && (
            <>
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">Winner Selected!</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 mb-6">
                <p className="text-slate-600 text-sm mb-2">Winning Ticket</p>
                <p className="text-4xl font-bold text-purple-600">#{result.ticket_number}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 uppercase tracking-wider">User ID</p>
                  <p className="font-mono text-sm text-slate-900 break-all">{result.user_id}</p>
                </div>
              </div>

              <button
                onClick={onDrawComplete}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
