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
