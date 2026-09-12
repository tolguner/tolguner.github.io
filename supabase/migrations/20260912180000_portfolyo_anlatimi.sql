-- Portfolyo projesinin anlatimini bugunku haline getir.
--
-- CV kaydi ve ana sayfa karti projeyi yalnizca ON YUZ olarak anlatiyordu
-- (Next.js, Three.js, GSAP). Veritabani, RLS, yonetim paneli ve kimlik
-- dogrulama hic gecmiyordu; isveren gozunde daha agir basan yari o.
--
-- Dizideki oge INDEKSLE degil KIMLIKLE bulunuyor: sira degisirse yanlis
-- kaydin uzerine yazmak sessiz bir veri kaybi olurdu.
--
-- Dokumanin tamami DEGIL, yalnizca bu iki oge guncelleniyor: `seed --db`
-- calistirmak panelden yapilan duzenlemeleri geri alirdi.
do $$
declare
  yeni_proj jsonb := '{"id": "proj-2", "url": "https://github.com/tolguner/tolguner.github.io", "urlLabel": "github.com/tolguner/tolguner.github.io", "title": {"tr": "tolguner.me", "en": "tolguner.me"}, "kind": {"tr": "Kişisel Portfolyo Sitesi · 2026", "en": "Personal Portfolio Site · 2026"}, "tech": {"tr": "Next.js · TypeScript · PostgreSQL · Supabase · Three.js · Vercel", "en": "Next.js · TypeScript · PostgreSQL · Supabase · Three.js · Vercel"}, "note": {"tr": "Kişisel geçmişimi, projelerimi ve araştırmamı scroll''a bağlı 3B bir deneyimle anlatır. İçerik Postgres''te tutulur ve giriş gerektiren bir panelden düzenlenir; site kod değişmeden güncellenir.", "en": "Presents my background, projects and research through a scroll-driven 3D experience. Content lives in Postgres and is edited through a login-protected admin panel; the site is updated without code changes."}, "items": [{"id": "proj-2-i-1", "value": {"tr": "Three.js tabanlı özel 3B sahne ve GSAP ScrollTrigger ile senaryolu geçiş animasyonları", "en": "Custom Three.js scene with GSAP ScrollTrigger-driven transition animations"}}, {"id": "proj-2-i-2", "value": {"tr": "Satır düzeyi güvenlik (RLS) ve TOTP iki adımlı doğrulama ile korunan yönetim paneli; taslak → yayımla akışı, revizyon geçmişi ve geri alma", "en": "Admin panel protected by row-level security and TOTP two-factor authentication; draft-to-publish flow, revision history and rollback"}}]}'::jsonb;
  yeni_kart jsonb := '{"id": "card-4", "statusKind": "live", "period": "2026", "url": "https://github.com/tolguner/tolguner.github.io", "tech": ["Next.js", "TypeScript", "Supabase", "Three.js", "GSAP"], "title": {"tr": "tolguner.me", "en": "tolguner.me"}, "status": {"tr": "Canlı", "en": "Live"}, "text": {"tr": "Bu site. Next.js, Three.js ve GSAP ile scroll''a bağlı bir deneyim kurdum; içeriği Postgres''e taşıyıp giriş gerektiren bir panelden yönetilir hâle getirdim — artık metin değiştirmek için kod düzenlemiyorum.", "en": "This site. I built a scroll-driven experience with Next.js, Three.js and GSAP, then moved the content into Postgres and put it behind a login-protected admin panel — changing text no longer means editing code."}}'::jsonb;
begin
  -- cv.projects icindeki proj-2
  update public.content_documents d
     set published = jsonb_set(
           d.published, array['projects', (
             select (i - 1)::text from jsonb_array_elements(d.published -> 'projects')
             with ordinality as t(oge, i) where oge ->> 'id' = 'proj-2'
           )], yeni_proj)
   where d.slug = 'cv'
     and exists (select 1 from jsonb_array_elements(d.published -> 'projects') o
                  where o ->> 'id' = 'proj-2');

  update public.content_drafts d
     set data = jsonb_set(
           d.data, array['projects', (
             select (i - 1)::text from jsonb_array_elements(d.data -> 'projects')
             with ordinality as t(oge, i) where oge ->> 'id' = 'proj-2'
           )], yeni_proj)
   where d.slug = 'cv'
     and exists (select 1 from jsonb_array_elements(d.data -> 'projects') o
                  where o ->> 'id' = 'proj-2');

  -- home.projects.cards icindeki card-4
  update public.content_documents d
     set published = jsonb_set(
           d.published, array['projects', 'cards', (
             select (i - 1)::text from jsonb_array_elements(d.published -> 'projects' -> 'cards')
             with ordinality as t(oge, i) where oge ->> 'id' = 'card-4'
           )], yeni_kart)
   where d.slug = 'home'
     and exists (select 1 from jsonb_array_elements(d.published -> 'projects' -> 'cards') o
                  where o ->> 'id' = 'card-4');

  update public.content_drafts d
     set data = jsonb_set(
           d.data, array['projects', 'cards', (
             select (i - 1)::text from jsonb_array_elements(d.data -> 'projects' -> 'cards')
             with ordinality as t(oge, i) where oge ->> 'id' = 'card-4'
           )], yeni_kart)
   where d.slug = 'home'
     and exists (select 1 from jsonb_array_elements(d.data -> 'projects' -> 'cards') o
                  where o ->> 'id' = 'card-4');
end $$;
