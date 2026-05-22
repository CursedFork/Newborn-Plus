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

### 8a. Import the repo

1. Go to [vercel.com](https://vercel.com) and sign in (or create a free account — use the
   same GitHub account that owns `CursedFork/Newborn-Plus`).
2. Click **Add New… → Project**.
3. Under **Import Git Repository**, find `CursedFork/Newborn-Plus` and click **Import**.
4. Vercel will detect Next.js automatically. Leave **Framework Preset** as **Next.js** and
   **Root Directory** as `./`. Do not change the build or output settings.

### 8b. Add environment variables

Before clicking Deploy, scroll down to **Environment Variables** and add each of these.
Set all four for **Production**, **Preview**, and **Development** (the default).

| Name | Value | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | Supabase → Project Settings → API → anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | Supabase → Project Settings → API → service_role / secret |
| `NEXT_PUBLIC_APP_URL` | *(leave blank for now — fill in after step 8c)* | — |

> The service role key is server-only. Vercel never sends it to the browser. Do not put it
> in any `NEXT_PUBLIC_` variable.

Click **Deploy** and wait for the first build to finish (~1–2 minutes).

### 8c. Copy your deployment URL and finish wiring

After the build succeeds Vercel shows a URL like `newborn-plus.vercel.app` (or a random
name). Copy it.

**In Vercel:**
1. Go to your project → **Settings → Environment Variables**.
2. Find `NEXT_PUBLIC_APP_URL`, edit it, and set the value to your production URL:
   `https://newborn-plus.vercel.app` (with `https://`, no trailing slash).
3. Click **Save**. This triggers a new deployment automatically — wait for it to finish.

**In Supabase — update Auth redirect URLs:**
1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `https://newborn-plus.vercel.app`.
3. Under **Redirect URLs**, add:
   - `https://newborn-plus.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (keep this for local dev)
4. Click **Save**.

> If you have a custom domain (e.g. `newbornplus.app`), add it to Redirect URLs as well.
> You can add a custom domain in Vercel → Settings → Domains at any time.

### 8d. Verify the deployment

1. Open your Vercel URL in a browser.
2. Try signing up with your email address — you should receive a magic link.
3. Click the link → you should land on `/home` (the dashboard).
4. If the home screen says "No baby profile found", go to **Settings → Add / change baby**
   and create your baby profile.
5. Try logging a feed — it should save and the home screen should update.

If anything looks wrong, check **Vercel → Deployments → (latest) → Functions** for server
errors, and **Browser DevTools → Console** for client errors.

### 8e. Set up the nightly backup (recommended)

The GitHub Actions workflow in `.github/workflows/backup.yml` runs every night at 4 AM UTC,
dumps the database, encrypts it, and commits it to the repo's `/backups` folder.

**To activate it, add these three secrets to the GitHub repo:**

1. Go to `https://github.com/CursedFork/Newborn-Plus/settings/secrets/actions`.
2. Click **New repository secret** for each:

| Secret name | Value | Where to find it |
|---|---|---|
| `SUPABASE_DB_HOST` | `db.xxxx.supabase.co` | Supabase → Project Settings → Database → **Host** field |
| `SUPABASE_DB_PASSWORD` | the password you chose in step 1 | your password manager |
| `BACKUP_GPG_PASSPHRASE` | any strong passphrase you choose | keep this in your password manager — you need it to decrypt backups |

3. After adding all three secrets, go to **Actions → Nightly database backup → Run workflow**
   to do a manual test run. Check that a new commit appears in `/backups/daily/`.

> The database password is the one you set when creating the Supabase project (step 1).
> If you forgot it, reset it in Supabase → Project Settings → Database → Reset database password.

### 8f. Restoring from a backup

**From the encrypted dump:**
```bash
# Decrypt
gpg --batch --passphrase "YOUR_GPG_PASSPHRASE" --decrypt backup.pgdump.gpg > backup.pgdump

# Restore to a fresh Supabase project (get connection string from Supabase → Settings → Database)
pg_restore --clean --if-exists --no-owner --no-acl \
  -d "postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres" \
  backup.pgdump
```

**From a JSON export (simpler):**
On the Export page inside the app, click **Download JSON**. This file contains all your data
in a structured format and can be re-imported manually or via a migration script.
