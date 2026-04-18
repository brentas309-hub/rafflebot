import React, { useState, useEffect } from 'react';
import { CheckCircle, Share2, MessageCircle, Mail, Copy, Facebook } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RaffleData {
  id: string;
  title: string;
  slug: string;
  club: {
    name: string;
  };
  team: {
    name: string;
  } | null;
}

interface SuccessModalProps {
  raffle: RaffleData;
  purchaseId: string;
  quantity: number;
  onClose: () => void;
}

export default function SuccessModal({ raffle, purchaseId, quantity, onClose }: SuccessModalProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateReferralLink();
  }, [purchaseId]);

  const generateReferralLink = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 10);

      const { error } = await supabase
        .from('referral_links')
        .insert({
          raffle_id: raffle.id,
          purchase_id: purchaseId,
          referral_code: code,
          supporter_name: 'Supporter'
        });

      if (error) throw error;

      setReferralCode(code);
      const url = `${window.location.origin}/r/${raffle.slug}?ref=${code}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating referral link:', error);
    }
  };

  const shareMessage = `I just bought a ticket in the ${raffle.club.name}${raffle.team ? ` ${raffle.team.name}` : ''} fundraiser.\nHelp the team reach their goal!\n\nBuy a ticket here:\n${shareUrl}`;

  const handleShare = async (method: string) => {
    try {
      await supabase
        .from('share_activity')
        .insert({
          raffle_id: raffle.id,
          purchase_id: purchaseId,
          share_method: method
        });

      await supabase
        .from('referral_links')
        .update({ conversions: supabase.rpc('increment', { x: 1 }) })
        .eq('referral_code', referralCode);
    } catch (error) {
      console.error('Error logging share:', error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    handleShare('copy_link');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    handleShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    handleShare('whatsapp');
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareToMessenger = () => {
    handleShare('messenger');
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareViaSMS = () => {
    handleShare('sms');
    window.location.href = `sms:?body=${encodeURIComponent(shareMessage)}`;
  };

  const shareViaEmail = () => {
    handleShare('email');
    window.location.href = `mailto:?subject=${encodeURIComponent(`Support ${raffle.club.name}`)}&body=${encodeURIComponent(shareMessage)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-lg text-slate-600">
            You purchased {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
          </p>
          <p className="text-slate-700 font-semibold mt-2">
            for {raffle.club.name}{raffle.team ? ` ${raffle.team.name}` : ''}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
            Help the team reach their goal faster!
          </h3>
          <p className="text-slate-600 text-center mb-4">
            Share this raffle with your friends and family
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={shareToFacebook}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Facebook className="w-6 h-6 text-blue-600" />
              <span className="text-xs text-slate-700">Facebook</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-xs text-slate-700">WhatsApp</span>
            </button>
            <button
              onClick={shareToMessenger}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-slate-700">Messenger</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareViaSMS}
              className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <MessageCircle className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">Send SMS</span>
            </button>
            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <Mail className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">Email</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-700 text-center">
            <strong className="text-slate-900">Bonus:</strong> When someone buys tickets through your link, you'll be recognized as a top supporter!
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
