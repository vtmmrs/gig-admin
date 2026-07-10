-- Gig Admin v2.1 migration — run AFTER schema.sql (SQL Editor → Run)

-- Photo fields on public profiles
alter table public.profiles add column if not exists photo_url text;
alter table public.profiles add column if not exists gallery jsonb default '[]'::jsonb;

-- Photo storage bucket (public read, owners upload to their own folder)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos public read" on storage.objects
  for select using (bucket_id = 'photos');

create policy "photos owner upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
