import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { updateRaffleStatus } from '../services/raffleService';
import RafflebotLogo from '../components/RafflebotLogo';

type Organisation = {
  id: string;
  organisation_name: string | null;
  organisation_type: string | null;
  region: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  registration_type: string | null;
  registration_number: string | null;
  stripe_account_id: string | null;
  created_at: string;
  status: string | null;
  rejection_reason: string | null;
  is_suspended: boolean | null;
};

type Raffle = {
  id: string;
  title: string | null;
  ticket_price: number | null;
  total_tickets: number | null;
  tickets_remaining: number | null;
  status: string | null;
  created_at: string;
  owner_user_id: string | null;
  slug: string | null;
};

type OrgLookup = {
  id: string;
  organisation_name: string | null;
  owner_user_id: string | null;
  is_suspended: boolean | null;
};

type Tab = 'pending' | 'organisations' | 'raffles';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';
type RaffleStatusFilter = 'all' | 'draft' | 'open' | 'paused' | 'closed' | 'drawn';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeClass(status: string | null) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function raffleStatusBadgeClass(status: string | null) {
  switch (status) {
    case 'draft':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'open':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'paused':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'closed':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'drawn':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<Organisation[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organisation[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [orgsLoaded, setOrgsLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [allRaffles, setAllRaffles] = useState<Raffle[]>([]);
  const [orgLookup, setOrgLookup] = useState<Record<string, OrgLookup>>({});
  const [loadingRaffles, setLoadingRaffles] = useState(false);
  const [rafflesLoaded, setRafflesLoaded] = useState(false);
  const [raffleStatusFilter, setRaffleStatusFilter] = useState<RaffleStatusFilter>('all');
  const [confirmingPause, setConfirmingPause] = useState<string | null>(null);
  const [confirmingUnpause, setConfirmingUnpause] = useState<string | null>(null);
  const [confirmingSuspend, setConfirmingSuspend] = useState<string | null>(null);
  const [confirmingUnsuspend, setConfirmingUnsuspend] = useState<string | null>(null);

  useEffect(() => {
    async function loadPending() {
      setLoadingPending(true);
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setPending([]);
      } else {
        setPending((data as Organisation[]) ?? []);
      }
      setLoadingPending(false);
    }
    loadPending();
  }, []);

  useEffect(() => {
    if (tab !== 'organisations' || orgsLoaded) return;

    async function loadOrgs() {
      setLoadingOrgs(true);
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setAllOrgs([]);
      } else {
        setAllOrgs((data as Organisation[]) ?? []);
      }
      setOrgsLoaded(true);
      setLoadingOrgs(false);
    }
    loadOrgs();
  }, [tab, orgsLoaded]);

  useEffect(() => {
    if (tab !== 'raffles' || rafflesLoaded) return;

    async function loadRaffles() {
      setLoadingRaffles(true);
      const [rafflesRes, orgsRes] = await Promise.all([
        supabase
          .from('raffles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('organisations')
          .select('id, organisation_name, owner_user_id, is_suspended'),
      ]);

      if (rafflesRes.error) {
        console.error(rafflesRes.error);
        setAllRaffles([]);
      } else {
        setAllRaffles((rafflesRes.data as Raffle[]) ?? []);
      }

      if (orgsRes.error) {
        console.error(orgsRes.error);
      } else {
        const lookup: Record<string, OrgLookup> = {};
        for (const org of orgsRes.data ?? []) {
          if (org.owner_user_id) lookup[org.owner_user_id] = org as OrgLookup;
        }
        setOrgLookup(lookup);
      }

      setRafflesLoaded(true);
      setLoadingRaffles(false);
    }
    loadRaffles();
  }, [tab, rafflesLoaded]);

  function getClubName(raffle: Raffle): string {
    if (!raffle.owner_user_id) return '—';
    return orgLookup[raffle.owner_user_id]?.organisation_name || '—';
  }

  function getSold(raffle: Raffle): string {
    if (raffle.total_tickets == null) return '—';
    if (raffle.tickets_remaining == null) return '—';
    return String(raffle.total_tickets - raffle.tickets_remaining);
  }

  async function handlePause(raffle: Raffle) {
    setActionLoading(raffle.id);
    try {
      await updateRaffleStatus(raffle.id, 'paused');
      setAllRaffles((prev) =>
        prev.map((r) => (r.id === raffle.id ? { ...r, status: 'paused' } : r)),
      );
      console.log('TODO: send raffle-paused email');
    } catch (err: any) {
      alert(`Failed to pause raffle: ${err.message || err}`);
    }
    setConfirmingPause(null);
    setActionLoading(null);
  }

  async function handleUnpause(raffle: Raffle) {
    setActionLoading(raffle.id);
    try {
      await updateRaffleStatus(raffle.id, 'open');
      setAllRaffles((prev) =>
        prev.map((r) => (r.id === raffle.id ? { ...r, status: 'open' } : r)),
      );
      console.log('TODO: send raffle-unpaused email');
    } catch (err: any) {
      alert(`Failed to unpause raffle: ${err.message || err}`);
    }
    setConfirmingUnpause(null);
    setActionLoading(null);
  }

  async function handleSuspend(org: Organisation) {
    setActionLoading(org.id);
    const { error } = await supabase
      .from('organisations')
      .update({ is_suspended: true })
      .eq('id', org.id);

    if (error) {
      alert(`Failed to suspend organisation: ${error.message}`);
    } else {
      setAllOrgs((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, is_suspended: true } : o)),
      );
      console.log('TODO: send org-suspended email');
    }
    setConfirmingSuspend(null);
    setActionLoading(null);
  }

  async function handleUnsuspend(org: Organisation) {
    setActionLoading(org.id);
    const { error } = await supabase
      .from('organisations')
      .update({ is_suspended: false })
      .eq('id', org.id);

    if (error) {
      alert(`Failed to unsuspend organisation: ${error.message}`);
    } else {
      setAllOrgs((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, is_suspended: false } : o)),
      );
      console.log('TODO: send org-unsuspended email');
    }
    setConfirmingUnsuspend(null);
    setActionLoading(null);
  }

  async function handleApprove(org: Organisation) {
    setActionLoading(org.id);
    setPending((prev) => prev.filter((o) => o.id !== org.id));
    setAllOrgs((prev) =>
      prev.map((o) =>
        o.id === org.id ? { ...o, status: 'approved', rejection_reason: null } : o,
      ),
    );

    const { error } = await supabase
      .from('organisations')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', org.id);

    if (error) {
      console.error(error);
      setPending((prev) => [...prev, org].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ));
      setAllOrgs((prev) =>
        prev.map((o) => (o.id === org.id ? org : o)),
      );
    } else {
      console.log('TODO: send club approved email');
    }
    setActionLoading(null);
  }

  async function handleRejectConfirm(org: Organisation) {
    const reason = rejectionReason.trim();
    if (!reason) return;

    setActionLoading(org.id);
    setPending((prev) => prev.filter((o) => o.id !== org.id));
    setAllOrgs((prev) =>
      prev.map((o) =>
        o.id === org.id ? { ...o, status: 'rejected', rejection_reason: reason } : o,
      ),
    );
    setRejectingId(null);
    setRejectionReason('');

    const { error } = await supabase
      .from('organisations')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', org.id);

    if (error) {
      console.error(error);
      setPending((prev) => [...prev, org].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ));
      setAllOrgs((prev) =>
        prev.map((o) => (o.id === org.id ? org : o)),
      );
    } else {
      console.log('TODO: send club rejected email', reason);
    }
    setActionLoading(null);
  }

  const filteredOrgs =
    statusFilter === 'all'
      ? allOrgs
      : statusFilter === 'suspended'
        ? allOrgs.filter((o) => o.is_suspended === true)
        : allOrgs.filter((o) => o.status === statusFilter);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'suspended', label: 'Suspended' },
  ];

  const raffleFilters: { key: RaffleStatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'open', label: 'Open' },
    { key: 'paused', label: 'Paused' },
    { key: 'closed', label: 'Closed' },
    { key: 'drawn', label: 'Drawn' },
  ];

  const filteredRaffles =
    raffleStatusFilter === 'all'
      ? allRaffles
      : allRaffles.filter((r) => r.status === raffleStatusFilter);

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <nav className="w-full bg-white border-b border-[#E6ECF5] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RafflebotLogo
            size={120}
            className="h-10 w-auto max-w-none shrink-0 object-contain overflow-visible"
          />
          <span className="text-[#111827] font-bold text-[15px] whitespace-nowrap">
            Master Admin
          </span>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
          className="text-slate-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          Log out
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-1 border-b border-[#E6ECF5] mb-6">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'pending'
                ? 'border-[#2366E6] text-[#2366E6]'
                : 'border-transparent text-[#667085] hover:text-[#111827]'
            }`}
          >
            Pending Approvals
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#2366E6] text-white text-[11px] font-semibold">
                {pending.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('organisations')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'organisations'
                ? 'border-[#2366E6] text-[#2366E6]'
                : 'border-transparent text-[#667085] hover:text-[#111827]'
            }`}
          >
            Organisations
          </button>
          <button
            type="button"
            onClick={() => setTab('raffles')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'raffles'
                ? 'border-[#2366E6] text-[#2366E6]'
                : 'border-transparent text-[#667085] hover:text-[#111827]'
            }`}
          >
            Raffles
          </button>
        </div>

        {tab === 'pending' && (
          <div>
            {loadingPending ? (
              <p className="text-sm text-[#667085] py-12 text-center">Loading…</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-[#667085] py-16 text-center">
                No pending approvals 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {pending.map((org) => (
                  <div
                    key={org.id}
                    className="bg-white border border-[#E6ECF5] rounded-xl p-5"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                      <h2 className="text-lg font-bold text-[#111827]">
                        {org.organisation_name || 'Untitled'}
                      </h2>
                      <span className="text-sm text-[#667085]">
                        {org.organisation_type || '—'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-[#374151] mb-4">
                      <div>
                        <span className="text-[#667085]">Region/state: </span>
                        {org.region || '—'}
                      </div>
                      <div>
                        <span className="text-[#667085]">Contact person: </span>
                        {[org.contact_first_name, org.contact_last_name]
                          .filter(Boolean)
                          .join(' ') || '—'}
                      </div>
                      <div>
                        <span className="text-[#667085]">Contact email: </span>
                        {org.contact_email || '—'}
                      </div>
                      <div>
                        <span className="text-[#667085]">Registration: </span>
                        {[org.registration_type, org.registration_number]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </div>
                      <div>
                        <span className="text-[#667085]">Stripe connected: </span>
                        {org.stripe_account_id ? (
                          <span className="text-green-600 font-medium">Connected ✓</span>
                        ) : (
                          <span className="text-red-600 font-medium">Not connected ✗</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[#667085]">Signed up: </span>
                        {formatDate(org.created_at)}
                      </div>
                    </div>

                    {org.registration_number && (
                      <a
                        href={`https://abr.business.gov.au/ABN/View?abn=${encodeURIComponent(org.registration_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2366E6] hover:underline mb-4 inline-block"
                      >
                        ABN lookup →
                      </a>
                    )}

                    {rejectingId === org.id ? (
                      <div className="mt-3 pt-3 border-t border-[#E6ECF5]">
                        <label className="block text-sm text-[#374151] mb-1.5">
                          Rejection reason <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why this organisation is being rejected"
                          className="w-full h-10 rounded-lg border border-[#E6ECF5] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#2366E6] focus:shadow-[0_0_0_3px_rgba(35,102,230,0.12)] mb-3"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!rejectionReason.trim() || actionLoading === org.id}
                            onClick={() => handleRejectConfirm(org)}
                            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Confirm reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            className="h-9 px-4 rounded-lg border border-[#E6ECF5] text-sm text-[#667085] hover:bg-[#F8FAFC]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          disabled={actionLoading === org.id}
                          onClick={() => handleApprove(org)}
                          className="h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === org.id}
                          onClick={() => {
                            setRejectingId(org.id);
                            setRejectionReason('');
                          }}
                          className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'organisations' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === f.key
                      ? 'bg-[#2366E6] text-white'
                      : 'bg-white border border-[#E6ECF5] text-[#667085] hover:border-[#C9D8F4]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loadingOrgs ? (
              <p className="text-sm text-[#667085] py-12 text-center">Loading…</p>
            ) : (
              <div className="bg-white border border-[#E6ECF5] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E6ECF5] bg-[#F8FAFC] text-left text-xs font-medium text-[#667085] uppercase tracking-wide">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Region</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Stripe connected</th>
                        <th className="px-4 py-3">Signed up</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-[#667085]"
                          >
                            No organisations found
                          </td>
                        </tr>
                      ) : (
                        filteredOrgs.map((org) => (
                          <tr
                            key={org.id}
                            className="border-b border-[#E6ECF5] last:border-0 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-4 py-3 font-medium text-[#111827]">
                              {org.organisation_name || '—'}
                            </td>
                            <td className="px-4 py-3 text-[#374151]">
                              {org.organisation_type || '—'}
                            </td>
                            <td className="px-4 py-3 text-[#374151]">
                              {org.region || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusBadgeClass(org.status)}`}
                                >
                                  {org.status || '—'}
                                </span>
                                {org.is_suspended && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                                    Suspended
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {org.stripe_account_id ? (
                                <span className="text-green-600 text-xs font-medium">
                                  Connected ✓
                                </span>
                              ) : (
                                <span className="text-red-600 text-xs font-medium">
                                  Not connected ✗
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#667085] whitespace-nowrap">
                              {formatDate(org.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              {!org.is_suspended ? (
                                confirmingSuspend === org.id ? (
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-xs text-[#374151]">
                                      Suspend <strong>{org.organisation_name}</strong>?
                                      All their raffles will stop selling tickets immediately.
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        disabled={actionLoading === org.id}
                                        onClick={() => handleSuspend(org)}
                                        className="h-7 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-40"
                                      >
                                        Confirm suspend
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmingSuspend(null)}
                                        className="h-7 px-3 rounded-lg border border-[#E6ECF5] text-xs text-[#667085] hover:bg-[#F8FAFC]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={actionLoading === org.id}
                                    onClick={() => setConfirmingSuspend(org.id)}
                                    className="h-7 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-40"
                                  >
                                    Suspend
                                  </button>
                                )
                              ) : confirmingUnsuspend === org.id ? (
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-xs text-[#374151]">
                                    Unsuspend <strong>{org.organisation_name}</strong>?
                                    Their raffles will resume selling.
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={actionLoading === org.id}
                                      onClick={() => handleUnsuspend(org)}
                                      className="h-7 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                                    >
                                      Confirm unsuspend
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmingUnsuspend(null)}
                                      className="h-7 px-3 rounded-lg border border-[#E6ECF5] text-xs text-[#667085] hover:bg-[#F8FAFC]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={actionLoading === org.id}
                                  onClick={() => setConfirmingUnsuspend(org.id)}
                                  className="h-7 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                                >
                                  Unsuspend
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'raffles' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {raffleFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setRaffleStatusFilter(f.key)}
                  className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                    raffleStatusFilter === f.key
                      ? 'bg-[#2366E6] text-white'
                      : 'bg-white border border-[#E6ECF5] text-[#667085] hover:border-[#C9D8F4]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loadingRaffles ? (
              <p className="text-sm text-[#667085] py-12 text-center">Loading…</p>
            ) : (
              <div className="bg-white border border-[#E6ECF5] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E6ECF5] bg-[#F8FAFC] text-left text-xs font-medium text-[#667085] uppercase tracking-wide">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Club name</th>
                        <th className="px-4 py-3">Ticket price</th>
                        <th className="px-4 py-3">Sold</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRaffles.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-[#667085]"
                          >
                            No raffles found
                          </td>
                        </tr>
                      ) : (
                        filteredRaffles.map((raffle) => (
                          <tr
                            key={raffle.id}
                            className="border-b border-[#E6ECF5] last:border-0 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-4 py-3 font-medium text-[#111827]">
                              {raffle.title || '—'}
                            </td>
                            <td className="px-4 py-3 text-[#374151]">
                              {getClubName(raffle)}
                            </td>
                            <td className="px-4 py-3 text-[#374151]">
                              {raffle.ticket_price != null
                                ? `$${Number(raffle.ticket_price).toFixed(2)}`
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-[#374151]">
                              {getSold(raffle)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${raffleStatusBadgeClass(raffle.status)}`}
                              >
                                {raffle.status || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#667085] whitespace-nowrap">
                              {formatDate(raffle.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2 items-start">
                              {raffle.slug && (
                                <a
                                  href={'/r/' + raffle.slug}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-7 items-center px-3 rounded-lg border border-[#E6ECF5] text-xs font-medium text-[#667085] hover:bg-[#F8FAFC]"
                                >
                                  View
                                </a>
                              )}
                              {raffle.status === 'open' && (
                                confirmingPause === raffle.id ? (
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-xs text-[#374151]">
                                      Pause <strong>{raffle.title}</strong> ({getClubName(raffle)})?
                                      Ticket sales will stop immediately.
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        disabled={actionLoading === raffle.id}
                                        onClick={() => handlePause(raffle)}
                                        className="h-7 px-3 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-40"
                                      >
                                        Confirm pause
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmingPause(null)}
                                        className="h-7 px-3 rounded-lg border border-[#E6ECF5] text-xs text-[#667085] hover:bg-[#F8FAFC]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={actionLoading === raffle.id}
                                    onClick={() => setConfirmingPause(raffle.id)}
                                    className="h-7 px-3 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-40"
                                  >
                                    Pause
                                  </button>
                                )
                              )}
                              {raffle.status === 'paused' && (
                                confirmingUnpause === raffle.id ? (
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-xs text-[#374151]">
                                      Unpause <strong>{raffle.title}</strong> ({getClubName(raffle)})?
                                      Ticket sales will resume.
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        disabled={actionLoading === raffle.id}
                                        onClick={() => handleUnpause(raffle)}
                                        className="h-7 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                                      >
                                        Confirm unpause
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmingUnpause(null)}
                                        className="h-7 px-3 rounded-lg border border-[#E6ECF5] text-xs text-[#667085] hover:bg-[#F8FAFC]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={actionLoading === raffle.id}
                                    onClick={() => setConfirmingUnpause(raffle.id)}
                                    className="h-7 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                                  >
                                    Unpause
                                  </button>
                                )
                              )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
