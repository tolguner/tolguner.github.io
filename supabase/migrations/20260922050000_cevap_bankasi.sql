-- Basvuru formlari icin cevap bankasi.
--
-- Basvuru formlari hep ayni sorulari soruyor: telefon, mezuniyet tarihi,
-- staja baslama tarihi, haftada kac gun, ucret beklentisi, "kac yillik Python
-- deneyiminiz var"... Basvuru sirasinda bu sorulara YALNIZCA Tolga'nin
-- onayladigi cevaplar yazilir. `confirmed = false` olan satir bir oneridir
-- (CV'den doldurulmus) ve kullanilmaz; bankada olmayan ya da onaylanmamis bir
-- soru gelirse basvuru durur ve Tolga'ya sorulur. Uydurmama kurali veri
-- modelinde: onaysiz cevap forma giremez.
--
-- `sensitive`: onayli olsa bile forma yazilmadan once Tolga'ya soylenir
-- (telefon, askerlik, dogum yili...).
--
-- OZEL VERI. Anon erisimi yok, her islem `is_admin()` arkasinda. Cevaplar bu
-- depoya (herkese acik) HICBIR ZAMAN yazilmaz; yalnizca veritabaninda durur.

create table public.application_answers (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  category text not null check (category in (
    'iletisim', 'egitim', 'staj', 'calisma', 'ucret', 'dil', 'deneyim', 'baglanti', 'kisisel', 'tanitim'
  )),
  question text not null,
  hint text,
  answer text,
  answer_en text,
  confirmed boolean not null default false,
  sensitive boolean not null default false,
  sort smallint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.application_answers_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger application_answers_touch
  before update on public.application_answers
  for each row execute function public.application_answers_touch();

alter table public.application_answers enable row level security;

create policy "cevaplari admin okur"   on public.application_answers for select to authenticated using (public.is_admin());
create policy "cevap ekleme admin"     on public.application_answers for insert to authenticated with check (public.is_admin());
create policy "cevap guncelleme admin" on public.application_answers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "cevap silme admin"      on public.application_answers for delete to authenticated using (public.is_admin());

revoke all on public.application_answers from anon, public;
grant select, insert, update, delete on public.application_answers to authenticated, service_role;
