/**
 * Galeri fotograflari icin kirpma matematigi.
 *
 * Sabit olan ORAN (4:3), boyut degil. Cikti cozunurlugu kaynaktan korunur:
 * kirpilan alan kaynakta kac pikselse cikti da o kadar olur, yalnizca ust ve
 * alt sinirlarla kelepcelenir. Boylece buyuk bir kareden kirpilan detay
 * gereksiz yere 500 piksele dusmez, kucuk bir kare de asiri buyutulmez.
 *
 * Kadraji otomatik secmiyoruz — merkezden kirpmak cogu karede yanlis yeri
 * seciyor. Panelde bir kirpma ekrani var; buradaki fonksiyonlar o ekranin
 * onizlemesiyle ciktinin birebir ayni olmasi icin ayni matematigi kullaniyor.
 */

/** Kirpma orani. Sayilar ayni zamanda onizleme koordinat sistemidir. */
export const CERCEVE = { en: 500, boy: 375 } as const;
export const ORAN = CERCEVE.en / CERCEVE.boy;

/** Cikti genisligi bu araliga kelepcelenir. */
export const CIKTI = { asgariEn: 500, azamiEn: 1600 } as const;

/** Depolanan dosya bu boyutu asamaz. */
export const AZAMI_BAYT = 5 * 1024 * 1024;

export type Kadraj = { olcek: number; x: number; y: number };
export type Kaynak = { bmp: ImageBitmap; en: number; boy: number; ad: string };

/** EXIF donme bilgisi uygulanir; yoksa yan yatmis telefon kareleri yan yatar. */
export async function kaynagiAc(dosya: File): Promise<Kaynak> {
  const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" });
  return { bmp, en: bmp.width, boy: bmp.height, ad: dosya.name };
}

/** Goruntunun cerceveyi tam doldurdugu en kucuk olcek ("cover"). */
export function asgariOlcek(en: number, boy: number) {
  return Math.max(CERCEVE.en / en, CERCEVE.boy / boy);
}

/** Cercevede bosluk kalmasin diye kaydirmayi sinirlar. */
export function kadrajiSinirla(kaynak: { en: number; boy: number }, kadraj: Kadraj): Kadraj {
  const olcek = Math.max(kadraj.olcek, asgariOlcek(kaynak.en, kaynak.boy));
  const cizimEn = kaynak.en * olcek;
  const cizimBoy = kaynak.boy * olcek;
  return {
    olcek,
    x: Math.min(0, Math.max(CERCEVE.en - cizimEn, kadraj.x)),
    y: Math.min(0, Math.max(CERCEVE.boy - cizimBoy, kadraj.y)),
  };
}

/** Goruntuyu cerceveye ortalayan kadraj. */
export function ortalaKadraj(kaynak: { en: number; boy: number }): Kadraj {
  const olcek = asgariOlcek(kaynak.en, kaynak.boy);
  return {
    olcek,
    x: (CERCEVE.en - kaynak.en * olcek) / 2,
    y: (CERCEVE.boy - kaynak.boy * olcek) / 2,
  };
}

/**
 * Secilen kadrajin kaynaktaki gercek genisligi. Onizleme cercevesi 500 birim;
 * `olcek` kaynak pikselini birime cevirdigine gore tersi kaynak pikselini verir.
 */
export function ciktiGenisligi(kadraj: Kadraj) {
  const kaynakta = CERCEVE.en / kadraj.olcek;
  return Math.round(Math.min(CIKTI.azamiEn, Math.max(CIKTI.asgariEn, kaynakta)));
}

/** Tek adimda cok kucultmek kenarlari titretiyor; yariya bolerek iniyoruz. */
function kademeliKucult(kaynak: CanvasImageSource, enBas: number, boyBas: number, enSon: number, boySon: number) {
  let tuval = document.createElement("canvas");
  let en = Math.round(enBas);
  let boy = Math.round(boyBas);
  tuval.width = en;
  tuval.height = boy;
  tuval.getContext("2d")!.drawImage(kaynak, 0, 0, en, boy);

  while (en > enSon * 2 && boy > boySon * 2) {
    const yeniEn = Math.max(Math.round(en / 2), Math.round(enSon));
    const yeniBoy = Math.max(Math.round(boy / 2), Math.round(boySon));
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

export type Cikti = { dosya: File; en: number; boy: number };

/** Secilen kadraji 4:3 JPEG olarak uretir; 5 MB'i asarsa kaliteyi dusurur. */
export async function kadrajiUret(kaynak: Kaynak, kadraj: Kadraj): Promise<Cikti> {
  const k = kadrajiSinirla(kaynak, kadraj);

  const ciktiEn = ciktiGenisligi(k);
  const ciktiBoy = Math.round(ciktiEn / ORAN);
  // Onizleme cercevesinden cikti piksellerine gecis carpani.
  const carpan = ciktiEn / CERCEVE.en;

  const cizimEn = Math.round(kaynak.en * k.olcek * carpan);
  const cizimBoy = Math.round(kaynak.boy * k.olcek * carpan);

  const ara = kademeliKucult(kaynak.bmp, kaynak.en, kaynak.boy, cizimEn, cizimBoy);

  const tuval = document.createElement("canvas");
  tuval.width = ciktiEn;
  tuval.height = ciktiBoy;
  const ctx = tuval.getContext("2d")!;
  // Saydam PNG'ler JPEG'e cevrilirken siyah zemin almasin.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ciktiEn, ciktiBoy);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(ara, Math.round(k.x * carpan), Math.round(k.y * carpan), cizimEn, cizimBoy);

  let blob: Blob | null = null;
  for (const kalite of [0.85, 0.75, 0.65, 0.5]) {
    blob = await new Promise<Blob | null>((coz) => tuval.toBlob(coz, "image/jpeg", kalite));
    if (blob && blob.size <= AZAMI_BAYT) break;
  }
  if (!blob) throw new Error("görsel işlenemedi");
  if (blob.size > AZAMI_BAYT) {
    throw new Error(`kırpılan görsel ${(blob.size / 1048576).toFixed(1)} MB — 5 MB sınırının altına indirilemedi`);
  }

  return {
    dosya: new File([blob], kaynak.ad.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }),
    en: ciktiEn,
    boy: ciktiBoy,
  };
}
