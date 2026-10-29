-- Is portali: staj sirasinda tutulan kisisel bilgi bankasi (markdown sayfalar).
--
-- Bu depo herkese acik. Sayfalarin ICERIGI hicbir zaman bu dosyaya, seed'e ya da
-- commit mesajina girmez; yalnizca veritabaninda durur ve yalnizca panelden ya da
-- yetkili istemciden yazilir. Burada sadece tablo yapisi var.
--
-- `verified = false`: dogrulanmamis, kulaktan duyma ya da tahmine dayali bilgi.
-- Panel bu sayfalari "dogrulanmadi" rozetiyle gosterir.
--
-- OZEL VERI. Anon erisimi yok, her islem `is_admin()` (uyelik + aal2) arkasinda.

create table public.work_portal_pages (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  category text not null check (category in ('genel', 'sistem', 'surec', 'ag', 'sozluk', 'soru')),
  title text not null check (length(trim(title)) > 0),
  summary text,
  body_md text not null default '',
  sort smallint not null default 0,
  verified boolean not null default false,
  updated_at timestamptz not null default now()
);

create index work_portal_pages_sira on public.work_portal_pages (category, sort, title);

create or replace function public.work_portal_pages_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger work_portal_pages_touch
  before update on public.work_portal_pages
  for each row execute function public.work_portal_pages_touch();

alter table public.work_portal_pages enable row level security;

create policy "portali admin okur"     on public.work_portal_pages for select to authenticated using (public.is_admin());
create policy "portal ekleme admin"    on public.work_portal_pages for insert to authenticated with check (public.is_admin());
create policy "portal guncelleme admin" on public.work_portal_pages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "portal silme admin"     on public.work_portal_pages for delete to authenticated using (public.is_admin());

revoke all on public.work_portal_pages from anon, public;
grant select, insert, update, delete on public.work_portal_pages to authenticated, service_role;
