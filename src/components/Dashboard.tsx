import React, { useState, useEffect } from 'react';
import { BarChart3, Ticket, Trophy, LogOut } from 'lucide-react';
import { signOut } from '../lib/auth';
import { getRaffles } from '../services/raffleService';
import RaffleList from './RaffleList';
import CreateRaffleModal from './CreateRaffleModal';
import RafflebotLogo from './RafflebotLogo';

interface Props {
  onNavigateToRaffle: (raffleId: string) => void;
}

export default function Dashboard({ onNavigateToRaffle }: Props) {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRaffles();
  }, []);

  async function loadRaffles() {
    try {
      setLoading(true);
      const data = await getRaffles();
      setRaffles(data);
    } catch (error) {
      console.error('Failed to load raffles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  function handleRaffleCreated() {
    setShowCreateModal(false);
    loadRaffles();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RafflebotLogo size={120} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rafflebot</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-600 mt-2">Manage your raffles and track winners</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            New Raffle
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Raffles</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{raffles.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {raffles.filter(r => r.status === 'open').length}
                </p>
              </div>
              <Ticket className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Drawn</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {raffles.filter(r => r.status === 'drawn').length}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        <RaffleList
          raffles={raffles}
          loading={loading}
          onRefresh={loadRaffles}
          onNavigateToRaffle={onNavigateToRaffle}
        />
      </div>

      {showCreateModal && (
        <CreateRaffleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRaffleCreated}
        />
      )}
    </div>
  );
}
