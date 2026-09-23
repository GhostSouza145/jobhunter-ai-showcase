-- ============================================================================
-- JobHunter AI — schema inicial
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: dados do candidato, 1:1 com auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  professional_area text,
  level text check (level in ('estagio', 'trainee', 'junior', 'pleno', 'senior')),
  employment_types text[] not null default '{}',
  modality text[] not null default '{}',
  location text,
  technologies text[] not null default '{}',
  interests text[] not null default '{}',
  experience text,
  education text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil profissional do candidato, editável pelo próprio usuário.';

-- ----------------------------------------------------------------------------
-- resumes: currículos enviados em PDF e dados extraídos
-- ----------------------------------------------------------------------------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  raw_text text,
  parsed jsonb not null default '{}'::jsonb,
  status text not null default 'processing' check (status in ('processing', 'parsed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.resumes is 'Currículos em PDF enviados pelo usuário e o resultado da extração de texto/dados.';

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resumes_status_idx on public.resumes (status);

-- ----------------------------------------------------------------------------
-- skills: catálogo de referência de tecnologias/habilidades
-- ----------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category text not null default 'other'
    check (category in ('language', 'framework', 'database', 'tool', 'platform', 'soft-skill', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists skills_category_idx on public.skills (category);

-- ----------------------------------------------------------------------------
-- candidate_skills: habilidades associadas a um candidato
-- ----------------------------------------------------------------------------
create table if not exists public.candidate_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  source text not null default 'resume' check (source in ('resume', 'manual')),
  created_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create index if not exists candidate_skills_user_id_idx on public.candidate_skills (user_id);

-- ----------------------------------------------------------------------------
-- jobs: vagas normalizadas, agregadas de múltiplas fontes
-- ----------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_job_id text not null,
  title text not null,
  company text not null,
  description text not null default '',
  location text,
  remote text check (remote in ('remote', 'hybrid', 'onsite')),
  employment_type text,
  level text check (level in ('estagio', 'trainee', 'junior', 'pleno', 'senior', null)),
  salary text,
  url text not null,
  published_at timestamptz,
  requirements text[] not null default '{}',
  technologies text[] not null default '{}',
  is_demo boolean not null default false,
  dedupe_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_job_id)
);

create index if not exists jobs_dedupe_hash_idx on public.jobs (dedupe_hash);
create index if not exists jobs_source_idx on public.jobs (source);
create index if not exists jobs_published_at_idx on public.jobs (published_at desc);
create index if not exists jobs_remote_idx on public.jobs (remote);
create index if not exists jobs_technologies_idx on public.jobs using gin (technologies);
create index if not exists jobs_requirements_idx on public.jobs using gin (requirements);

-- ----------------------------------------------------------------------------
-- job_skills: normalização de tecnologias por vaga, com peso do requisito
-- ----------------------------------------------------------------------------
create table if not exists public.job_skills (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  requirement_level text not null default 'desired' check (requirement_level in ('required', 'desired', 'differential')),
  unique (job_id, skill_id)
);

create index if not exists job_skills_job_id_idx on public.job_skills (job_id);
create index if not exists job_skills_skill_id_idx on public.job_skills (skill_id);

-- ----------------------------------------------------------------------------
-- favorites: vagas salvas pelo usuário
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);

-- ----------------------------------------------------------------------------
-- search_preferences: preferências de busca de vagas do usuário
-- ----------------------------------------------------------------------------
create table if not exists public.search_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  professional_area text,
  employment_types text[] not null default '{}',
  modality text[] not null default '{}',
  technologies text[] not null default '{}',
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- job_sources: registro/status das fontes de vagas configuradas
-- ----------------------------------------------------------------------------
create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  status text not null default 'not_configured' check (status in ('active', 'not_configured', 'error')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- job_search_history: histórico de buscas/visualizações do usuário
-- ----------------------------------------------------------------------------
create table if not exists public.job_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filters jsonb not null default '{}'::jsonb,
  results_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists job_search_history_user_id_idx on public.job_search_history (user_id, created_at desc);
