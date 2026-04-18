import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { Database } from '../lib/supabase';

type Raffle = Database['public']['Tables']['raffles']['Row'];

interface Props {
  raffles: Raffle[];
  loading: boolean;
  onRefresh: () => void;
  onNavigateToRaffle: (raffleId: string) => void;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-orange-100 text-orange-800',
  drawn: 'bg-purple-100 text-purple-800',
};

export default function RaffleList({ raffles, loading, onRefresh, onNavigateToRaffle }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">Loading raffles...</p>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">No raffles yet</p>
        <p className="text-slate-500 text-sm mt-1">Create your first raffle to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Tickets
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {raffles.map(raffle => (
            <tr key={raffle.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{raffle.title}</p>
                <p className="text-sm text-slate-500 mt-1">{raffle.description}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[raffle.status]}`}>
                  {raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-900 font-medium">{raffle.total_tickets}</td>
              <td className="px-6 py-4 text-slate-900 font-medium">${Number(raffle.ticket_price).toFixed(2)}</td>
              <td className="px-6 py-4 text-slate-600 text-sm">
                {new Date(raffle.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onNavigateToRaffle(raffle.id)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
