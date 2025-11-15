create table if not exists public.dashboard_send_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dashboard_send_jobs(id) on delete cascade,
  contact_id uuid,
  contact_name text,
  whatsapp text not null,
  status text not null default 'pending' check (status = any(array['pending','success','failed']::text[])),
  message_preview text,
  attachments jsonb,
  error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dashboard_send_job_logs_job_id_idx on public.dashboard_send_job_logs (job_id, created_at desc);

