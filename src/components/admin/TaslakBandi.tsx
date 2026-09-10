import { draftMode } from "next/headers";

import { onizlemeyiKapat } from "@/app/admin/eylemler";

/**
 * Taslak modundayken sayfanin ustunde duran serit.
 *
 * Onizleme icin ayri bir renderer yazmiyoruz: taslak GERCEK sayfalardan
 * render ediliyor, GSAP ve 3B sahne davranisi dahil birebir. Tek fark bu bant.
 */
export default async function TaslakBandi() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-amber-500 px-4 py-1.5 text-[12.5px] font-semibold text-black">
      <span>Taslak modu — bu sayfa yayımlanmamış içeriği gösteriyor</span>
      <form action={onizlemeyiKapat}>
        <button className="rounded-full bg-black/15 px-2.5 py-0.5 transition hover:bg-black/25">Çık</button>
      </form>
    </div>
  );
}
