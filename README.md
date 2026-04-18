# Enterprise Raffle Platform

A production-ready, enterprise-grade raffle management platform with secure architecture, provably fair draw logic, and a professional admin dashboard suitable for real-money raffles.

## Features

### Security & Compliance
- Role-based access control (admin/user)
- Row-level security (RLS) on all database tables
- Server-side execution of all critical operations
- Immutable audit logging for all draws
- Provably fair random winner selection

### Raffle Management
- Complete raffle lifecycle management (draft → open → closed → drawn)
- Automatic ticket generation with unique sequential numbers
- Real-time sales tracking and progress monitoring
- Ticket purchase workflow with order management
- Winner selection with cryptographic verification

### Provably Fair Draw System
- Pre-draw seed hash publication
- Cryptographically secure randomness
- Server-side draw execution only
- Complete audit trail with HMAC signatures
- Independent verification capability

### Admin Dashboard
- Clean, professional UI with Tailwind CSS
- Real-time raffle statistics
- Sales progress visualization
- Comprehensive audit log viewer
- Winner history and management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL via Supabase with RLS
- **Authentication**: Supabase Auth with role-based access
- **Deployment**: Vercel-ready (or any static host)

## Database Schema

### Tables
- `clubs` - Organization management
- `users` - User accounts with role-based access
- `raffles` - Raffle campaigns
- `tickets` - Individual raffle tickets with status tracking
- `orders` - Purchase orders
- `winners` - Winner records
- `draw_audit` - Immutable audit logs

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Creating an Admin User

After signing up, you need to manually set the user role to 'admin' in the database:

1. Sign up through the UI
2. In Supabase SQL Editor, run:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Raffle Workflow

### Admin Actions

1. **Create Raffle**
   - Set title, description, ticket count, and price
   - System automatically generates sequential tickets
   - Raffle starts in 'draft' status

2. **Open Raffle**
   - Make raffle available for ticket purchases
   - Users can now buy tickets

3. **Close Raffle**
   - Stop accepting new purchases
   - Prepare for winner draw

4. **Draw Winner**
   - System generates cryptographic seed
   - Publishes seed hash for verification
   - Executes server-side random selection
   - Records winner and audit trail
   - Updates raffle to 'drawn' status

### Security Features

#### Ticket Management
- Only server functions can modify ticket status
- Frontend cannot directly manipulate tickets
- Unique constraint prevents duplicate ticket numbers
- Sold tickets locked after raffle closes

#### Winner Draw
- Executed only on server (Edge Function)
- Uses cryptographically secure randomness
- Requires raffle to be 'closed'
- Requires at least one sold ticket
- Prevents multiple draws per raffle
- Creates immutable audit log

#### Access Control
- Admin-only raffle creation
- Admin-only raffle management
- Admin-only winner draws
- User-specific order access
- Public raffle/ticket viewing

## API Endpoints (Edge Functions)

### `draw-winner`
Executes the provably fair winner draw process.

**Security**: Requires admin authentication

**Process**:
1. Validates admin access
2. Verifies raffle is closed with sold tickets
3. Generates cryptographically secure random selection
4. Records winner and audit data
5. Updates raffle status to 'drawn'

### `manage-tickets`
Generates tickets for a raffle.

**Security**: Requires admin authentication

**Process**:
1. Validates admin access
2. Checks for existing tickets
3. Creates sequential tickets (1 to N)
4. Sets all tickets to 'available' status

### `purchase-tickets`
Handles ticket purchases for users.

**Security**: Requires user authentication

**Process**:
1. Validates raffle is open
2. Checks ticket availability
3. Creates order record
4. Updates tickets to 'sold' status
5. Links tickets to user and order

## Audit Logging

Every draw creates an immutable audit record containing:
- Raffle ID
- Cryptographic seed and hash
- Timestamp
- Admin ID
- Server HMAC signature

This ensures:
- Draw cannot be tampered with
- Process is transparent
- Independent verification possible
- Complete accountability

## Provably Fair Verification

The system implements provably fair draws:

1. **Pre-commitment**: Seed hash published before draw
2. **Execution**: Random selection using committed seed
3. **Verification**: Seed revealed after draw
4. **Audit**: All data stored in immutable log

Anyone can verify a draw by:
1. Hashing the revealed seed
2. Comparing to pre-published hash
3. Checking audit log signature
4. Verifying draw process

## Deployment

### GitHub Setup

1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Cloudflare Pages Deployment

1. Go to Cloudflare Pages dashboard
2. Click "Create a project" > "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

5. Add environment variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key

6. Click "Save and Deploy"

Your site will be live in minutes and auto-deploy on every push to main.

### Alternative: Vercel
```bash
npm run build
vercel deploy
```

### Edge Functions
Edge functions are already deployed to Supabase and accessible via:
- `https://[project].supabase.co/functions/v1/draw-winner`
- `https://[project].supabase.co/functions/v1/manage-tickets`
- `https://[project].supabase.co/functions/v1/purchase-tickets`

## Security Considerations

### Database Security
- RLS enabled on all tables
- Restrictive default policies
- Service role key only in server functions
- No sensitive data in frontend

### Authentication
- Secure session management
- Role-based authorization
- Admin verification on sensitive operations
- Token-based API authentication

### Critical Operations
- All ticket modifications server-side only
- Winner draw server-side only
- Order creation with validation
- Audit logging cannot be modified

## License

Proprietary - Enterprise Raffle Platform
