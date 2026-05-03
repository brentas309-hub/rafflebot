markdown# Rafflebot - Project Context

## What this app does
Online raffle platform for sports clubs. Clubs create raffles, 
users buy tickets, we take a % fee via Stripe Connect.

## Tech Stack
- Vite + React + TypeScript
- Supabase (auth + database + edge functions)
- Stripe Connect (marketplace model)
- Tailwind CSS
- GitHub: https://github.com/Rafflebot2026/rafflebot
- Live site: https://getrafflebot.com

## Database (Supabase)
Two tables in live database:
- raffles (id, title, slug, ticket_price, total_tickets, 
  tickets_remaining, processing_fee_mode, draw_timestamp, created_at)
- purchases (id, raffle_id, quantity, amount, email, 
  stripe_session_id, created_at)

## What's Working
- Landing page
- Club dashboard (create raffles, draw winners)
- Basic auth (login/signup)
- Onboarding flow UI
- Public raffle page (/raffle/:slug) with ticket selector
- Ticket availability loading correctly

## What's Missing (Priority Order)
1. Stripe checkout - buy button calls create-checkout-session 
   (doesn't exist). Need to create this edge function using 
   Stripe Connect with platform fee
2. get-session edge function for success page
3. create-connect-account edge function for club onboarding
4. Webhook to record purchases after payment
5. Fix success URL routing (/success not /r/:slug/success)

## Edge Functions (in supabase/functions/)
- purchase-tickets - exists but not what buy button calls
- draw-winner - picks raffle winner
- manage-tickets - bulk ticket creation

## Key Files
- src/components/PublicRafflePage.tsx - public raffle page
- src/components/raffle-public/TicketSelector.tsx - buy button
- src/components/onboarding/ConnectStripe.tsx - Stripe Connect UI
- src/components/Success.tsx - post-payment page

## Important Notes
- Buy button posts to create-checkout-session with raffle_slug + quantity
- Hard-coded Supabase URL in several files (needs fixing)
- Stripe Connect fee not yet applied to checkout sessions
- Local dev: npm run dev → http://localhost:5173