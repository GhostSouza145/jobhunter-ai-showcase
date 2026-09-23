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
-- ============================================================================
-- JobHunter AI — Row Level Security
-- Cada usuário só pode ler/escrever os próprios dados. Vagas e catálogo de
-- skills são de leitura pública (para usuários autenticados); escrita nessas
-- tabelas é feita apenas pelo backend com a service_role key.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.skills enable row level security;
alter table public.candidate_skills enable row level security;
alter table public.jobs enable row level security;
alter table public.job_skills enable row level security;
alter table public.favorites enable row level security;
alter table public.search_preferences enable row level security;
alter table public.job_sources enable row level security;
alter table public.job_search_history enable row level security;

-- ---------------------------------------------------------------- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- ----------------------------------------------------------------- resumes
create policy "resumes_select_own" on public.resumes
  for select using (auth.uid() = user_id);

create policy "resumes_insert_own" on public.resumes
  for insert with check (auth.uid() = user_id);

create policy "resumes_update_own" on public.resumes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "resumes_delete_own" on public.resumes
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------ skills
-- catálogo público, leitura para qualquer usuário autenticado
create policy "skills_select_authenticated" on public.skills
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------- candidate_skills
create policy "candidate_skills_select_own" on public.candidate_skills
  for select using (auth.uid() = user_id);

create policy "candidate_skills_insert_own" on public.candidate_skills
  for insert with check (auth.uid() = user_id);

create policy "candidate_skills_update_own" on public.candidate_skills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "candidate_skills_delete_own" on public.candidate_skills
  for delete using (auth.uid() = user_id);

-- -------------------------------------------------------------------- jobs
-- vagas são normalizadas por um processo de servidor (service_role) e
-- somente lidas pelos usuários autenticados.
create policy "jobs_select_authenticated" on public.jobs
  for select using (auth.role() = 'authenticated');

-- -------------------------------------------------------------- job_skills
create policy "job_skills_select_authenticated" on public.job_skills
  for select using (auth.role() = 'authenticated');

-- --------------------------------------------------------------- favorites
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------- search_preferences
create policy "search_preferences_select_own" on public.search_preferences
  for select using (auth.uid() = user_id);

create policy "search_preferences_insert_own" on public.search_preferences
  for insert with check (auth.uid() = user_id);

create policy "search_preferences_update_own" on public.search_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "search_preferences_delete_own" on public.search_preferences
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------- job_sources
-- status das integrações é informativo e público para usuários autenticados
create policy "job_sources_select_authenticated" on public.job_sources
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------- job_search_history
create policy "job_search_history_select_own" on public.job_search_history
  for select using (auth.uid() = user_id);

create policy "job_search_history_insert_own" on public.job_search_history
  for insert with check (auth.uid() = user_id);

create policy "job_search_history_delete_own" on public.job_search_history
  for delete using (auth.uid() = user_id);
-- ============================================================================
-- JobHunter AI — funções e triggers
-- ============================================================================

-- Mantém updated_at sempre atualizado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_resumes
  before update on public.resumes
  for each row execute function public.set_updated_at();

create trigger set_updated_at_jobs
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger set_updated_at_search_preferences
  before update on public.search_preferences
  for each row execute function public.set_updated_at();

-- Cria automaticamente uma linha em profiles quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ============================================================================
-- JobHunter AI — seed de dados de referência
-- Catálogo inicial de skills usado pelo parser de currículo e pelo algoritmo
-- de match, e o registro das fontes de vagas conhecidas pela aplicação.
-- ============================================================================

insert into public.skills (name, slug, category) values
  ('JavaScript', 'javascript', 'language'),
  ('TypeScript', 'typescript', 'language'),
  ('Python', 'python', 'language'),
  ('Java', 'java', 'language'),
  ('C#', 'csharp', 'language'),
  ('C++', 'cpp', 'language'),
  ('Go', 'go', 'language'),
  ('PHP', 'php', 'language'),
  ('Ruby', 'ruby', 'language'),
  ('Kotlin', 'kotlin', 'language'),
  ('Swift', 'swift', 'language'),
  ('React', 'react', 'framework'),
  ('Next.js', 'nextjs', 'framework'),
  ('Vue', 'vue', 'framework'),
  ('Angular', 'angular', 'framework'),
  ('Node.js', 'nodejs', 'framework'),
  ('Express', 'express', 'framework'),
  ('NestJS', 'nestjs', 'framework'),
  ('Django', 'django', 'framework'),
  ('Flask', 'flask', 'framework'),
  ('Spring', 'spring', 'framework'),
  ('Laravel', 'laravel', 'framework'),
  ('.NET', 'dotnet', 'framework'),
  ('Tailwind CSS', 'tailwind-css', 'framework'),
  ('HTML', 'html', 'language'),
  ('CSS', 'css', 'language'),
  ('PostgreSQL', 'postgresql', 'database'),
  ('MySQL', 'mysql', 'database'),
  ('MongoDB', 'mongodb', 'database'),
  ('Redis', 'redis', 'database'),
  ('SQLite', 'sqlite', 'database'),
  ('Supabase', 'supabase', 'platform'),
  ('Firebase', 'firebase', 'platform'),
  ('AWS', 'aws', 'platform'),
  ('Azure', 'azure', 'platform'),
  ('Google Cloud', 'gcp', 'platform'),
  ('Docker', 'docker', 'tool'),
  ('Kubernetes', 'kubernetes', 'tool'),
  ('Git', 'git', 'tool'),
  ('GitHub', 'github', 'tool'),
  ('CI/CD', 'ci-cd', 'tool'),
  ('Figma', 'figma', 'tool'),
  ('Jest', 'jest', 'tool'),
  ('GraphQL', 'graphql', 'tool'),
  ('REST API', 'rest-api', 'tool'),
  ('Scrum', 'scrum', 'soft-skill'),
  ('Comunicação', 'comunicacao', 'soft-skill'),
  ('Trabalho em equipe', 'trabalho-em-equipe', 'soft-skill')
on conflict (slug) do nothing;

insert into public.job_sources (key, name, status) values
  ('demo', 'Vagas de demonstração', 'active'),
  ('remotive', 'Remotive (API pública)', 'active'),
  ('arbeitnow', 'Arbeitnow (API pública)', 'active'),
  ('indeed', 'Indeed', 'not_configured')
on conflict (key) do nothing;
-- ============================================================================
-- JobHunter AI — Storage bucket para currículos em PDF
-- Bucket privado: cada usuário só pode ler/escrever dentro da própria pasta
-- (primeiro segmento do caminho = auth.uid()).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "resumes_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_storage_update_own"
  on storage.objects for update
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_storage_delete_own"
  on storage.objects for delete
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
