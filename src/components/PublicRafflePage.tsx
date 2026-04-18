import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heart, Clock, Users, Ticket, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SocialProof from './raffle-public/SocialProof';
import TicketSelector from './raffle-public/TicketSelector';
import SuccessModal from './raffle-public/SuccessModal';

interface RaffleData {
  id: string;
  title: string;
  description: string;
  prize_description: string | null;
  ticket_price: number;
  total_tickets: number;
  draw_timestamp: string | null;
  draw_mode: 'until_sold' | 'scheduled';
  fundraising_goal: number;
  processing_fee_mode: 'buyer_pays' | 'club_absorbs';
  slug: string | null;
  club: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  team: {
    id: string;
    name: string;
  } | null;
}

interface RaffleStats {
  total_raised_cents: number;
  tickets_sold: number;
  tickets_remaining: number;
  supporter_count: number;
  days_remaining: number;
}

export default function PublicRafflePage() {
  const { raffleSlug, raffleId } = useParams();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [raffle, setRaffle] = useState<RaffleData | null>(null);
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    loadRaffleData();

    if (referralCode) {
      trackReferralClick();
    }
  }, [raffleSlug, raffleId, referralCode]);

  const loadRaffleData = async () => {
    try {
      console.log('Loading raffle data...', { raffleSlug, raffleId });

      let query = supabase
        .from('raffles')
        .select(`
          id,
          title,
          description,
          prize_description,
          ticket_price,
          total_tickets,
          draw_timestamp,
          draw_mode,
          fundraising_goal,
          processing_fee_mode,
          slug,
          club:clubs(id, name, logo_url),
          team:teams(id, name)
        `)
        .eq('status', 'open');

      if (raffleSlug) {
        query = query.eq('slug', raffleSlug);
      } else if (raffleId) {
        query = query.eq('id', raffleId);
      }

      const { data: raffleData, error: raffleError } = await query.maybeSingle();

      console.log('Raffle query result:', { raffleData, raffleError });

      if (raffleError) throw raffleError;
      if (!raffleData) {
        console.log('No raffle data found');
        setLoading(false);
        return;
      }

      setRaffle(raffleData as unknown as RaffleData);

      console.log('Fetching raffle stats for:', raffleData.id);
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_raffle_stats', { p_raffle_id: raffleData.id });

      console.log('Stats query result:', { statsData, statsError });

      if (statsError) {
        console.error('Stats error:', statsError);
      }

      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      } else {
        const daysRemaining = raffleData.draw_timestamp
          ? Math.max(0, Math.ceil((new Date(raffleData.draw_timestamp).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 30;

        setStats({
          total_raised_cents: 0,
          tickets_sold: 0,
          tickets_remaining: raffleData.total_tickets,
          supporter_count: 0,
          days_remaining: daysRemaining
        });
      }
    } catch (error) {
      console.error('Error loading raffle:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackReferralClick = async () => {
    if (!referralCode) return;

    try {
      await supabase
        .from('referral_links')
        .update({ clicks: supabase.rpc('increment', { x: 1 }) })
        .eq('referral_code', referralCode);
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  };

  const handlePurchaseSuccess = (purchaseId: string) => {
    setPurchaseId(purchaseId);
    setShowSuccess(true);
    loadRaffleData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Raffle Not Found</h1>
          <p className="text-xl text-white/80 mb-4">This raffle may have ended or is no longer available.</p>
          <p className="text-sm text-white/60">Check the URL or contact the organizer for more information.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading raffle details...</div>
      </div>
    );
  }

  const totalRaised = stats.tickets_sold * raffle.ticket_price;
  const goalAmount = raffle.ticket_price * raffle.total_tickets;
  const progressPercent = goalAmount > 0 ? Math.min((totalRaised / goalAmount) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {raffle.club.logo_url ? (
              <img
                src={raffle.club.logo_url}
                alt={raffle.club.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-lg flex-shrink-0"
              />
            ) : null}
            <div>
              <h2 className="text-white font-bold text-xl uppercase tracking-wide">{raffle.club.name}</h2>
              {raffle.team && (
                <p className="text-yellow-400 text-base font-semibold">{raffle.team.name}</p>
              )}
            </div>
          </div>
          <button className="text-white hover:text-yellow-400 transition-colors">
            <Heart className="w-8 h-8" />
          </button>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 mb-6 border-2 border-yellow-400/40 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">{raffle.title}</h1>
          <p className="text-yellow-400 text-xl font-bold mb-5 uppercase tracking-wider">Fundraiser</p>
          {raffle.description && (
            <p className="text-white/90 text-lg mb-8 leading-relaxed">{raffle.description}</p>
          )}

          <div className="bg-white/10 rounded-xl p-5 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-white text-4xl font-bold">${totalRaised.toLocaleString()}</span>
                <span className="text-white/70 text-lg ml-2">raised of ${goalAmount.toLocaleString()} goal</span>
              </div>
              <span className="text-white/70 text-lg">{Math.round(progressPercent)}% complete</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              {raffle.draw_mode === 'scheduled' ? (
                <>
                  <div className="text-2xl font-bold text-white">{stats.days_remaining}</div>
                  <div className="text-white/70 text-sm">days to go</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-white">Until Sold</div>
                  <div className="text-white/70 text-sm">Draw when sold out</div>
                </>
              )}
            </div>
            <div>
              <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.tickets_sold}</div>
              <div className="text-white/70 text-sm">tickets sold</div>
            </div>
            <div>
              <Ticket className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.tickets_remaining}</div>
              <div className="text-white/70 text-sm">tickets left</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 mb-8 border-4 border-yellow-400 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

          <div className="absolute -right-24 -top-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-400/30 px-6 py-3 rounded-full mb-4 shadow-lg">
                <span className="text-yellow-400 text-base font-black uppercase tracking-widest">★ Grand Prize ★</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-7xl font-black text-white mb-4 drop-shadow-lg">${raffle.ticket_price * raffle.total_tickets}</div>
              <div className="text-3xl font-black text-yellow-400 uppercase tracking-wider">
                {raffle.prize_description || 'Amazing Prize'}
              </div>
            </div>

            <div className={`grid ${raffle.draw_timestamp ? 'grid-cols-3' : 'grid-cols-2'} gap-3 text-center`}>
              {raffle.draw_timestamp && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/70 text-xs mb-1">Draw Date</div>
                  <div className="text-white font-semibold text-sm">
                    {new Date(raffle.draw_timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/70 text-xs mb-1">Winners</div>
                <div className="text-white font-semibold text-sm">1 Winner</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/70 text-xs mb-1">Security</div>
                <div className="text-white font-semibold text-sm">100% Online</div>
              </div>
            </div>
          </div>
        </div>

        <TicketSelector
          raffle={raffle}
          stats={stats}
          selectedQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          referralCode={referralCode}
          onPurchaseSuccess={handlePurchaseSuccess}
        />

        <div className="bg-slate-800/30 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center gap-2 text-white/60 text-sm justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure checkout</span>
            <span>•</span>
            <span>Instant tickets</span>
            <span>•</span>
            <span>Thank you!</span>
          </div>
        </div>

        <SocialProof raffleId={raffle.id} supporterCount={stats.supporter_count} />

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-white/50 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Powered by Rafflebot</span>
          </div>
        </div>
      </div>

      {showSuccess && purchaseId && (
        <SuccessModal
          raffle={raffle}
          purchaseId={purchaseId}
          quantity={selectedQuantity}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
