-- iGravt — schema inicial
-- Rode este script no SQL Editor do seu projeto Supabase
-- (Project > SQL Editor > New query > cole e clique em "Run").
--
-- Cobre o núcleo do MVP descrito no TCC: estabelecimentos, clientes,
-- lançamento de consumo/pontos, pesquisas NPS e roleta de recompensas.

create extension if not exists "pgcrypto";

-- ============ ADMINS DA PLATAFORMA (equipe GRAVT) ============
-- Só quem está nesta tabela pode acessar /admin e criar estabelecimentos.
-- Não tem policy de leitura pública — só é consultada via service role.
create table if not exists platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table platform_admins enable row level security;

-- ============ ESTABELECIMENTOS ============
create table if not exists establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  whatsapp_number text,
  plan text not null default 'essencial' check (plan in ('essencial', 'profissional', 'estrategico')),
  created_at timestamptz not null default now()
);

-- Vincula usuários autenticados (garçom/gestor) a um estabelecimento.
create table if not exists staff_members (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'waiter' check (role in ('owner', 'manager', 'waiter')),
  created_at timestamptz not null default now(),
  unique (establishment_id, user_id)
);

-- ============ CLIENTES ============
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  whatsapp_number text not null,
  name text,
  birthday date,
  points_balance integer not null default 0,
  visits_count integer not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique (establishment_id, whatsapp_number)
);

create index if not exists idx_customers_establishment on customers(establishment_id);
create index if not exists idx_customers_whatsapp on customers(whatsapp_number);

-- ============ LANÇAMENTO DE CONSUMO (ledger de pontos) ============
create table if not exists consumption_records (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  staff_user_id uuid references auth.users(id),
  amount_cents integer not null check (amount_cents >= 0),
  points_awarded integer not null check (points_awarded >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_consumption_establishment on consumption_records(establishment_id);
create index if not exists idx_consumption_customer on consumption_records(customer_id);

-- ============ PESQUISAS NPS ============
create table if not exists nps_responses (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  consumption_record_id uuid references consumption_records(id) on delete set null,
  score smallint not null check (score between 0 and 10),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_nps_establishment on nps_responses(establishment_id);

-- ============ RECOMPENSAS / ROLETA ============
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  label text not null,
  reward_type text not null check (reward_type in ('percent_off', 'free_item', 'cashback', 'other')),
  points_cost integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists roulette_spins (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  nps_response_id uuid references nps_responses(id) on delete set null,
  reward_id uuid references rewards(id),
  coupon_code text unique,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_spins_establishment on roulette_spins(establishment_id);
create index if not exists idx_spins_customer on roulette_spins(customer_id);

-- ============ RLS ============
-- Todas as tabelas ficam bloqueadas por padrão; só membros da equipe do
-- próprio estabelecimento (via staff_members) leem/escrevem seus dados.
-- Escritas feitas pelo cliente final (cadastro, NPS, giro da roleta) devem
-- passar por uma rota de servidor usando a service role key — não pela
-- anon key direto do navegador.

alter table establishments enable row level security;
alter table staff_members enable row level security;
alter table customers enable row level security;
alter table consumption_records enable row level security;
alter table nps_responses enable row level security;
alter table rewards enable row level security;
alter table roulette_spins enable row level security;

create or replace function is_staff_of(target_establishment uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_members
    where establishment_id = target_establishment
      and user_id = auth.uid()
  );
$$;

-- drop+create em cada policy para o script poder ser re-executado sem
-- erro (CREATE POLICY não aceita IF NOT EXISTS no Postgres).
drop policy if exists "staff read own establishment" on establishments;
create policy "staff read own establishment" on establishments
  for select using (is_staff_of(id));

drop policy if exists "staff manage own staff_members" on staff_members;
create policy "staff manage own staff_members" on staff_members
  for all using (is_staff_of(establishment_id));

drop policy if exists "staff manage own customers" on customers;
create policy "staff manage own customers" on customers
  for all using (is_staff_of(establishment_id));

drop policy if exists "staff manage own consumption_records" on consumption_records;
create policy "staff manage own consumption_records" on consumption_records
  for all using (is_staff_of(establishment_id));

drop policy if exists "staff manage own nps_responses" on nps_responses;
create policy "staff manage own nps_responses" on nps_responses
  for all using (is_staff_of(establishment_id));

drop policy if exists "staff manage own rewards" on rewards;
create policy "staff manage own rewards" on rewards
  for all using (is_staff_of(establishment_id));

drop policy if exists "staff manage own roulette_spins" on roulette_spins;
create policy "staff manage own roulette_spins" on roulette_spins
  for all using (is_staff_of(establishment_id));
