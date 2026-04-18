import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Star, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  team_name: string;
  total_raised_cents: number;
  ticket_count: number;
  rank: number;
}

interface TopSupporter {
  supporter_name: string;
  total_tickets: number;
  total_spent_cents: number;
}

interface LeaderboardProps {
  clubId: string;
  raffleId?: string;
}

export default function Leaderboard({ clubId, raffleId }: LeaderboardProps) {
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopSupporter[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'supporters'>('teams');

  useEffect(() => {
    loadLeaderboard();
  }, [clubId, raffleId]);

  const loadLeaderboard = async () => {
    try {
      const { data: teamsData } = await supabase
        .rpc('get_club_leaderboard', { p_club_id: clubId });

      if (teamsData) {
        setTeamLeaderboard(teamsData);
      }

      if (raffleId) {
        const { data: supportersData } = await supabase
          .rpc('get_top_supporters', { p_raffle_id: raffleId });

        if (supportersData) {
          setTopSupporters(supportersData);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400" />;
    return <Star className="w-6 h-6 text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Leaderboard</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'teams'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Teams
        </button>
        {raffleId && (
          <button
            onClick={() => setActiveTab('supporters')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'supporters'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Top Supporters
          </button>
        )}
      </div>

      {activeTab === 'teams' && (
        <div className="space-y-3">
          {teamLeaderboard.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No teams yet</p>
          ) : (
            teamLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-center w-12">
                  {getMedalIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{entry.team_name}</h3>
                  <p className="text-slate-600 text-sm">{entry.ticket_count} tickets sold</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">
                    ${(entry.total_raised_cents / 100).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">raised</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'supporters' && raffleId && (
        <div className="space-y-3">
          {topSupporters.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No supporters yet</p>
          ) : (
            topSupporters.map((supporter, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{supporter.supporter_name}</h3>
                  <p className="text-slate-600 text-sm">{supporter.total_tickets} tickets purchased</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    ${(supporter.total_spent_cents / 100).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">contributed</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">This Week's Champion</h3>
          </div>
          {teamLeaderboard.length > 0 ? (
            <p className="text-slate-700">
              <strong className="text-purple-600">{teamLeaderboard[0].team_name}</strong> is leading with{' '}
              ${(teamLeaderboard[0].total_raised_cents / 100).toLocaleString()} raised!
            </p>
          ) : (
            <p className="text-slate-700">Be the first team on the leaderboard!</p>
          )}
        </div>
      </div>
    </div>
  );
}
