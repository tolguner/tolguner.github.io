-- /cv sayfasinin metinleri onaylanmis Word/PDF CV'siyle hizalandi.
--
-- Karsilastirma PDF metni ile canli dokuman arasinda alan alan yapildi.
-- Hizalanan dort sey:
--   1. TR ozet: PDF "Isik Universitesi ... son sinif ogrencisiyim." cumlesiyle
--      basliyordu ve "3 yillik" diyordu; site bu cumleyi tasimiyor ve
--      "Uc yillik" yaziyordu.
--   2. EN ozet: PDF ucuncu tekil ("Builds ... project lead of"), site birinci
--      tekildi. CV gelenegi ucuncu tekil. Ayrica sitedeki metinde dilbilgisi
--      hatasi vardi: "organization combine" -> "organization experience
--      combine" (PDF dogru olani tasiyor).
--   3. Unvan satiri: PDF yalnizca "Yonetim Bilisim Sistemleri Ogrencisi"
--      diyor. Site "... · Isik Universitesi" ekliyordu; ozet cumlesi artik
--      universiteyi soyledigi icin ikisi birden tekrar olurdu.
--   4. CampusOS aciklamasi (EN): PDF parantez kullaniyor, site uzun tire.
--
-- Yayim ve taslak birlikte guncelleniyor: yalnizca yayimi degistirmek, bir
-- sonraki "Yayimla" tiklamasinda degisikligin geri alinmasi demek olurdu.
do $$
declare
  tagline jsonb := jsonb_build_object(
    'tr', 'Yönetim Bilişim Sistemleri Öğrencisi',
    'en', 'Management Information Systems Student');
  intro jsonb := jsonb_build_object(
    'tr', 'Işık Üniversitesi Yönetim Bilişim Sistemleri son sınıf öğrencisiyim. Spring Boot ve React ile web uygulamaları geliştiriyorum; TÜBİTAK 2209-A destekli bir araştırma projesinin yürütücüsüyüm. 3 yıllık kulüp başkanlığı ve kurumsal etkinlik organizasyonu deneyimiyle teknik bilgiyi iletişim, ekip koordinasyonu ve organizasyon becerisiyle birleştiriyorum.',
    'en', 'Final-year Management Information Systems student at Işık University (GPA 3.43/4). Builds web applications with Spring Boot and React; project lead of a TÜBİTAK 2209-A funded research project. Three years as a club president and hands-on corporate event organization experience combine technical skills with communication, team coordination and organizational ability.');
  campus_en text := 'Aims to bring the scattered parts of campus life (clubs and events, facility booking, food ordering, ride sharing) into one platform students use with a single account.';
  i text;
begin
  update public.content_documents
     set published = jsonb_set(jsonb_set(published, '{hero,tagline}', tagline), '{hero,intro}', intro)
   where slug = 'cv';
  update public.content_drafts
     set data = jsonb_set(jsonb_set(data, '{hero,tagline}', tagline), '{hero,intro}', intro)
   where slug = 'cv';

  -- CampusOS notu: oge KIMLIKLE bulunuyor, indeksle degil.
  select (o - 1)::text into i
    from jsonb_array_elements((select published from public.content_documents where slug='cv') -> 'projects')
    with ordinality as t(oge, o) where oge ->> 'id' = 'proj-1';
  if i is null then raise exception 'cv.projects icinde proj-1 yok'; end if;
  update public.content_documents
     set published = jsonb_set(published, array['projects', i, 'note', 'en'], to_jsonb(campus_en))
   where slug = 'cv';

  select (o - 1)::text into i
    from jsonb_array_elements((select data from public.content_drafts where slug='cv') -> 'projects')
    with ordinality as t(oge, o) where oge ->> 'id' = 'proj-1';
  if i is not null then
    update public.content_drafts
       set data = jsonb_set(data, array['projects', i, 'note', 'en'], to_jsonb(campus_en))
     where slug = 'cv';
  end if;
end $$;
