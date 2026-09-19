-- Ingilizce seviyesi B2 -> B1 (gercek seviye; B2 iddiali bulundu).
-- /cv dil kaydi (lang-2) ve ana sayfa "Diller" bilgisi (fact-4); ogeler
-- KIMLIKLE bulunuyor, yayim ve taslak birlikte.
do $$
declare
  dil jsonb := jsonb_build_object('tr', 'İngilizce — orta (B1)', 'en', 'English — intermediate (B1)');
  bilgi jsonb := jsonb_build_object('tr', 'Türkçe · İngilizce (B1) · Almanca (A1)', 'en', 'Turkish · English (B1) · German (A1)');
  i text; r record;
begin
  for r in select 'content_documents' as tablo, 'published' as alan union all select 'content_drafts', 'data' loop
    execute format('select (o - 1)::text from public.%1$I d, jsonb_array_elements(d.%2$I -> ''languages'') with ordinality as t(oge, o) where d.slug = ''cv'' and oge ->> ''id'' = ''lang-2''', r.tablo, r.alan) into i;
    if i is null then raise exception '%: cv lang-2 yok', r.tablo; end if;
    execute format('update public.%1$I d set %2$I = jsonb_set(d.%2$I, array[''languages'', $2, ''value''], $1) where slug = ''cv''', r.tablo, r.alan) using dil, i;
    execute format('select (o - 1)::text from public.%1$I d, jsonb_array_elements(d.%2$I -> ''about'' -> ''facts'') with ordinality as t(oge, o) where d.slug = ''home'' and oge ->> ''id'' = ''fact-4''', r.tablo, r.alan) into i;
    if i is null then raise exception '%: home fact-4 yok', r.tablo; end if;
    execute format('update public.%1$I d set %2$I = jsonb_set(d.%2$I, array[''about'', ''facts'', $2, ''v''], $1) where slug = ''home''', r.tablo, r.alan) using bilgi, i;
  end loop;
end $$;
