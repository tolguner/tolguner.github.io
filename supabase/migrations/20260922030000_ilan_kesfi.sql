-- Ilan kesfi: henuz basvurulmamis, Tolga'ya uygun olabilecek ilanlar.
--
-- `job_applications` basvurulmus ilanlari tutuyor; bu tablo onun bir adim
-- oncesi. Gunluk kesif gorevi platformlarin arama sayfalarindan ve ilan uyari
-- e-postalarindan aday ilan toplar, CV'ye gore puanlar ve buraya yazar.
-- Tolga panelde "Listeye al" ya da "Ilgilenmiyorum" der. Basvuru yapilinca
-- ilan `job_applications`'a gecer ve burada `basvuruldu` olur.
--
-- Hicbir sey buradan kendiliginden GONDERILMEZ: gonderim yalnizca Tolga'nin
-- sohbette verdigi acik onayla, platformun kendi formundan yapilir.
--
-- OZEL VERI: anon erisimi yok, her islem `is_admin()` arkasinda.

create type public.job_posting_decision as enum ('yeni', 'listede', 'ilgilenmiyorum', 'basvuruldu');
create type public.job_posting_kind as enum ('staj', 'yeni_mezun', 'belirsiz');

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  platform public.job_platform not null,
  -- Platformun ilan kimligi (LinkedIn/Kariyer.net sayi, Youthall URL yolu).
  -- `job_applications` ile ayni bicim: eslestirme bu alanla yapiliyor.
  external_id text not null,
  company text not null,
  position text not null,
  location text,
  work_mode public.job_work_mode,
  job_url text not null,
  kind public.job_posting_kind not null default 'belirsiz',
  -- LinkedIn "Kolay Basvuru" ya da platformun kendi formu: hesap acmadan,
  -- platform icinde doldurulabiliyor mu.
  easy_apply boolean,
  deadline date,
  -- Ilan metninin kisa ozeti; puanlama ve on yazi icin. Tam metin tutulmuyor.
  summary text,
  -- 0-100. `areas`: veri, urun, yazilim, erp.
  score smallint check (score between 0 and 100),
  score_reasons text[] not null default '{}',
  areas text[] not null default '{}',
  decision public.job_posting_decision not null default 'yeni',
  source text not null check (source in ('arama', 'uyari_eposta', 'elle')),
  found_at timestamptz not null default now(),
  decided_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (platform, external_id)
);

create index job_postings_sira on public.job_postings (decision, score desc nulls last, found_at desc);

create or replace function public.job_postings_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.decision is distinct from old.decision then
    new.decided_at := now();
  end if;
  return new;
end;
$$;

create trigger job_postings_touch
  before update on public.job_postings
  for each row execute function public.job_postings_touch();

alter table public.job_postings enable row level security;

create policy "ilanlari admin okur"   on public.job_postings for select to authenticated using (public.is_admin());
create policy "ilan ekleme admin"     on public.job_postings for insert to authenticated with check (public.is_admin());
create policy "ilan guncelleme admin" on public.job_postings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "ilan silme admin"      on public.job_postings for delete to authenticated using (public.is_admin());

revoke all on public.job_postings from anon, public;
grant select, insert, update, delete on public.job_postings to authenticated, service_role;
