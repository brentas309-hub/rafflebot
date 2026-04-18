import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-900">

      {/* NAV */}
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="font-semibold text-lg">RaffleBot</div>

        <button
          onClick={() => navigate('/onboarding/create-raffle')}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </div>

      {/* HERO (DO NOT TOUCH) */}
      <div className="w-full">
        <img
          src="https://i.imgur.com/xvGhy81.png"
          alt="RaffleBot Hero"
          className="w-full object-cover"
        />
      </div>

      {/* FEATURE CARDS */}
      <section className="py-10 -mt-2">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-1">Instant setup</h3>
            <p className="text-sm text-gray-600">
              Create your raffle in minutes — no tech skills needed.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold mb-1">Easy payments</h3>
            <p className="text-sm text-gray-600">
              Accept all major cards and online payments.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold mb-1">Reach more supporters</h3>
            <p className="text-sm text-gray-600">
              Sell more tickets by sharing your raffle via social, email, and text.
            </p>
          </div>

        </div>
      </section>

      {/* VIDEO + CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          {/* VIDEO PLACEHOLDER */}
          <div className="relative rounded-xl overflow-hidden border shadow-sm bg-black">
            <img
              src="/images/your-image.png"
              alt="Video preview"
              className="w-full h-full object-cover opacity-90"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-5 shadow-lg hover:scale-105 transition cursor-pointer">
                ▶
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-3 py-2 flex items-center gap-3">
              <span>00:41</span>
              <div className="flex-1 h-1 bg-gray-600 rounded">
                <div className="w-1/3 h-1 bg-green-400 rounded"></div>
              </div>
            </div>
          </div>

          {/* TEXT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              See How It Works <br /> in Under 60 Seconds
            </h2>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div>✅ Instant setup</div>
              <div>✅ Easy payments</div>
              <div>✅ Sell more tickets</div>
              <div>✅ Share anywhere</div>
            </div>

            <button
              onClick={() => navigate('/onboarding/create-raffle')}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition shadow-md"
            >
              Start Your First Raffle
            </button>

            <p className="text-sm text-gray-500 mt-3">
              No upfront costs. Takes 5 minutes.
            </p>
          </div>

        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-3xl md:text-4xl font-semibold mb-8">
            Old-school fundraising is frustrating
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-gray-700">

            <div>🔴 Collecting cash manually</div>
            <div>🔴 Drowning in spreadsheets</div>
            <div>🔴 Losing track of tickets</div>
            <div>🔴 Managing endless paperwork</div>

          </div>

        </div>
      </section>

    </div>
  );
}