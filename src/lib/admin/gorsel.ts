/**
 * Galeri fotograflarini tek olcuye getirir: 500x375 (4:3), merkezden kirparak.
 *
 * Serit tum kartlari ayni kutuda gosteriyor; farkli oranlardaki fotograflar
 * `object-cover` ile zaten kirpilarak gosteriliyordu ama DOSYA olarak farkli
 * kaliyordu — telefondan gelen 2305x3073'luk bir kare hem gereksiz yer
 * kapliyor hem de kirpmanin nerede olacagini tarayiciya birakiyordu.
 * Burada bir kez, yuklerken hallediyoruz.
 */

export const HEDEF = { en: 500, boy: 375 } as const;

/** Tek adimda cok kucultmek kenarlari titretiyor; yariya bolerek iniyoruz. */
function kademeliKucult(kaynak: CanvasImageSource, enBas: number, boyBas: number, enSon: number, boySon: number) {
  let tuval = document.createElement("canvas");
  let en = enBas;
  let boy = boyBas;
  tuval.width = en;
  tuval.height = boy;
  tuval.getContext("2d")!.drawImage(kaynak, 0, 0, en, boy);

  while (en > enSon * 2 && boy > boySon * 2) {
    const yeniEn = Math.max(Math.round(en / 2), enSon);
    const yeniBoy = Math.max(Math.round(boy / 2), boySon);
    const sonraki = document.createElement("canvas");
    sonraki.width = yeniEn;
    sonraki.height = yeniBoy;
    const ctx = sonraki.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tuval, 0, 0, yeniEn, yeniBoy);
    tuval = sonraki;
    en = yeniEn;
    boy = yeniBoy;
  }
  return tuval;
}

export type IslemSonucu = { dosya: File; kaynakEn: number; kaynakBoy: number; buyutuldu: boolean };

/**
 * Kirpma "cover" mantiginda: oran korunur, kisa kenar hedefi doldurur,
 * tasan kisim merkezden atilir.
 */
export async function galeriyeHazirla(dosya: File): Promise<IslemSonucu> {
  // `from-image`: telefon fotograflarindaki EXIF donme bilgisi uygulanir,
  // yoksa yan yatmis kareler yan yatmis olarak kirpilir.
  const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" });
  const kaynakEn = bmp.width;
  const kaynakBoy = bmp.height;

  const olcek = Math.max(HEDEF.en / kaynakEn, HEDEF.boy / kaynakBoy);
  const cizimEn = Math.round(kaynakEn * olcek);
  const cizimBoy = Math.round(kaynakBoy * olcek);

  const ara = kademeliKucult(bmp, kaynakEn, kaynakBoy, cizimEn, cizimBoy);
  bmp.close();

  const tuval = document.createElement("canvas");
  tuval.width = HEDEF.en;
  tuval.height = HEDEF.boy;
  const ctx = tuval.getContext("2d")!;
  // Saydam PNG'ler JPEG'e cevrilirken siyah zemin almasin.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, HEDEF.en, HEDEF.boy);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(ara, Math.round((HEDEF.en - cizimEn) / 2), Math.round((HEDEF.boy - cizimBoy) / 2), cizimEn, cizimBoy);

  const blob = await new Promise<Blob | null>((coz) => tuval.toBlob(coz, "image/jpeg", 0.85));
  if (!blob) throw new Error("görsel işlenemedi");

  const ad = dosya.name.replace(/\.[^.]+$/, "") + ".jpg";
  return {
    dosya: new File([blob], ad, { type: "image/jpeg" }),
    kaynakEn,
    kaynakBoy,
    buyutuldu: kaynakEn < HEDEF.en || kaynakBoy < HEDEF.boy,
  };
}
