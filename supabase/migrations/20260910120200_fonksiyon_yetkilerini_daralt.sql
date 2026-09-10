-- Postgres, public semasinda olusturulan her fonksiyona varsayilan olarak
-- PUBLIC'e EXECUTE verir. Bu, security definer fonksiyonlarimizi
-- /rest/v1/rpc/... altinda anon anahtarla cagirilabilir hale getiriyordu.
-- Ozellikle touch_draft() bir trigger fonksiyonu; API'den cagirilmasinin
-- hicbir mesru sebebi yok.

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.touch_draft() from public, anon, authenticated;
revoke execute on function public.publish_document(public.content_slug, integer) from public, anon;

-- "Enable automatic RLS" ayarinin kurdugu platform fonksiyonu. Event trigger
-- olarak sistem tarafindan calistirilir; API ucu olarak durmasi gereksiz.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Ihtiyac duyan tek rol authenticated; yetkiyi acikca geri veriyoruz.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.publish_document(public.content_slug, integer) to authenticated;

comment on table public.admin_users is
  'Bilerek politikasiz ve grantsiz: PostgREST uzerinden hicbir rol goremez. Yalnizca is_admin() (security definer) okur.';
