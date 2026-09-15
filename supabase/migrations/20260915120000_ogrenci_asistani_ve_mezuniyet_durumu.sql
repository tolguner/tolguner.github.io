-- CV feedback'i: unvan ve mezuniyet durumu.
--
-- 1. "Calisma Burslu Ogrenci" -> "Ogrenci Asistani" (EN "Student Assistant").
--    Isveren "burs" kelimesini burs aldigi seklinde okuyordu. "Stajyer"
--    BILEREK secilmedi: rol staj degildi ve ozet zorunlu stajin henuz
--    yapilmadigini soyluyor, ikisi celisirdi. Ayni rol ana sayfadaki yolculuk
--    kartinda (stop-4) da geciyor; orasi da degisti.
-- 2. /cv ozetine mezuniyet durumu eklendi: dersler tamam, toplam 40 is gunluk
--    iki zorunlu staj kaldi.
--
-- Uygulanan hali: Supabase migration `ogrenci_asistani_ve_mezuniyet_durumu`
-- (ogeler kimlikle bulunarak, yayim + taslak birlikte).
do $$
declare
  unvan jsonb := jsonb_build_object('tr', 'Öğrenci Asistanı', 'en', 'Student Assistant');
  intro jsonb := jsonb_build_object(
    'tr', 'Işık Üniversitesi Yönetim Bilişim Sistemleri son sınıf öğrencisiyim; ders yükümlülüklerimi tamamladım, mezuniyetime yalnızca toplam 40 iş günlük iki zorunlu staj kaldı. Staj sürecimin ardından mezun olmaya hak kazanacağım. Spring Boot ve React ile web uygulamaları geliştiriyorum; TÜBİTAK 2209-A destekli bir araştırma projesinin yürütücüsüyüm. 3 yıllık kulüp başkanlığı ve kurumsal etkinlik organizasyonu deneyimiyle teknik bilgiyi iletişim, ekip koordinasyonu ve organizasyon becerisiyle birleştiriyorum.',
    'en', 'Final-year Management Information Systems student at Işık University (GPA 3.43/4). All coursework completed; only two mandatory internships (40 working days in total) remain, after which eligible to graduate. Builds web applications with Spring Boot and React; project lead of a TÜBİTAK 2209-A funded research project. Three years as a club president and hands-on corporate event organization experience combine technical skills with communication, team coordination and organizational ability.');
  i text;
  r record;
begin
  for r in select 'content_documents' as tablo, 'published' as alan union all select 'content_drafts', 'data' loop
    execute format('update public.%1$I d set %2$I = jsonb_set(d.%2$I, ''{hero,intro}'', $1) where slug = ''cv''', r.tablo, r.alan) using intro;
    execute format('select (o - 1)::text from public.%1$I d, jsonb_array_elements(d.%2$I -> ''experience'') with ordinality as t(oge, o) where d.slug = ''cv'' and oge ->> ''id'' = ''exp-1''', r.tablo, r.alan) into i;
    if i is null then raise exception '%: cv exp-1 yok', r.tablo; end if;
    execute format('update public.%1$I d set %2$I = jsonb_set(d.%2$I, array[''experience'', $2, ''title''], $1) where slug = ''cv''', r.tablo, r.alan) using unvan, i;
    execute format('select (o - 1)::text from public.%1$I d, jsonb_array_elements(d.%2$I -> ''journey'' -> ''stops'') with ordinality as t(oge, o) where d.slug = ''home'' and oge ->> ''id'' = ''stop-4''', r.tablo, r.alan) into i;
    if i is null then raise exception '%: home stop-4 yok', r.tablo; end if;
    execute format('update public.%1$I d set %2$I = jsonb_set(d.%2$I, array[''journey'', ''stops'', $2, ''title''], $1) where slug = ''home''', r.tablo, r.alan) using unvan, i;
  end loop;
end $$;
