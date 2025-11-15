create table if not exists public.dashboard_send_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'queued' check (status = any(array['queued','processing','completed','failed','stopped']::text[])),
  total_contacts integer not null default 0 check (total_contacts >= 0),
  processed_contacts integer not null default 0 check (processed_contacts >= 0),
  success_contacts integer not null default 0 check (success_contacts >= 0),
  failed_contacts integer not null default 0 check (failed_contacts >= 0),
  requested_stop boolean not null default false,
  last_error text,
  last_contact_name text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dashboard_send_jobs_user_created_idx on public.dashboard_send_jobs (user_id, created_at desc);

