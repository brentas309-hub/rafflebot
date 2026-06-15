import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  Plus,
  Settings,
  Ticket,
  LifeBuoy,
  ShieldCheck,
  Megaphone,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRaffles } from '../services/raffleService';
import type { Database } from '../lib/supabase';
import Auth from './Auth';
import RaffleList from './RaffleList';
import RaffleDetail from './RaffleDetail';
import CreateRaffleModal from './CreateRaffleModal';

type Raffle = Database['public']['Tables']['raffles']['Row'];

const SIDEBAR_WIDTH = 220;

export default function RaffleDashboard() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loadingRaffles, setLoadingRaffles] = useState(false);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [orgStatus, setOrgStatus] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (userId) {
      refreshRaffles();
      supabase
        .from('organisations')
        .select('status, organisation_name')
        .eq('owner_user_id', userId)
        .maybeSingle()
        .then(({ data }) => {
          setOrgStatus(data?.status ?? null);
          setOrgName(data?.organisation_name ?? null);
        });
    } else {
      setRaffles([]);
    }
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

  const navMain = [
    {
      label: 'My Raffles',
      icon: <Ticket className="w-4 h-4" />,
      onClick: () => { setSelectedRaffleId(null); setMobileMenuOpen(false); },
      active: true,
    },
    {
      label: 'Create New Raffle',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => { setShowCreate(true); setMobileMenuOpen(false); },
      active: false,
    },
  ];

  const navComingSoon = [
    { label: 'Instant Cash Raffles', icon: <Zap className="w-4 h-4" /> },
    { label: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
  ];

  const navBottom = [
    {
      label: 'Club Settings',
      icon: <Settings className="w-4 h-4" />,
      href: '/club/settings',
    },
    {
      label: 'Trust & Safety',
      icon: <ShieldCheck className="w-4 h-4" />,
      href: '/trust-safety',
    },
    {
      label: 'Support & Help',
      icon: <LifeBuoy className="w-4 h-4" />,
      href: '/support',
    },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: mobile ? '24px 16px 16px' : '24px 12px 16px',
      }}
    >
      <div style={{ marginBottom: 28, paddingLeft: 8 }}>
        <Link
          to="/"
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: '#0f172a',
            textDecoration: 'none',
            display: 'block',
          }}
        >
          RaffleBot
        </Link>
        {orgName && (
          <span
            style={{
              display: 'block',
              fontSize: 12,
              color: '#64748b',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: SIDEBAR_WIDTH - 40,
            }}
          >
            {orgName}
          </span>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        {navMain.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              width: '100%',
              padding: '7px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: item.active ? 500 : 400,
              background: item.active ? '#f1f5f9' : 'transparent',
              color: item.active ? '#0f172a' : '#475569',
              marginBottom: 2,
              textAlign: 'left',
            }}
          >
            <span style={{ color: item.active ? '#3b82f6' : '#94a3b8' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 4 }}>
          {navComingSoon.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                fontSize: 13.5,
                color: '#cbd5e1',
                marginBottom: 2,
                cursor: 'default',
              }}
            >
              <span style={{ color: '#e2e8f0' }}>{item.icon}</span>
              {item.label}
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 500,
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  padding: '2px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                Soon
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '0.5px solid #e2e8f0', margin: '12px 0' }} />

        {navBottom.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 10px',
              borderRadius: 6,
              fontSize: 13.5,
              color: '#475569',
              textDecoration: 'none',
              marginBottom: 2,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = '#f8fafc')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = 'transparent')
            }
          >
            <span style={{ color: '#94a3b8' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          width: '100%',
          padding: '7px 10px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontSize: 13.5,
          color: '#94a3b8',
          background: 'transparent',
          textAlign: 'left',
          marginTop: 8,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = '#f8fafc')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = 'transparent')
        }
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      <aside
        className="hidden md:flex"
        style={{
          width: SIDEBAR_WIDTH,
          minHeight: '100vh',
          background: '#ffffff',
          borderRight: '0.5px solid #e2e8f0',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        <SidebarContent />
      </aside>

      <header
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '0.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
            RaffleBot
          </span>
          {orgName && (
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              {orgName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 49,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#ffffff',
            zIndex: 45,
            borderTop: '0.5px solid #e2e8f0',
          }}
        >
          <SidebarContent mobile />
        </div>
      )}

      <div
        style={{ flex: 1 }}
        className="md:ml-[220px]"
      >
        {(orgStatus === 'pending_review' || orgStatus === 'manual_review') && (
          <div
            style={{
              background: '#FAEEDA',
              borderBottom: '0.5px solid #FAC775',
              padding: '10px 20px',
              textAlign: 'center',
              fontSize: 13,
              color: '#633806',
            }}
            className="mt-[49px] md:mt-0"
          >
            Your organisation is currently under review. You can continue setting up
            your raffle while we verify your details.
          </div>
        )}

        <main
          className="mt-[49px] md:mt-0"
          style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}
        >
          <RaffleList
            raffles={raffles}
            loading={loadingRaffles}
            onRefresh={refreshRaffles}
            onNavigateToRaffle={setSelectedRaffleId}
          />
        </main>
      </div>

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
