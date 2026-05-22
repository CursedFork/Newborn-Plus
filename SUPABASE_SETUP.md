# Supabase Setup Guide

First-time setup. Takes about 10 minutes.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**.
3. Fill in:
   - **Name:** Newborn+
   - **Database password:** pick a strong one and save it in your password manager
   - **Region:** pick the one closest to you (US East if you're in MD)
4. Click **Create new project** and wait ~2 minutes for it to provision.

## 2. Copy your API keys

1. In the sidebar go to **Project Settings → API**.
2. Copy the following into `.env.local` (duplicate `.env.local.example` first):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> The service role key bypasses RLS. Never expose it to the browser or commit it to git.

## 3. Enable Auth providers

1. Go to **Authentication → Providers**.
2. **Email** is enabled by default — leave it on. Under Email settings:
   - Enable **Magic Link** (Passwordless)
   - Keep **Email + Password** on as a fallback
3. Under **Authentication → URL Configuration**, set:
   - **Site URL:** `http://localhost:3000` (update to your Vercel URL after deploy)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback`

## 4. Run the migration

Install the Supabase CLI locally if you haven't:

```bash
npm install                  # already done if you followed the README
```

Then link your project and push the migration:

```bash
npx supabase login           # opens a browser to authenticate
npx supabase link --project-ref YOUR_PROJECT_REF
# Project ref is the subdomain in your Supabase URL:
# https://abcdefghij.supabase.co  →  ref is "abcdefghij"

npx supabase db push         # applies supabase/migrations/* to your remote DB
```

## 5. Seed development data (optional but recommended)

Run the seed file in the Supabase SQL editor:

1. Go to **SQL Editor** in the Supabase dashboard.
2. Open `supabase/seed/seed.sql` from this repo.
3. Paste it in and click **Run**.

The seed creates a baby (ID `00000000-0000-0000-0000-000000000001`) with 3 days of real
feeding, diaper, sleep, pump, weight, and pediatrician data. All views should render with
this data.

> **Note:** `logged_by` is null for all seed rows — create a test user in the dashboard
> (`Authentication → Users → Add user`), then run:
> ```sql
> insert into caregivers (baby_id, user_id, role, display_name)
> values ('00000000-0000-0000-0000-000000000001', 'YOUR_USER_UUID', 'owner', 'You');
> ```

## 6. Create the Storage bucket (for voice notes)

1. Go to **Storage** in the dashboard.
2. Click **New bucket**, name it `voice-notes`, set it to **Private**.
3. The app handles uploads/signed URLs via the Supabase client.

## 7. Free-tier gotchas

**Projects pause after 1 week of inactivity.** During the newborn phase you'll log constantly
so this won't be an issue. If you come back after a break and the app shows "Waking up the
database…", just wait ~15 seconds and it will resume automatically.

**No automatic backups on the free tier.** The nightly GitHub Actions backup workflow in
`.github/workflows/backup.yml` covers this. See the README for restore instructions.

When you're ready to upgrade, the **Pro plan ($25/mo)** adds daily backups and eliminates
the pause behavior.

## 8. Deploying to Vercel

1. Push this repo to GitHub (already done).
2. Go to [vercel.com](https://vercel.com), import the `CursedFork/Newborn-Plus` repo.
3. Add the environment variables from `.env.local` in the Vercel dashboard
   (**Settings → Environment Variables**).
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.
5. Go back to Supabase **Authentication → URL Configuration** and add your Vercel URL
   to **Redirect URLs**.
6. Deploy.
