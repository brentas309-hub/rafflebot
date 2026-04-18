import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createRaffle, generateTickets } from '../services/raffleService';
import RaffleManagement from './RaffleManagement';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateRaffleModal({ onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalTickets: 100,
    ticketPrice: 10,
    drawMode: 'until_sold' as 'until_sold' | 'scheduled',
    drawDate: '',
    drawTime: '',
    goalAmount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRaffle, setCreatedRaffle] = useState<{ id: string; title: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.drawMode === 'scheduled' && (!formData.drawDate || !formData.drawTime)) {
      setError('Please select a draw date and time for scheduled draws');
      return;
    }

    setLoading(true);

    try {
      let drawTimestamp: string | undefined;
      if (formData.drawMode === 'scheduled' && formData.drawDate && formData.drawTime) {
        drawTimestamp = new Date(`${formData.drawDate}T${formData.drawTime}`).toISOString();
      }

      const goalAmount = formData.goalAmount ? parseFloat(formData.goalAmount) : undefined;

      const raffle = await createRaffle(
        '00000000-0000-0000-0000-000000000001',
        formData.title,
        formData.description,
        formData.totalTickets,
        formData.ticketPrice,
        formData.drawMode,
        drawTimestamp,
        goalAmount
      );

      await generateTickets(raffle.id, formData.totalTickets);

      setCreatedRaffle({ id: raffle.id, title: raffle.title });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create raffle');
    } finally {
      setLoading(false);
    }
  }

  if (createdRaffle) {
    return (
      <RaffleManagement
        raffleId={createdRaffle.id}
        raffleTitle={createdRaffle.title}
        onClose={() => {
          setCreatedRaffle(null);
          onCreated();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Create New Raffle</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Grand Prize Raffle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Raffle description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Total Tickets
              </label>
              <input
                type="number"
                value={formData.totalTickets}
                onChange={(e) => setFormData({ ...formData, totalTickets: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Ticket Price ($)
              </label>
              <input
                type="number"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Draw Mode
            </label>
            <select
              value={formData.drawMode}
              onChange={(e) => setFormData({ ...formData, drawMode: e.target.value as 'until_sold' | 'scheduled' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="until_sold">Until Sold - Draw when all tickets are sold</option>
              <option value="scheduled">Scheduled Draw - Draw at specific date and time</option>
            </select>
          </div>

          {formData.drawMode === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Draw Date
                </label>
                <input
                  type="date"
                  value={formData.drawDate}
                  onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Draw Time
                </label>
                <input
                  type="time"
                  value={formData.drawTime}
                  onChange={(e) => setFormData({ ...formData, drawTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Fundraising Goal ($) <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              value={formData.goalAmount}
              onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              placeholder="e.g., 5000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Raffle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
