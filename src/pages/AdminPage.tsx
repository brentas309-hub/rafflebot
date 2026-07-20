import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
};

type Tab = 'pending' | 'organisations';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

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

export default function AdminPage() {
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

  useEffect(() => {
    async function loadPending() {
      setLoadingPending(true);
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      console.log('Pending orgs query result:', { data, error });

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
      : allOrgs.filter((o) => o.status === statusFilter);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <nav className="w-full bg-white border-b border-[#E6ECF5] px-6 py-4 flex items-center gap-3">
        <RafflebotLogo
          size={120}
          className="h-10 w-auto max-w-none shrink-0 object-contain overflow-visible"
        />
        <span className="text-[#111827] font-bold text-[15px] whitespace-nowrap">
          Master Admin
        </span>
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
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
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusBadgeClass(org.status)}`}
                              >
                                {org.status || '—'}
                              </span>
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
