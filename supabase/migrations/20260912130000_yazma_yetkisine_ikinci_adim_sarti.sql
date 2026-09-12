-- Yazma yetkisi artik ikinci adim dogrulamasi da istiyor.
--
-- Panele MFA eklemek tek basina yetmez: parolayi ele geciren biri bu sitenin
-- arayuzunu hic kullanmaz, Supabase'e dogrudan giris yapip PostgREST uzerinden
-- yazar. Arayuzdeki kapi o yoldan gecmiyor; gercek kontrol bu fonksiyon, cunku
-- butun icerik/galeri/medya politikalari ve storage.objects politikalari onu
-- cagiriyor.
--
-- Uyelik kontrolu `admin_uyesi()` olarak ayri duruyor (bkz. onceki migration):
-- panel "listede degilsin" ile "ikinci adimi gecmedin" durumlarini ayirmali.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.admin_uyesi() and (select auth.jwt() ->> 'aal') = 'aal2';
$$;
