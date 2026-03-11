import React from 'react';
import { Ticket, Shield, TrendingUp, Users, ArrowRight, Check } from 'lucide-react';
import RafflebotLogo from './RafflebotLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Rafflebot
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Admin Login
          </button>
        </div>
      </nav>

      <section
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="1"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>')`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Fundraising Made<br />Simple & Secure
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              The modern raffle platform for schools, sports clubs, and community organizations.
              Raise funds effortlessly with transparent, secure digital raffles.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg hover:scale-105"
            >
              Start Your First Raffle
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Successful Raffles
            </h2>
            <p className="text-xl text-gray-600">
              Purpose-built for community organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Ticket className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Digital Ticketing
              </h3>
              <p className="text-gray-600">
                No more paper tickets. Automated ticket generation and tracking with real-time availability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Bank-Level Security
              </h3>
              <p className="text-gray-600">
                Secure payment processing with Stripe. Funds go directly to your organization.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Earn by Referring
              </h3>
              <p className="text-gray-600">
                Bring other organizations on board and earn 1.5% of their raffle sales forever.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community Focused
              </h3>
              <p className="text-gray-600">
                Built specifically for schools, sports clubs, and community organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/ChatGPT_Image_Mar_8,_2026,_11_37_16_AM.png"
                alt="Kids playing sports"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Support Your Community's Dreams
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                From new sports equipment to school excursions, Rafflebot helps organizations
                raise the funds they need. Simple setup, transparent draws, and instant payments.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Set up in minutes</h4>
                    <p className="text-gray-600">Create your first raffle in under 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Transparent & Fair</h4>
                    <p className="text-gray-600">Provably fair draws with full audit trails</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Get paid instantly</h4>
                    <p className="text-gray-600">Direct deposits to your organization's account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Professional fundraising platform for your organization
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">$49</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <div className="text-lg text-gray-600 mb-4">Platform Subscription</div>
              <div className="inline-flex items-baseline gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-3xl font-bold text-blue-600">+ 5%</span>
                <span className="text-gray-700">per transaction</span>
              </div>
            </div>
            <div className="pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">What's Included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      Unlimited raffles
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      Secure payment processing
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      Digital ticket management
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      Automated winner selection
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      Real-time analytics
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      24/7 support
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Referral Bonus:</h3>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                    <div className="text-3xl font-bold text-purple-600 mb-2">1.5%</div>
                    <p className="text-gray-700 text-sm">
                      Earn ongoing commission when you refer other organizations.
                      They pay the same price, and you earn 1.5% of their raffle sales.
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong className="text-gray-900">Example:</strong> If your referred organization sells $10,000 in raffle tickets, you earn $150 automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Fundraising?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of organizations already using Rafflebot
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg hover:scale-105"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">Rafflebot</span>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2026 Rafflebot. All rights reserved.</p>
              <p className="text-sm mt-1">Secure fundraising for community organizations</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
