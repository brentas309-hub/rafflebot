import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getCurrentUser } from './lib/auth';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import RaffleDetail from './components/RaffleDetail';

type Page = 'landing' | 'auth' | 'dashboard' | 'raffle-detail';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedRaffleId, setSelectedRaffleId] = useState('');

  useEffect(() => {
    checkAuth();
    const { data } = supabase.auth.onAuthStateChange(() => {
      (async () => {
        await checkAuth();
      })();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser && currentUser.role === 'admin') {
        setCurrentPage('dashboard');
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function handleGetStarted() {
    setCurrentPage('auth');
  }

  function handleAuthSuccess() {
    checkAuth();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (currentPage === 'landing' && !user) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentPage === 'auth' || (!user && currentPage !== 'landing')) {
    return <Auth onAuth={handleAuthSuccess} />;
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access Denied</p>
          <p className="text-gray-500 text-sm">You need admin privileges to access this platform.</p>
          <button
            onClick={() => {
              supabase.auth.signOut();
              setUser(null);
              setCurrentPage('landing');
            }}
            className="mt-4 text-blue-600 hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  function handleNavigateToRaffle(raffleId: string) {
    setSelectedRaffleId(raffleId);
    setCurrentPage('raffle-detail');
  }

  if (currentPage === 'raffle-detail') {
    return (
      <RaffleDetail
        raffleId={selectedRaffleId}
        onBack={() => setCurrentPage('dashboard')}
      />
    );
  }

  return (
    <div>
      <Dashboard onNavigateToRaffle={handleNavigateToRaffle} />
    </div>
  );
}

export default App;
