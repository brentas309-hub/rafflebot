import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, resetData } = useOnboarding();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createAccount = async () => {
      setIsCreating(true);
      setError(null);

      try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.contact_email,
          password: data.password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: orgError } = await supabase.from('organisations').insert({
            user_id: authData.user.id,
            organisation_name: data.organisation_name,
            organisation_type: data.organisation_type,
            country: data.country,
            region: data.region,
            address: data.address,
            phone: data.phone,
            website: data.website || null,
            contact_first_name: data.contact_first_name,
            contact_last_name: data.contact_last_name,
            contact_role: data.contact_role,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            registration_type: data.registration_type,
            registration_number: data.registration_number || null,
            not_formally_registered: data.not_formally_registered,
            confirmed_permitted: data.confirmed_permitted,
            stripe_connected: data.stripe_connected,
            default_currency: data.default_currency,
            default_ticket_price: parseFloat(data.default_ticket_price) || 0,
            expected_volume: data.expected_volume,
            onboarding_completed: true,
          });

          if (orgError) throw orgError;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create account');
        console.error('Error creating account:', err);
      } finally {
        setIsCreating(false);
      }
    };

    createAccount();
  }, []);

  const handleCreateRaffle = () => {
    navigate('/dashboard');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout currentStep={6} totalSteps={7} hideNavigation>
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        {isCreating ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Setting up your account...</h2>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </>
        ) : error ? (
          <>
            <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/onboarding/intro')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Over
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your organisation is ready to start fundraising.
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              You can now create your first raffle and start selling tickets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateRaffle}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Raffle
              </button>
              <button
                onClick={handleGoToDashboard}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Go To Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </OnboardingLayout>
  );
};
