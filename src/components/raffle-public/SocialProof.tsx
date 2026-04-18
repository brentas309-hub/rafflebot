import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ActivityItem {
  id: string;
  supporter_name: string;
  message: string;
  created_at: string;
}

interface SocialProofProps {
  raffleId: string;
  supporterCount: number;
}

export default function SocialProof({ raffleId, supporterCount }: SocialProofProps) {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    loadRecentActivity();
    const interval = setInterval(loadRecentActivity, 10000);
    return () => clearInterval(interval);
  }, [raffleId]);

  useEffect(() => {
    if (recentActivity.length > 0) {
      const interval = setInterval(() => {
        const randomActivity = recentActivity[Math.floor(Math.random() * recentActivity.length)];
        setCurrentActivity(randomActivity);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [recentActivity]);

  const loadRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  return (
    <>
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-sm"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">
              Nanna + {supporterCount > 0 ? supporterCount - 1 : 142} others
            </p>
            <p className="text-white/60 text-sm">supporting this team!</p>
          </div>
        </div>
      </div>

      {showNotification && currentActivity && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white rounded-lg shadow-2xl p-4 flex items-center gap-3 border-l-4 border-green-500 max-w-md">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{currentActivity.message}</p>
              <p className="text-slate-500 text-xs">Just now</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
