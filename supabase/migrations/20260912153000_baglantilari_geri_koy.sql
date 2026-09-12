-- CANLI HATA ONARIMI: ana sayfada `href="mailto:undefined"`.
--
-- `baglantilar` (giris/iletisim dugmelerinin hedefleri, e-posta, GitHub,
-- LinkedIn) 20260910145151_duzenlenebilir_baglantilar ile eklenmisti, ancak
-- 2026-09-12 12:30'daki yayimlama onu SILDI: panel dokumanin TAMAMINI yaziyor
-- ve o duzenleme oturumunun bellegindeki dokuman migration'dan onceydi. Taslak
-- uzerine yazildi, yayimlama da taslagi published uzerine kopyaladi.
--
-- Belirti: Home.tsx `const b = t.baglantilar` okuyor; alan yok oldugu icin
-- e-posta dugmeleri "mailto:undefined" basiyor, CV/GitHub/LinkedIn
-- baglantilari ise hic render edilmiyordu. Hicbir yerde hata gorunmuyordu.
--
-- Degerler commit'li yedekten (src/lib/content/seed/home.json) alindi.
-- Tekrarlanmamasi icin: 20260912154000_yayimlamada_alan_kaybi_korumasi.sql
do $$
declare
  baglantilar jsonb := jsonb_build_object(
    'email', 'tolgaolguner@gmail.com',
    'github', 'https://github.com/tolguner',
    'linkedin', 'https://www.linkedin.com/in/tolguner/',
    'githubEtiket', 'github.com/tolguner',
    'linkedinEtiket', 'linkedin.com/in/tolguner',
    'heroProjeler', '#projects',
    'heroCv', '/cv/',
    'iletisimCv', '/cv/'
  );
begin
  update public.content_documents
     set published = jsonb_set(published, '{baglantilar}', baglantilar, true)
   where slug = 'home';

  update public.content_drafts
     set data = jsonb_set(data, '{baglantilar}', baglantilar, true)
   where slug = 'home';
end $$;
