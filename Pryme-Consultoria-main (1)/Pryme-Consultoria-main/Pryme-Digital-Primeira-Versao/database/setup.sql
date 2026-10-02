-- Execute uma vez no SQL Editor de um projeto Supabase dedicado à Pryme Digital.
create table if not exists public.pryme_leads (
 id uuid primary key,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 name text not null, business text not null, phone text not null,
 email text not null default '', segment text not null,
 service text not null default 'site', website_url text not null default '', goal text not null default '', timeline text not null default '', next_contact_at timestamptz,
 model text not null check (model in ('personal','studio','academia','custom')),
 need text not null, quote_price integer,
 status text not null default 'novo' check (status in ('novo','conversa','proposta','producao','concluido','arquivado')),
 notes text not null default '', files jsonb not null default '[]'::jsonb,
 consent_at timestamptz not null, request_hash text not null
);
alter table public.pryme_leads add column if not exists service text not null default 'site';
alter table public.pryme_leads add column if not exists website_url text not null default '';
alter table public.pryme_leads add column if not exists goal text not null default '';
alter table public.pryme_leads add column if not exists timeline text not null default '';
alter table public.pryme_leads add column if not exists next_contact_at timestamptz;
alter table public.pryme_leads enable row level security;
revoke all on public.pryme_leads from anon, authenticated;
grant select, insert, update, delete on public.pryme_leads to service_role;
create index if not exists pryme_leads_status_created on public.pryme_leads (status,created_at desc);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('pryme-brand','pryme-brand',false,1048576,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=1048576,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
-- Nenhuma política pública de leitura/gravação é criada. A API do servidor faz as operações.
