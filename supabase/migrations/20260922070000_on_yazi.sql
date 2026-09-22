-- Basvuru listesindeki ilanlar icin on yazi.
--
-- Taslagi Claude, ilanin gereksinimleri + CV + cevap bankasindaki ONAYLI
-- cevaplardan yazar; `cover_letter_confirmed = false` olarak kaydedilir.
-- Tolga panelde okuyup duzenler ve onaylar. Basvuru sirasinda yalnizca
-- onayli on yazi kullanilir; onaysiz taslak hicbir forma girmez.
--
-- Dil ilanin dilini izler: Ingilizce ilana Ingilizce on yazi.
alter table public.job_postings
  add column cover_letter text,
  add column cover_letter_lang text check (cover_letter_lang in ('tr', 'en')),
  add column cover_letter_confirmed boolean not null default false,
  add column cover_letter_updated_at timestamptz;

comment on column public.job_postings.cover_letter is
  'On yazi. Taslak (confirmed=false) basvuruda kullanilmaz; Tolga panelde onaylar.';
