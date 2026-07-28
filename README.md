# Anchor Fashion Enterprise E-Commerce

## Introduction
Anchor Fashion is a robust, enterprise-grade e-commerce platform built with Next.js 16, Supabase, and Tailwind CSS. The architecture is designed for scalability, performance, and maximum security to support a global fashion brand.

## Technology Stack
- **Frontend**: Next.js 16 (App Router), TypeScript (Strict Mode)
- **Backend/Database/Auth**: Supabase (PostgreSQL)
- **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **State Management**: Zustand (Global), TanStack Query (Server State)
- **Forms & Validation**: React Hook Form, Zod
- **Analytics & Charts**: Recharts
- **Hosting**: Vercel

## Developer Setup Guide & Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd anchor-fashion
   ```

2. **Install Node.js & Dependencies**
   Ensure you have Node.js (v20+) and pnpm/npm/yarn installed.
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in the required keys.
   ```bash
   cp .env.example .env.local
   ```
   *Note: You must have a Supabase project set up with the corresponding Anon Key and URL.*

4. **Database Migration**
   Apply the latest Supabase migrations to your local or remote database:
   ```bash
   supabase db push
   ```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js local development server on port 3000 |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the Next.js production server |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run format`| Formats codebase using Prettier |
| `npm run test` | Runs the Jest testing suite |

## Folder Explanation

The enterprise folder structure enforces a modular, scalable architecture:

- `app/`: Next.js App Router definitions (pages, layouts, route handlers).
- `actions/`: Server Actions for server-side mutations.
- `assets/`: Static assets such as fonts, SVGs, and images.
- `components/`: Reusable, generic UI components (e.g., shadcn/ui).
- `config/`: Application configuration files.
- `constants/`: Global constants, enums, and static maps.
- `database/`: Database types and seed scripts.
- `docs/`: Technical documentation and architecture diagrams.
- `emails/`: React Email templates.
- `features/`: Feature-scoped business logic and components.
- `hooks/`: Custom React hooks (e.g., useMediaQuery).
- `lib/`: Third-party library initializations and core utilities.
- `middleware/`: Custom routing middlewares.
- `modules/`: Complex, distinct functional modules (e.g., Admin, CRM).
- `providers/`: Global context providers (React Query, Theme, Supabase).
- `repositories/`: Data access layer abstracting direct database calls.
- `schemas/`: Zod validation schemas.
- `scripts/`: Custom CLI scripts for tasks like migration or deployment.
- `services/`: Business logic services, abstracting API integrations.
- `stores/`: Zustand global state definitions.
- `styles/`: Global CSS and Tailwind directives.
- `supabase/`: Supabase migration files and edge functions.
- `tests/`: End-to-End, Integration, and Unit tests.
- `types/`: Global TypeScript definitions and interfaces.
- `utils/`: Pure helper functions.
- `validators/`: Additional business rule validation logic.

## Project Conventions & Coding Standards

1. **TypeScript**: Strict mode is enabled. Explicitly type all variables, function arguments, and return types. Use `interface` for object definitions and `type` for unions/intersections.
2. **Components**: Use Server Components by default. Use `"use client"` only when browser APIs, state, or context are required.
3. **Data Fetching**: Use TanStack React Query for all client-side fetching and caching. Use Server Components for initial static/dynamic renders.
4. **Mutations**: Use Next.js Server Actions (`actions/`) integrated with React Hook Form and Zod for secure, server-side validated form submissions.
5. **State Management**: Use Zustand for global UI state. Keep state as close to the component as possible.
6. **Styling**: strictly use Tailwind CSS utility classes. Extract highly repeated patterns to `components/ui/` using `cva` and `tailwind-merge`.
7. **Security**: Validate all inputs via Zod on both client and server. Implement Supabase Row Level Security (RLS) for all tables.
8. **Commits**: Follow Conventional Commits specification (e.g., `feat: added authentication`, `fix: resolved navigation bug`).

9. **Testing**: Run `npm run test` (Jest) before opening a PR.

## Production Optimization

Anchor Fashion implements several layers of production optimizations:
- **Code Splitting & Lazy Loading**: Heavy components are dynamically imported using `next/dynamic`.
- **Image Optimization**: WebP and AVIF formats are used, alongside long TTL caching.
- **Progressive Web App (PWA)**: Serwist is integrated for offline caching and service workers.
- **Edge Security**: Vercel Edge Middleware strictly controls CSP, Rate Limiting, and Role-Based Access Control.
- **Analytics Integration**: Google Analytics 4, Tag Manager, and Meta Pixel are loaded asynchronously to prevent main-thread blocking.

## Deployment Checklist (Vercel)

1. Connect the repository to Vercel.
2. In the Vercel Dashboard, ensure the **Framework Preset** is set to `Next.js`.
3. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g., https://anchorfashion.com)
   - `NEXT_PUBLIC_GA_ID`
   - `NEXT_PUBLIC_GTM_ID`
   - `NEXT_PUBLIC_META_PIXEL_ID`
4. The `vercel.json` file is pre-configured with strict security headers (HSTS, Permissions-Policy, etc.).
5. Click **Deploy**.

## Troubleshooting

- **Build Fails (OOM)**: If memory errors occur, ensure Next.js compiler limits are respected, and check the `.tsbuildinfo` cache.
- **Supabase Auth Issues**: Ensure cookies are enabled, and `middleware.ts` is correctly refreshing the session via `updateSession()`.
- **Service Worker not updating**: During active development, you may need to clear application data or bypass cache, as Serwist registers the SW immediately.

---
*Enterprise E-Commerce Architecture. Copyright © Anchor Fashion 2026. All rights reserved.*
