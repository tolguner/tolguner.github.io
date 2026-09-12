-- Yayimlama artik UST DUZEY ALAN SILEMIYOR.
--
-- Yasanan olay: `baglantilar` alani bir migration ile eklendi; panelde acik
-- olan duzenleme oturumunun bellegindeki dokuman ise migration'dan onceydi.
-- Panel dokumanin TAMAMINI yazdigi icin taslaktan silindi, yayimlama da
-- taslagi published uzerine kopyaladi. Sonuc: ana sayfada
-- `href="mailto:undefined"` ve hic render edilmeyen CV/GitHub/LinkedIn
-- baglantilari. Hicbir yerde hata yoktu, kimse fark etmedi.
--
-- Bundan sonra taslak, yayimdaki bir ust duzey alani icermiyorsa yayimlama
-- hata veriyor ve hangi alanlarin eksik oldugunu soyluyor. Alan silmek
-- gerekirse bunu bilincli bir migration yapar; kaza ile olmaz.
--
-- Yalnizca UST duzey kontrol ediliyor: derin karsilastirma normal icerik
-- silmeyi (bir yolculuk duragini kaldirmak gibi) da engellerdi.
create or replace function public.publish_document(p_slug public.content_slug, p_lock_version integer)
returns public.content_documents
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_draft  public.content_drafts;
  v_doc    public.content_documents;
  v_eksik  text[];
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

  select array_agg(anahtar) into v_eksik
  from jsonb_object_keys((select published from public.content_documents where slug = p_slug)) as anahtar
  where not (v_draft.data ? anahtar);

  if v_eksik is not null then
    raise exception 'taslakta eksik alan(lar): % - yayimlama iptal edildi, sayfayi yeniden yukleyip tekrar deneyin',
      array_to_string(v_eksik, ', ') using errcode = '23502';
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
$function$;

revoke execute on function public.publish_document(public.content_slug, integer) from public, anon;
grant execute on function public.publish_document(public.content_slug, integer) to authenticated, service_role;
