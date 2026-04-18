import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Check, Building2, CreditCard, Image as ImageIcon } from 'lucide-react';
import { getClubForCurrentUser, updateClubDetails, uploadClubLogo, deleteClubLogo } from '../services/clubService';
import RafflebotLogo from './RafflebotLogo';

interface Club {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  stripe_account_id: string | null;
  logo_url: string | null;
}

export default function ClubSettingsPage() {
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadClub();
  }, []);

  async function loadClub() {
    try {
      setLoading(true);
      const clubData = await getClubForCurrentUser();
      if (clubData) {
        setClub(clubData);
        setFormData({
          name: clubData.name || '',
          email: clubData.email || '',
          phone: clubData.phone || '',
          address: clubData.address || '',
        });
      }
    } catch (err) {
      console.error('Failed to load club:', err);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!club) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await updateClubDetails(club.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadClub();
    } catch (err) {
      console.error('Failed to update club:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!club) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or SVG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const logoUrl = await uploadClubLogo(club.id, file);
      setClub({ ...club, logo_url: logoUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Logo upload failed:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDeleteLogo() {
    if (!club || !club.logo_url) return;
    if (!confirm('Are you sure you want to delete the club logo?')) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      await deleteClubLogo(club.id, club.logo_url);
      setClub({ ...club, logo_url: null });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Logo deletion failed:', err);
      setError('Failed to delete logo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No club found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RafflebotLogo size={120} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rafflebot</h1>
              <p className="text-xs text-slate-500">Club Settings</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Club Settings</h2>
          <p className="text-slate-600 mt-2">Manage your club information and branding</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Changes saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Club Information</h3>
                <p className="text-sm text-slate-600">Basic details about your organization</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Club Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter club name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@club.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Club Branding</h3>
                <p className="text-sm text-slate-600">Upload your club logo</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {club.logo_url ? (
                  <div className="relative">
                    <img
                      src={club.logo_url}
                      alt={`${club.name} logo`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                    />
                    <button
                      onClick={handleDeleteLogo}
                      disabled={uploading}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors disabled:opacity-50"
                      title="Delete logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-3">
                  Upload a logo for your club. It will appear on your raffle pages.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="logo-upload"
                />

                <label
                  htmlFor="logo-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    uploading
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : club.logo_url ? 'Change Logo' : 'Upload Logo'}
                </label>

                <p className="text-xs text-slate-500 mt-2">
                  PNG, JPG or SVG. Max 5MB. Recommended size: 200x200px
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Payments</h3>
                <p className="text-sm text-slate-600">Payment processing status</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Stripe Account</p>
                <p className="text-xs text-slate-600 mt-1">
                  {club.stripe_account_id ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {club.stripe_account_id ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Active
                </div>
              ) : (
                <div className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                  Inactive
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
