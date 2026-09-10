-- upsert ile yukleme "INSERT ... ON CONFLICT DO UPDATE" uretir; Postgres
-- catisan satiri okumak zorunda oldugu icin SELECT politikasi da gerekir.
-- Yalnizca INSERT/UPDATE/DELETE tanimlanmisti, bu yuzden upsert'li her yukleme
-- "new row violates row-level security policy" ile reddediliyordu — hicbir
-- politika eslesmedigi icin, kosulun icerigiyle ilgisi yoktu.
--
-- Kovalar zaten public (dosya okuma CDN uzerinden herkese acik); bu politika
-- object SATIRLARINI okumakla ilgili ve admin uyeligiyle sinirli.
create policy "kova satirlarini admin okur" on storage.objects
  for select to authenticated
  using (bucket_id in ('gallery', 'documents') and public.is_admin());
