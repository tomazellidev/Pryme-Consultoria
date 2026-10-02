-- Execute no SQL Editor de um projeto Supabase dedicado à Pryme Digital. Pode ser repetido para atualizar um banco já configurado.
create table if not exists public.pryme_leads (
 id uuid primary key,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 name text not null, business text not null, phone text not null,
 email text not null default '', segment text not null,
 service text not null default 'site', website_url text not null default '', goal text not null default '', timeline text not null default '', next_contact_at timestamptz,
 model text not null check (model in ('personal','studio','academia','custom')),
 need text not null, quote_price integer, sale_value numeric(12,2), sold_at date,
 status text not null default 'novo' check (status in ('novo','conversa','proposta','producao','concluido','arquivado')),
 notes text not null default '', files jsonb not null default '[]'::jsonb,
 consent_at timestamptz not null, request_hash text not null
);
alter table public.pryme_leads add column if not exists service text not null default 'site';
alter table public.pryme_leads add column if not exists website_url text not null default '';
alter table public.pryme_leads add column if not exists goal text not null default '';
alter table public.pryme_leads add column if not exists timeline text not null default '';
alter table public.pryme_leads add column if not exists next_contact_at timestamptz;
alter table public.pryme_leads add column if not exists sale_value numeric(12,2);
alter table public.pryme_leads add column if not exists sold_at date;
alter table public.pryme_leads enable row level security;
revoke all on public.pryme_leads from anon, authenticated;
grant select, insert, update, delete on public.pryme_leads to service_role;
create index if not exists pryme_leads_status_created on public.pryme_leads (status,created_at desc);
create index if not exists pryme_leads_sold_at on public.pryme_leads (sold_at) where sold_at is not null;
create index if not exists pryme_leads_next_contact on public.pryme_leads (next_contact_at) where next_contact_at is not null;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('pryme-brand','pryme-brand',false,1048576,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=1048576,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
-- Nenhuma política pública de leitura/gravação é criada. A API do servidor faz as operações.
-- Indicadores agregados do painel. Não retorna dados pessoais dos clientes.
create or replace function public.pryme_admin_dashboard()
returns jsonb
language sql
security invoker
set search_path = public
as $$
with month_range as (
 select generate_series(
  date_trunc('month', current_date::timestamp) - interval '11 months',
  date_trunc('month', current_date::timestamp),
  interval '1 month'
 ) as month_start
), orders_by_month as (
 select date_trunc('month', created_at) as month_start, count(*) as orders
 from public.pryme_leads
 where created_at >= date_trunc('month', current_date::timestamp) - interval '11 months'
 group by 1
), sales_by_month as (
 select date_trunc('month', sold_at::timestamp) as month_start,
        count(*) as sales,
        coalesce(sum(sale_value), 0) as revenue
 from public.pryme_leads
 where sold_at is not null and sale_value is not null
   and sold_at >= (date_trunc('month', current_date::timestamp) - interval '11 months')::date
 group by 1
)
select jsonb_build_object(
 'total_orders', (select count(*) from public.pryme_leads),
 'pipeline', jsonb_build_object(
  'novo', (select count(*) from public.pryme_leads where status = 'novo'),
  'conversa', (select count(*) from public.pryme_leads where status = 'conversa'),
  'proposta', (select count(*) from public.pryme_leads where status = 'proposta'),
  'producao', (select count(*) from public.pryme_leads where status = 'producao'),
  'concluido', (select count(*) from public.pryme_leads where status = 'concluido'),
  'arquivado', (select count(*) from public.pryme_leads where status = 'arquivado')
 ),
 'sales_count', (select count(*) from public.pryme_leads where sale_value is not null and sold_at is not null),
 'total_revenue', (select coalesce(sum(sale_value), 0) from public.pryme_leads where sale_value is not null and sold_at is not null),
 'average_ticket', (select coalesce(avg(sale_value), 0) from public.pryme_leads where sale_value is not null and sold_at is not null),
 'closed_without_value', (select count(*) from public.pryme_leads where status = 'concluido' and (sale_value is null or sold_at is null)),
 'followups', jsonb_build_object(
  'overdue', (select count(*) from public.pryme_leads where next_contact_at::date < current_date and status not in ('concluido','arquivado')),
  'next_7_days', (select count(*) from public.pryme_leads where next_contact_at::date between current_date and current_date + 7 and status not in ('concluido','arquivado'))
 ),
 'monthly', coalesce((
  select jsonb_agg(jsonb_build_object(
   'month', to_char(m.month_start, 'YYYY-MM'),
   'orders', coalesce(o.orders, 0),
   'sales', coalesce(s.sales, 0),
   'revenue', coalesce(s.revenue, 0)
  ) order by m.month_start)
  from month_range m
  left join orders_by_month o using (month_start)
  left join sales_by_month s using (month_start)
 ), '[]'::jsonb)
);
$$;
revoke all on function public.pryme_admin_dashboard() from public, anon, authenticated;
grant execute on function public.pryme_admin_dashboard() to service_role;
