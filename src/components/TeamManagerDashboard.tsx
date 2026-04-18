import React, { useState, useEffect } from 'react';
import { Users, Send, TrendingUp, Share2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Team {
  id: string;
  name: string;
  manager_name: string;
  manager_phone: string;
}

interface Raffle {
  id: string;
  title: string;
  slug: string;
  status: string;
  total_raised: number;
  tickets_sold: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function TeamManagerDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('manager_email', user.email)
        .maybeSingle();

      if (teamData) {
        setTeam(teamData);
        loadRaffles(teamData.id);
        loadContacts(teamData.id);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  const loadRaffles = async (teamId: string) => {
    try {
      const { data } = await supabase
        .from('raffles')
        .select(`
          id,
          title,
          slug,
          status,
          raffle_purchases(ticket_quantity, total_amount_cents)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (data) {
        const rafflesWithStats = data.map((raffle: any) => ({
          id: raffle.id,
          title: raffle.title,
          slug: raffle.slug,
          status: raffle.status,
          total_raised: raffle.raffle_purchases.reduce((sum: number, p: any) => sum + p.total_amount_cents, 0) / 100,
          tickets_sold: raffle.raffle_purchases.reduce((sum: number, p: any) => sum + p.ticket_quantity, 0)
        }));
        setRaffles(rafflesWithStats);
      }
    } catch (error) {
      console.error('Error loading raffles:', error);
    }
  };

  const loadContacts = async (teamId: string) => {
    try {
      const { data } = await supabase
        .from('parent_contacts')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('parent_contacts')
        .insert({
          team_id: team.id,
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email,
          added_by: user?.id
        });

      if (error) throw error;

      setNewContact({ name: '', phone: '', email: '' });
      setShowAddContact(false);
      loadContacts(team.id);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const shareRaffleWithContacts = async (raffle: Raffle) => {
    if (!team) return;

    const message = `${team.name} has launched a new fundraiser!\n\nSupport our team here:\n${window.location.origin}/r/${raffle.slug}`;

    if (contacts.length > 0) {
      const phoneNumbers = contacts.filter(c => c.phone).map(c => c.phone).join(',');
      window.location.href = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
    }
  };

  const copyRaffleLink = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Team Manager Access Required</h2>
            <p className="text-slate-600">
              You need to be assigned as a team manager to access this dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{team.name}</h1>
          <p className="text-slate-600">Team Manager Dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Active Raffles</h2>
            </div>
            <div className="space-y-3">
              {raffles.length === 0 ? (
                <p className="text-slate-500">No active raffles</p>
              ) : (
                raffles.map((raffle) => (
                  <div key={raffle.id} className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{raffle.title}</h3>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-600">${raffle.total_raised.toLocaleString()} raised</span>
                      <span className="text-slate-600">{raffle.tickets_sold} tickets sold</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => shareRaffleWithContacts(raffle)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send to Parents
                      </button>
                      <button
                        onClick={() => copyRaffleLink(raffle.slug)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <h2 className="text-xl font-bold text-slate-900">Parent Contacts</h2>
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-slate-500">No contacts added yet</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="bg-slate-50 rounded-lg p-3">
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    {contact.phone && <p className="text-sm text-slate-600">{contact.phone}</p>}
                    {contact.email && <p className="text-sm text-slate-600">{contact.email}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
          <p className="text-white/90">
            Add parent contacts now so you can instantly share future raffles with your entire team. The more people who see the raffle, the more funds you'll raise!
          </p>
        </div>

        {showAddContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Add Parent Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Add Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
