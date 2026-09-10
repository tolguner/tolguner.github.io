-- tolguner.me icerik semasi
--
-- Tasarim notlari:
--  * Iki icerik dokumani (home, cv) JSONB olarak tutulur. Tek yazarli bir
--    portfolyo icin 12-15 tablolu tam normalizasyon her okumada ic ice agaci
--    yeniden kurmayi gerektirirdi.
--  * Galeri gercekten bir liste (yukle/sil/sirala) oldugu icin normalize tablo.
--  * Taslak AYRI tabloda: PostgREST'te sutun bazli RLS yok, ayni satirda
--    tutulsaydi anon anahtarla okunabilirdi.
--  * Yetki `authenticated` rolune degil `admin_users` UYELIGINE bagli.
--    Supabase'te public signup varsayilan acik ve tekrar acilabilen bir kutu.

-- ---------------------------------------------------------------- turler

create type public.content_slug as enum ('home', 'cv');

-- ------------------------------------------------------------ admin kapisi

-- Politikasi ve grant'i YOK: PostgREST uzerinden hicbir rol goremez.
-- Yalnizca asagidaki security definer fonksiyonlar okur.
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- -------------------------------------------------------------- dokumanlar

create table public.content_documents (
  slug         public.content_slug primary key,
  published    jsonb       not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null,
  lock_version integer     not null default 1
);
alter table public.content_documents enable row level security;

-- Iki satir seed'den gelir; insert/delete politikasi bilerek yok.
create policy "yayimlanani herkes okur" on public.content_documents
  for select to anon, authenticated using (true);
create policy "yayimlanani admin gunceller" on public.content_documents
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.content_documents to anon, authenticated;
grant update on public.content_documents to authenticated;

-- ----------------------------------------------------------------- taslak

create table public.content_drafts (
  slug         public.content_slug primary key
                 references public.content_documents (slug) on delete cascade,
  data         jsonb       not null,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  lock_version integer     not null default 1
);
alter table public.content_drafts enable row level security;

-- anon'a hicbir sey verilmiyor: taslak disariya kapali.
create policy "taslagi admin okur" on public.content_drafts
  for select to authenticated using (public.is_admin());
create policy "taslagi admin yazar" on public.content_drafts
  for insert to authenticated with check (public.is_admin());
create policy "taslagi admin gunceller" on public.content_drafts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update on public.content_drafts to authenticated;

-- Her guncellemede surum artar; iki sekme acik kalirsa catisma yakalanir.
create function public.touch_draft() returns trigger
  language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at   := now();
  new.updated_by   := (select auth.uid());
  new.lock_version := old.lock_version + 1;
  return new;
end;
$$;

create trigger content_drafts_touch
  before update on public.content_drafts
  for each row execute function public.touch_draft();

-- -------------------------------------------------------------- revizyonlar

-- JSONB-blob CMS'in tipik hatasi "yanlis alana yapistirdim ve yayimladim".
create table public.content_revisions (
  id         uuid primary key default gen_random_uuid(),
  slug       public.content_slug not null,
  data       jsonb not null,
  kind       text  not null check (kind in ('publish', 'restore', 'seed')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create index content_revisions_slug_created_idx
  on public.content_revisions (slug, created_at desc);
alter table public.content_revisions enable row level security;

-- Yalnizca okuma; satirlari asagidaki RPC (security definer) yazar.
create policy "revizyonlari admin okur" on public.content_revisions
  for select to authenticated using (public.is_admin());

grant select on public.content_revisions to authenticated;

-- ------------------------------------------------------------------ galeri

create table public.gallery_photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text    not null unique,
  caption_tr   text    not null default '',
  caption_en   text    not null default '',
  width        integer,
  height       integer,
  -- Bilerek UNIQUE degil: unique olsaydi iki fotografin sirasi takas edilemezdi.
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index gallery_photos_sira_idx on public.gallery_photos (sort_order, created_at);
alter table public.gallery_photos enable row level security;

create policy "yayimlanan fotograflari herkes okur" on public.gallery_photos
  for select to anon, authenticated using (is_published);
create policy "tum fotograflari admin okur" on public.gallery_photos
  for select to authenticated using (public.is_admin());
create policy "fotograf ekleme admin" on public.gallery_photos
  for insert to authenticated with check (public.is_admin());
create policy "fotograf guncelleme admin" on public.gallery_photos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "fotograf silme admin" on public.gallery_photos
  for delete to authenticated using (public.is_admin());

grant select on public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.gallery_photos to authenticated;

-- ------------------------------------------------------------------ medya

-- cv_tr, cv_en, ileride og / portrait. hero.cvFile sabit yol olmaktan cikip
-- bu anahtardan cozulur.
create table public.media_assets (
  key          text primary key,
  storage_path text    not null,
  mime_type    text    not null,
  byte_size    integer not null,
  version      integer not null default 1,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null
);
alter table public.media_assets enable row level security;

create policy "medyayi herkes okur" on public.media_assets
  for select to anon, authenticated using (true);
create policy "medya ekleme admin" on public.media_assets
  for insert to authenticated with check (public.is_admin());
create policy "medya guncelleme admin" on public.media_assets
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "medya silme admin" on public.media_assets
  for delete to authenticated using (public.is_admin());

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;

-- ---------------------------------------------------------------- yayimlama

-- Taslagi yayimlar, revizyon satirini yazar, surum uyusmazliginda hata verir.
create function public.publish_document(
  p_slug         public.content_slug,
  p_lock_version integer
) returns public.content_documents
  language plpgsql security definer set search_path = ''
as $$
declare
  v_draft public.content_drafts;
  v_doc   public.content_documents;
begin
  if not public.is_admin() then
    raise exception 'yetkisiz' using errcode = '42501';
  end if;

  select * into v_draft from public.content_drafts where slug = p_slug for update;
  if not found then
    raise exception 'taslak bulunamadi: %', p_slug using errcode = 'P0002';
  end if;

  if v_draft.lock_version <> p_lock_version then
    raise exception 'surum uyusmazligi (taslak %, gonderilen %) - sayfayi yeniden yukleyin',
      v_draft.lock_version, p_lock_version using errcode = '40001';
  end if;

  update public.content_documents d
     set published    = v_draft.data,
         published_at = now(),
         published_by = (select auth.uid()),
         lock_version = d.lock_version + 1
   where d.slug = p_slug
   returning d.* into v_doc;

  insert into public.content_revisions (slug, data, kind, created_by)
  values (p_slug, v_draft.data, 'publish', (select auth.uid()));

  return v_doc;
end;
$$;

grant execute on function public.publish_document(public.content_slug, integer) to authenticated;
