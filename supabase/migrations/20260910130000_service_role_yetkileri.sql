-- "Automatically expose new tables" kapali oldugu icin yeni tablolara hicbir
-- role varsayilan yetki verilmiyor; service_role da buna dahil. RLS'i atlamasi
-- yetmiyor, tablo duzeyinde GRANT de gerekiyor.
--
-- service_role anahtari gizlidir ve YALNIZCA yerelde (seed scripti) kullanilir;
-- Vercel'e konmaz. Admin paneli giris yapmis kullanici olarak RLS altinda yazar.

grant select, insert, update, delete on
  public.content_documents,
  public.content_drafts,
  public.content_revisions,
  public.gallery_photos,
  public.media_assets,
  public.admin_users
to service_role;

grant execute on function public.is_admin() to service_role;
grant execute on function public.publish_document(public.content_slug, integer) to service_role;
