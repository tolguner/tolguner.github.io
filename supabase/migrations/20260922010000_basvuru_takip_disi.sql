-- Basvuruyu takipten cikarma.
--
-- Senkronla gelen bir kaydi SILMEK ise yaramiyor: ilan platformun kendi
-- listesinde durdugu icin bir sonraki senkron onu geri ekliyor. Bu yuzden
-- satir kaliyor, `ignored` ile isaretleniyor; panel bu satirlari gostermiyor,
-- senkron betigi de bunlara hic dokunmuyor.
--
-- Ilk kullanim (22.09.2026): Kariyer.net'teki 13 eski perakende basvurusu
-- (KOTON, FLO, DeFacto, Starbucks, Ozdilek...). Tolga'nin ifadesiyle "cok
-- eskiden niteliksizken basvurdugum ilanlar" - takip degeri yok.
alter table public.job_applications
  add column ignored boolean not null default false;

comment on column public.job_applications.ignored is
  'true: panelde gosterilmez ve senkron dokunmaz. Silme yerine kullanilir; silinen senkron kaydi bir sonraki senkronda geri gelir.';
