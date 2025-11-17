alter table dashboard_send_jobs
    add column if not exists pause_requested boolean not null default false,
    add column if not exists paused_at timestamptz,
    add column if not exists resume_token uuid;


