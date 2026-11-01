# SiteFlow — Construction Project Management

SiteFlow is a React + TypeScript application packaged for web and Android (Capacitor-ready). Supabase is the only application backend:

- Supabase Auth — registration, login and session management.
- Supabase PostgreSQL — profiles, projects, tasks, daily logs, expenses, documents and activity records.
- Supabase Storage — private project documents and site photographs.
- Supabase Realtime — live updates to the application data.
- Row Level Security (RLS) — project and role-based data access.

There are no Firebase dependencies, demo users, seeded records, local-storage database fallbacks or sample-reset controls.

## 1. Requirements

- Node.js 20.19+ (or a Node version supported by your Vite release)
- npm
- A Supabase project
- Android Studio and Android SDK if building the Android package

## 2. Install

```bash
npm install
cp .env.example .env
```

Set the following values in `.env` using **Supabase Dashboard → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use the publishable/anon client key only. Never put a Supabase `service_role` or secret key in a Vite variable or Android application.

## 3. Create the database and storage buckets

1. Open **Supabase Dashboard → SQL Editor**.
2. Open `supabase/schema.sql` from this project.
3. Run the entire script in a new/empty Supabase project.
4. The script creates the PostgreSQL tables, indexes, auth profile trigger, RLS policies, private Storage buckets and Realtime publication membership.
5. In **Database → Replication**, verify Realtime is enabled for `projects`, `tasks`, `daily_logs`, `expenses`, `documents` and `activities` if your project does not automatically apply the publication change.

The app expects these tables:

`profiles`, `projects`, `project_members`, `tasks`, `daily_logs`, `expenses`, `documents`, `activities`.

The Storage buckets are `project-documents` and `daily-log-photos`. They are private. The app creates short-lived signed URLs for uploaded files.

## 4. Create the first administrator

1. Start the app and register your own account.
2. If email confirmation is enabled, confirm the address and sign in.
3. In Supabase SQL Editor, promote that account (replace the email):

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

4. Sign out and sign in again so the application reloads your role.
5. Register additional users. New accounts are assigned the restricted `client` role by the database trigger.
6. An administrator can assign roles in **Table Editor → profiles** by changing the `role` field to `pm`, `supervisor` or `client`.

Do not allow public sign-up metadata to choose an elevated role. The database trigger intentionally always assigns `client`.

## 5. Assign users to projects

When an administrator creates a project and selects a PM/supervisor, the app creates `project_members` rows for those accounts. To assign a client (or another member) to an existing project, use the SQL Editor with the actual UUIDs:

```sql
insert into public.project_members (project_id, user_id, assigned_role)
values ('PROJECT_UUID', 'AUTH_USER_UUID', 'client')
on conflict (project_id, user_id) do nothing;
```

RLS controls which project records each member can read. The client portal displays actual project tasks, progress, compliance fields and uploaded daily-log photographs; it no longer contains fixed sample project information.

## 6. Run locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal (normally `http://localhost:3000`).

Check the production build:

```bash
npm run build
npm run lint
```

## 7. Android build (Capacitor)

The source remains a React application and the project has not yet generated the native Android wrapper. To package it:

Capacitor dependencies and `capacitor.config.ts` are included in this project. After `npm install`, run:

```bash
npx cap add android
npm run android:sync
npm run android:open
```

Build and run the app from Android Studio. The same `.env` Supabase URL and publishable key are bundled into the web assets at build time; they are client credentials and must be protected by RLS, not treated as secrets.

## 8. Data behaviour

- All business data starts empty and is loaded from Supabase after authentication.
- Create/update/delete actions write to PostgreSQL; failed writes throw an error rather than silently saving to a local fallback.
- Realtime subscriptions keep the project, task, daily-log, expense, document and activity lists current.
- Document and photo files are uploaded to private Storage buckets; metadata, Storage paths and expiring signed URLs are stored in PostgreSQL/JSONB.
- Signed asset URLs expire after one hour and are regenerated when the app reloads.
- Deleting an account or project should be treated as a privileged administrative operation. Back up production data before bulk changes.

## 9. Security notes before production

- Review `supabase/schema.sql` against your organisation's exact roles and workflows before deployment.
- Test RLS using Supabase's local development tools or test accounts for every role.
- The default policies are intentionally restrictive. Supervisors can submit site reports and expenses, but financial reads are restricted to admins/PMs. Clients can read assigned project information but cannot write it.
- Profile role changes are admin-only. Promote the first admin using the SQL procedure above.
- Never ship a service-role key in the frontend.
- Add password reset, email verification and account recovery workflows before public rollout.
- Consider audit retention, expense approval, document versioning and backups for production use.
