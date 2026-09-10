-- Dugme hedefleri artik kod icinde sabit degil, dokumanda. Mevcut satirlara
-- bugunku degerleriyle ekleniyor; hicbir baglanti degismiyor.
--
-- Menu capalari (#about, #journey ...) bilerek disarida: isaretlemedeki bolum
-- id'leriyle eslesmek zorundalar, panelden degistirilebilir yapmak yalnizca
-- menuyu bozmanin bir yolunu acardi.

update public.content_documents set published = jsonb_set(published, '{baglantilar}', '{
  "email": "tolgaolguner@gmail.com",
  "github": "https://github.com/tolguner",
  "linkedin": "https://www.linkedin.com/in/tolguner/",
  "githubEtiket": "github.com/tolguner",
  "linkedinEtiket": "linkedin.com/in/tolguner",
  "heroProjeler": "#projects",
  "heroCv": "/cv/",
  "iletisimCv": "/cv/"
}'::jsonb, true) where slug = 'home';

update public.content_drafts set data = jsonb_set(data, '{baglantilar}', '{
  "email": "tolgaolguner@gmail.com",
  "github": "https://github.com/tolguner",
  "linkedin": "https://www.linkedin.com/in/tolguner/",
  "githubEtiket": "github.com/tolguner",
  "linkedinEtiket": "linkedin.com/in/tolguner",
  "heroProjeler": "#projects",
  "heroCv": "/cv/",
  "iletisimCv": "/cv/"
}'::jsonb, true) where slug = 'home';

update public.content_documents set published = jsonb_set(published, '{links}', '{
  "email": "tolgaolguner@gmail.com",
  "github": "https://github.com/tolguner",
  "linkedin": "https://www.linkedin.com/in/tolguner/",
  "portfolyo": "/"
}'::jsonb, true) where slug = 'cv';

update public.content_drafts set data = jsonb_set(data, '{links}', '{
  "email": "tolgaolguner@gmail.com",
  "github": "https://github.com/tolguner",
  "linkedin": "https://www.linkedin.com/in/tolguner/",
  "portfolyo": "/"
}'::jsonb, true) where slug = 'cv';
