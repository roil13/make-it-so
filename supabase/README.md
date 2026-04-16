# Supabase Setup

## Apply the migration

**Option A — Supabase Dashboard (easiest)**
1. Open your project in [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `migrations/001_initial_schema.sql` and click **Run**

**Option B — Supabase CLI**
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## Environment variables

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these values in **Project Settings → API** in the Supabase dashboard.

## Auth

Enable **Email / Password** sign-in under **Authentication → Providers**.
