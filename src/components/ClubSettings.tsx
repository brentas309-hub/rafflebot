import React, { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { uploadClubLogo, deleteClubLogo } from '../services/clubService';

interface Club {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Props {
  club: Club;
  onLogoUpdated: (logoUrl: string | null) => void;
}

export default function ClubSettings({ club, onLogoUpdated }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
      onLogoUpdated(logoUrl);
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
    if (!club.logo_url) return;
    if (!confirm('Are you sure you want to delete the club logo?')) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      await deleteClubLogo(club.id, club.logo_url);
      onLogoUpdated(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Logo deletion failed:', err);
      setError('Failed to delete logo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Club Logo</h3>

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

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Logo updated successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
