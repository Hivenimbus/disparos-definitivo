-- Add snapshot fields to dashboard_send_jobs
alter table dashboard_send_jobs
    add column if not exists message_template text,
    add column if not exists attachment_descriptors jsonb not null default '[]'::jsonb,
    add column if not exists attachments_snapshot jsonb not null default '[]'::jsonb,
    add column if not exists delay_seconds integer not null default 10,
    add column if not exists config_snapshot jsonb not null default '{}'::jsonb;

-- Add sequence/payload to logs for deterministic replay
alter table dashboard_send_job_logs
    add column if not exists sequence integer,
    add column if not exists contact_payload jsonb;

with ordered_logs as (
    select id,
           job_id,
           row_number() over (partition by job_id order by created_at asc) as seq
    from dashboard_send_job_logs
)
update dashboard_send_job_logs l
set sequence = o.seq
from ordered_logs o
where l.id = o.id
  and l.sequence is null;

update dashboard_send_job_logs l
set contact_payload = jsonb_build_object(
        'id', l.contact_id,
        'name', l.contact_name,
        'whatsapp', l.whatsapp,
        'var1', c.var1,
        'var2', c.var2,
        'var3', c.var3
    )
from dashboard_contacts c
where l.contact_payload is null
  and c.id = l.contact_id;

-- Fallback when the contato não existe mais
update dashboard_send_job_logs l
set contact_payload = jsonb_build_object(
        'id', l.contact_id,
        'name', l.contact_name,
        'whatsapp', l.whatsapp,
        'var1', null,
        'var2', null,
        'var3', null
    )
where l.contact_payload is null;

alter table dashboard_send_job_logs
    alter column sequence set not null,
    alter column contact_payload set not null;

create index if not exists dashboard_send_job_logs_job_id_sequence_idx
    on dashboard_send_job_logs (job_id, sequence);

