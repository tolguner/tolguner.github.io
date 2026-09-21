-- Is basvurusu takibi.
--
-- Veri sekli ucu platformun KENDI ekranlarindan cikarildi (tahminle degil):
--   LinkedIn "Is ilani takipcisi" : pozisyon, sirket, konum + calisma sekli,
--     goreli basvuru tarihi, "Basvuru goruntulendi", "Artik basvuru kabul
--     etmiyor", asamalar (Kaydedildi/Devam Ediyor/Basvuruldu/Mulakat/Arsiv)
--   Kariyer.net "Basvurularim"   : pozisyon, sirket, konum · calisma tercihi,
--     MUTLAK tarih, "Bekliyor" + Durum Guncelle
--   Youthall "Ilan Basvurulari"  : sirket, pozisyon, tarih, "Ilan yayinda"
--
-- `diger` platformu firmalarin kendi kariyer sayfalarindan yapilan basvurular
-- icin; onlar elle giriliyor ve senkronda dokunulmuyor.
--
-- BU TABLO OZEL VERI: hicbir anon erisimi yok. Okuma dahil her islem
-- `is_admin()` arkasinda, yani uyelik + ikinci adim dogrulamasi sart.

create type public.job_platform as enum ('linkedin', 'kariyernet', 'youthall', 'diger');

-- `devam_ediyor`: LinkedIn'deki "Devam Ediyor" — baslanmis ama bitirilmemis
-- basvuru. Takip etmeye deger: yarim kalan is listesi.
create type public.job_status as enum (
  'devam_ediyor', 'basvuruldu', 'goruntulendi', 'mulakat', 'teklif', 'olumsuz', 'geri_cekildi'
);

create type public.job_posting_status as enum ('acik', 'kapali', 'bilinmiyor');

create type public.job_work_mode as enum ('is_yerinde', 'hibrit', 'uzaktan');

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  platform public.job_platform not null,
  -- Platformun kendi ilan kimligi; yoksa "elle-<uuid>". Tekil olmasi senkronu
  -- idempotent yapiyor: ayni ilan her senkronda yeniden eklenmiyor.
  external_id text not null,
  company text not null,
  position text not null,
  location text,
  work_mode public.job_work_mode,
  job_url text,
  applied_at date,
  status public.job_status not null default 'basvuruldu',
  posting_status public.job_posting_status not null default 'bilinmiyor',
  notes text,
  source text not null default 'elle' check (source in ('senkron', 'elle')),
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, external_id)
);

create index job_applications_sira on public.job_applications (applied_at desc nulls last, created_at desc);

-- updated_at'i elle guncellemeyi unutmak sessiz bir hata; tetikleyici yazsin.
-- search_path sabit: advisor "function_search_path_mutable" uyarisi veriyordu.
create or replace function public.job_applications_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger job_applications_touch
  before update on public.job_applications
  for each row execute function public.job_applications_touch();

alter table public.job_applications enable row level security;

create policy "basvurulari admin okur"   on public.job_applications for select to authenticated using (public.is_admin());
create policy "basvuru ekleme admin"     on public.job_applications for insert to authenticated with check (public.is_admin());
create policy "basvuru guncelleme admin" on public.job_applications for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "basvuru silme admin"      on public.job_applications for delete to authenticated using (public.is_admin());

-- "Automatically expose new tables" kapali oldugu icin GRANT'lar elle
-- veriliyor; aksi halde service_role bile eremiyor.
grant select, insert, update, delete on public.job_applications to authenticated, service_role;

revoke execute on function public.job_applications_touch() from public, anon;
