import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Plus, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRaffles } from '../services/raffleService';
import type { Database } from '../lib/supabase';
import Auth from './Auth';
import RaffleList from './RaffleList';
import RaffleDetail from './RaffleDetail';
import CreateRaffleModal from './CreateRaffleModal';

type Raffle = Database['public']['Tables']['raffles']['Row'];

export default function RaffleDashboard() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loadingRaffles, setLoadingRaffles] = useState(false);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const refreshRaffles = useCallback(async () => {
    if (!userId) return;
    setLoadingRaffles(true);
    try {
      const data = await getRaffles();
      setRaffles(data ?? []);
    } catch (e) {
      console.error(e);
      setRaffles([]);
    } finally {
      setLoadingRaffles(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.session?.user.id ?? null);
      setSessionReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId) refreshRaffles();
    else setRaffles([]);
  }, [userId, refreshRaffles]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedRaffleId(null);
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    );
  }

  if (!userId) {
    return (
      <Auth
        onAuth={() => {
          void supabase.auth.getSession().then(({ data }) => {
            setUserId(data.session?.user.id ?? null);
          });
        }}
      />
    );
  }

  if (selectedRaffleId) {
    return (
      <RaffleDetail
        raffleId={selectedRaffleId}
        onBack={() => setSelectedRaffleId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-slate-900 hover:text-blue-600">
            RaffleBot
          </Link>
          <span className="text-slate-500 text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/club/settings"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            Club settings
          </Link>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New raffle
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <RaffleList
          raffles={raffles}
          loading={loadingRaffles}
          onRefresh={refreshRaffles}
          onNavigateToRaffle={setSelectedRaffleId}
        />
      </main>

      {showCreate && (
        <CreateRaffleModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refreshRaffles();
          }}
        />
      )}
    </div>
  );
}
