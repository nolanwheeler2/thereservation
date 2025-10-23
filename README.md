# Next.js + Supabase Auth Starter (Vercel-ready) — with server-side sessions, middleware, profiles & email confirmation

This project is a minimal Next.js (App Router) starter that implements registration and login using Supabase Auth and is ready to deploy to Vercel.

What I added (all requested features)
- Server-side session handling using @supabase/auth-helpers-nextjs.
- Middleware that protects server routes (redirects unauthenticated users from /profile and API profile routes to /login).
- A "profiles" database table and a small API (GET, PUT, DELETE) to read/update a user's profile (server-side, authorized).
- A Profile editor UI connected to the API for CRUD.
- Email confirmation redirect support on registration (emailRedirectTo).
- TypeScript types for the profile shape and helper files.
- A SQL migration to create the profiles table.

Prerequisites
- Node.js 18+
- A Supabase project
- A Vercel account (for deployment)

Important environment variables
- NEXT_PUBLIC_SUPABASE_URL (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (public)
- SUPABASE_SERVICE_ROLE_KEY (server-only, DO NOT expose to the client; put this in Vercel environment variables as a secret)
- NEXT_PUBLIC_SITE_URL (e.g. https://your-vercel-app.vercel.app or http://localhost:3000)

Copy .env.example -> .env.local for local dev and fill values.

Quick start (local)
1. Install
   - npm install
2. Create `.env.local` from `.env.example` with your Supabase values.
3. Run
   - npm run dev
4. Open http://localhost:3000

Supabase setup (important)
1. Create a project at https://app.supabase.com.
2. In Settings → API, copy the Project URL and anon key into `.env.local`.
3. In Settings → API, you will also find the Service Role Key. Add that to your Vercel environment variables as `SUPABASE_SERVICE_ROLE_KEY` (server-only).
4. In Authentication → Settings → Redirect URLs add:
   - http://localhost:3000/ (local)
   - https://<your-vercel-domain>/ (production)
5. In Authentication → Email Templates, if you use email confirmation, configure templates and the site URL. The register flow sends an email redirect URL to bring users back to /profile after confirmation.
6. Run the SQL migration below (in the SQL editor or via psql) to create the profiles table:

Migration SQL (db/migrations/001_create_profiles.sql)
```sql
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  updated_at timestamp with time zone default now()
);
```

How this works (brief)
- Client-side code uses `lib/supabaseClient.ts` (anon key).
- Server-side code and middleware uses `@supabase/auth-helpers-nextjs`. Middleware inspects cookies and redirects unauthenticated users off protected routes. The API routes use the request cookies to find the session and perform DB operations (profiles).
- Registration sends an email redirect URL so users who confirm via email land back on the site (and are signed in there).

Files added/changed
- lib/supabaseClient.ts — client library (public anon key)
- lib/supabaseServer.ts — server client using service role key (ONLY use on server)
- middleware.ts — protects /profile and /api/profile/*
- app/api/profile/route.ts — CRUD for profile (GET/PUT/DELETE)
- components/ProfileEditor.tsx — UI to edit profile
- app/profile/page.tsx — fetches profile from /api/profile and renders ProfileEditor
- components/AuthForm.tsx — registration uses emailRedirectTo
- db/migrations/001_create_profiles.sql — migration SQL
- .env.example — new env vars
- package.json — added dependency for auth-helpers

Security notes
- NEVER commit SUPABASE_SERVICE_ROLE_KEY into the repo.
- Put SUPABASE_SERVICE_ROLE_KEY in Vercel's Environment Variables (Production / Preview) with the "Environment Variable" type set to "Secret".
- NEXT_PUBLIC_* variables may be used on the client.

Deployment to Vercel
1. Push repo to GitHub.
2. Import project in Vercel.
3. In Project Settings -> Environment Variables, add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (as a secret — server only)
   - NEXT_PUBLIC_SITE_URL
4. Deploy.

If you'd like, I can:
- Add automatic creation of a profile row on sign-up (via a Postgres trigger or a server-side signup webhook).
- Add server-side rendering examples that show protected content using createServerComponentClient.
- Add password reset UI and hooks for additional user metadata.