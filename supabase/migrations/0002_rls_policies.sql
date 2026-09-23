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
