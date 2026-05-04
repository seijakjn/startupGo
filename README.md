# Butuan Go Super App

A production-ready mobility and delivery platform for Butuan City, built with Next.js, Clerk, and Supabase.

## 🚀 Deployment Guide (Vercel)

1. **Connect Repository**: Connect this GitHub repository to your Vercel account.
2. **Configure Framework**: Vercel will automatically detect Next.js.
3. **Environment Variables**: You MUST add the following variables in the Vercel Dashboard:

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `NEXT_PUBLIC_ORS_API_KEY` | OpenRouteService API Key (for maps) |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk (Role-based metadata)
- **Database**: Supabase (PostgreSQL + RLS)
- **Maps**: OpenRouteService + Leaflet
- **Styling**: Vanilla CSS (Custom Design System)

## 🔑 Key Features

- **Multi-Role Support**: Custom portals for Users, Riders, and Admins.
- **Wallet System**: Atomic balance updates and transaction history.
- **Real-time Jobs**: Live job feed for riders and status tracking for users.
- **Admin Dashboard**: Oversight of all activities and user role management.

---
*Created for Butuan City Mobility.*
