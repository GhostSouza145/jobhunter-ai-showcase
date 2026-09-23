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
