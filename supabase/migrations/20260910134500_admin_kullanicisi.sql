-- Tek admin: Tolga. Kullanici Supabase panelinden olusturuldu; yetki
-- `authenticated` rolune degil bu tabloya uyelige bagli.
insert into public.admin_users (user_id, note)
values ('aa4975b5-a635-4b42-9713-e9914cbcc0b1', 'Tolga Olguner — site sahibi')
on conflict (user_id) do nothing;
