-- Ilan puanlamasi career-ops modeline uyarlandi (22.09.2026, Tolga'nin onayiyla).
--
-- Eski 0-100 puan agirlik tablosuyla (30/20/30/10/10) hesaplaniyordu; sayinin
-- vaat ettigi hassasiyeti kanit tasimiyordu ve tavan/ceza kurallari Tolga'ya
-- onaylatilmadan eklenmisti. Yeni model:
--
--   fit       1-5 butunsel genel puan (formul yok, tek ondalik)
--   fit_cv    1-5 CV uyumu
--   fit_goal  1-5 hedef uyumu (alan, tur, musaitlik)
--   red_flags genel puani dusuren somut engeller (ilanin acik sarti karsilanmiyor vb.)
--   warnings  puani ETKILEMEYEN uyarilar: konum/ikamet sarti, kalip ilan, ilan yasi
--   requirements  sart tablosu; yalnizca "Listeye al" denen ilanlarda, basvurudan once
--
-- `score` eski kayitlar icin tarihce olarak kaliyor; yeni kayitlarda bos.

alter table public.job_postings
  add column fit numeric(2,1) check (fit between 1 and 5),
  add column fit_cv smallint check (fit_cv between 1 and 5),
  add column fit_goal smallint check (fit_goal between 1 and 5),
  add column red_flags text[] not null default '{}',
  add column warnings text[] not null default '{}',
  add column requirements jsonb check (requirements is null or jsonb_typeof(requirements) = 'array');

comment on column public.job_postings.score is 'ESKI 0-100 puan (22.09.2026 oncesi). Yeni kayitlar fit kullanir.';

drop index public.job_postings_sira;
create index job_postings_sira on public.job_postings (decision, fit desc nulls last, found_at desc);
