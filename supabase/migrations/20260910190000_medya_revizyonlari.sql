-- Yuklenen her dosyanin kaydi. Eski dosyalar depodan zaten SILINMIYOR (daha
-- once paylasilmis baglantilar kirilmasin diye) ama yollari hicbir yerde
-- tutulmuyordu; yani dosya duruyor, ona donmenin yolu yoktu.
--
-- Icerikte revizyon gecmisi, galeride geri alma var; dosyalarda karsiligi yoktu.
create table public.media_revisions (
  id           uuid primary key default gen_random_uuid(),
  key          text        not null,
  storage_path text        not null,
  mime_type    text        not null,
  byte_size    integer     not null,
  version      integer     not null,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) on delete set null
);

create index media_revisions_key_created_idx on public.media_revisions (key, created_at desc);

alter table public.media_revisions enable row level security;

create policy "medya revizyonlarini admin okur" on public.media_revisions
  for select to authenticated using (public.is_admin());
create policy "medya revizyonu ekleme admin" on public.media_revisions
  for insert to authenticated with check (public.is_admin());

grant select, insert on public.media_revisions to authenticated;
grant select, insert, update, delete on public.media_revisions to service_role;

-- Bugunku dosyalari ilk surum olarak kaydet.
insert into public.media_revisions (key, storage_path, mime_type, byte_size, version, created_at)
select key, storage_path, mime_type, byte_size, version, updated_at
from public.media_assets;
