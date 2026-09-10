-- Iki kova da PUBLIC: imzali URL suresi dolar, CDN onbellegini bozar ve
-- kaydedilmis PDF linklerini kirar. Dosya adlari icerik adresli uuid olacagi
-- icin tahmin edilebilirlik sorunu yok.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',   'gallery',   true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('documents', 'documents', true, 20971520, array['application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Okuma kovanin public olmasindan geliyor; yazma yalnizca admin uyeligiyle.
create policy "kovalara admin yukler" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('gallery', 'documents') and public.is_admin());

create policy "kovalari admin gunceller" on storage.objects
  for update to authenticated
  using (bucket_id in ('gallery', 'documents') and public.is_admin())
  with check (bucket_id in ('gallery', 'documents') and public.is_admin());

create policy "kovalardan admin siler" on storage.objects
  for delete to authenticated
  using (bucket_id in ('gallery', 'documents') and public.is_admin());
