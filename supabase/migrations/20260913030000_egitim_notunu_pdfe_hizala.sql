-- Egitim notu da onaylanmis PDF'e hizalandi.
--
-- Panelden "GNO 3,43 / 4,00 · %100 Burslu" olarak kisaltilmisti; Tolga bu
-- kararindan vazgecti. PDF'teki tam yazim geri geliyor. Ingilizce tarafta
-- yalnizca buyuk harf farki vardi ("Full Scholarship" -> "Full scholarship").
do $$
declare
  meta jsonb := jsonb_build_object(
    'tr', 'Genel Not Ortalaması 3,43 / 4,00 · %100 Burslu',
    'en', 'GPA 3.43 / 4.00 · Full scholarship (100%)');
begin
  update public.content_documents set published = jsonb_set(published, '{education,meta}', meta) where slug = 'cv';
  update public.content_drafts    set data      = jsonb_set(data,      '{education,meta}', meta) where slug = 'cv';
end $$;
