-- "Yayimlanmamis degisiklik var mi" sorusunun DOGRU cevabi.
--
-- Panel bu soruyu `content_drafts.lock_version <> content_documents.lock_version`
-- ile yanitliyordu. Iki sayac AYNI seyi saymiyor: taslaginki her otomatik
-- kayitta, dokumaninki her yayimda artiyor. Dolayisiyla ilk duzenlemeden sonra
-- bir daha asla esitlenmiyorlar ve rozet kalici olarak yaniyordu
-- (21.09.2026: cv 23/2, home 32/4 iken iki belgenin icerigi birebir ayniydi).
--
-- Dogru olcut iceriktir. Karsilastirma veritabaninda yapiliyor; aksi halde
-- panelin her acilisinda iki JSONB agaci (~160 KB) tarayiciya tasinirdi.
-- jsonb esitligi anahtar sirasindan etkilenmez, bu yuzden guvenli.
--
-- `security_invoker = true`: gorunum cagiranin yetkisiyle calisir, yani
-- alttaki tablolarin RLS'i gecerli kalir. Aksi halde gorunum sahibinin
-- yetkisiyle calisip taslagi RLS'in disina tasirdi.
create or replace view public.content_status
with (security_invoker = true) as
select
  d.slug,
  d.published_at,
  d.lock_version                          as published_version,
  t.updated_at                            as draft_updated_at,
  t.lock_version                          as draft_version,
  (t.data is distinct from d.published)    as bekleyen_var
from public.content_documents d
left join public.content_drafts t on t.slug = d.slug;

comment on view public.content_status is
  'Panel ozet gorunumu: yayim/taslak zamanlari ve icerik bazli bekleyen degisiklik bayragi.';

-- Taslak icerdigi icin anon rolune kapali; "Automatically expose new tables"
-- kapali olsa da acikca geri aliniyor.
revoke all on public.content_status from anon, public;
grant select on public.content_status to authenticated, service_role;
