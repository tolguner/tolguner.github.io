-- Uyelik kontrolunu yetki kontrolunden ayiriyoruz.
--
-- `is_admin()` yakinda ikinci adim dogrulamasi (aal2) da arayacak. Panelin
-- arayuzu ise "bu hesap listede mi" ile "ikinci adimi gecti mi" ayrimini
-- yapabilmeli: ikisi ayni fonksiyona bakarsa, MFA'yi henuz kurmamis admin'e
-- "yetkiniz yok" denir ve kurulum ekranina hic ulasamaz.
create or replace function public.admin_uyesi()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;

-- Postgres public semadaki her fonksiyona PUBLIC'e EXECUTE veriyor; anon
-- anahtarla /rest/v1/rpc/... uzerinden cagrilabilir olmasin.
revoke execute on function public.admin_uyesi() from public, anon;
grant execute on function public.admin_uyesi() to authenticated, service_role;
