"""Is basvurularini job_applications tablosuna yazar.

Kullanim:
    python scripts/basvuru-senkron.py <kayitlar.json> <platform> [status] [posting_status]

Kayit dosyasi su sirayla alan tasiyan dizilerden olusur:
    [external_id, job_url, position, company, location, work_mode, applied_at]

Veri platformlarin KENDI sayfalarindan tarayici uzerinden cikariliyor (API yok);
bu betik sadece yazma adimini ustleniyor.

Kurallar - panelde verilen kararlar senkronda EZILMEZ:
- Yeni ilan eklenir.
- `ignored` (takip disi) isaretli ilana hic dokunulmaz. Silmek yerine bu
  kullaniliyor, cunku silinen ilan platform listesinde durdugu icin geri gelirdi.
- Mevcut ilanda aciklayici alanlar (pozisyon, sirket, konum, baglanti) guncellenir.
- `status` yalnizca platformun bildigi asamalar arasinda ve yalnizca ILERI
  dogru degisir (devam_ediyor -> basvuruldu -> goruntulendi). Panelde elle
  verilen mulakat / teklif / olumsuz / geri_cekildi durumlarina dokunulmaz.
  Onceden betik her calismada status'u yeniden yaziyordu; panelde "Mulakat"
  yapilan bir kayit ertesi sabah "Basvuruldu"ya donuyordu.
- `applied_at` bos gelirse eskisi korunur; `posting_status` ancak acikca
  verildiyse degisir.

SUPABASE_SECRET_KEY RLS'i atlar ve YALNIZCA yerelde bulunur; Vercel'e konmaz.
"""

import io
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Platformun kendi ekranindan okunabilen asamalar, ilerleme sirasiyla.
PLATFORM_ASAMALARI = ["devam_ediyor", "basvuruldu", "goruntulendi"]


def ortam():
    deger = {}
    for satir in io.open(os.path.join(KOK, ".env.local"), encoding="utf-8"):
        if "=" in satir and not satir.strip().startswith("#"):
            anahtar, ham = satir.strip().split("=", 1)
            deger[anahtar] = ham.strip().strip('"')
    return deger


class Istemci:
    def __init__(self, url, gizli):
        self.taban = url + "/rest/v1/job_applications"
        self.basliklar = {
            "apikey": gizli,
            "Authorization": "Bearer " + gizli,
            "Content-Type": "application/json",
        }

    def istek(self, yontem, sorgu="", govde=None, prefer=None):
        basliklar = dict(self.basliklar)
        if prefer:
            basliklar["Prefer"] = prefer
        veri = json.dumps(govde).encode("utf-8") if govde is not None else None
        r = urllib.request.Request(self.taban + sorgu, data=veri, method=yontem, headers=basliklar)
        with urllib.request.urlopen(r, timeout=60) as yanit:
            icerik = yanit.read().decode("utf-8")
            return json.loads(icerik) if icerik else None


def ileri_mi(eski, yeni):
    """Durum yalnizca platform asamalari icinde ve ileri dogru degisebilir."""
    if eski not in PLATFORM_ASAMALARI or yeni not in PLATFORM_ASAMALARI:
        return False
    return PLATFORM_ASAMALARI.index(yeni) > PLATFORM_ASAMALARI.index(eski)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    env = ortam()
    db = Istemci(env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SECRET_KEY"])
    platform = sys.argv[2]
    durum = sys.argv[3] if len(sys.argv) > 3 else "basvuruldu"
    ilan_durumu = sys.argv[4] if len(sys.argv) > 4 else None

    kayitlar = json.load(io.open(sys.argv[1], encoding="utf-8"))
    if not kayitlar:
        print("kayit yok")
        return

    kimlikler = ",".join('"%s"' % k[0].replace('"', "") for k in kayitlar)
    mevcut = {
        s["external_id"]: s
        for s in db.istek(
            "GET",
            "?select=id,external_id,status,ignored&platform=eq.%s&external_id=in.(%s)"
            % (urllib.parse.quote(platform), urllib.parse.quote(kimlikler, safe=',"')),
        )
    }

    simdi = datetime.now(timezone.utc).isoformat()
    yeniler, guncellenen, atlanan, ilerleyen = [], 0, 0, 0
    for k in kayitlar:
        dis_kimlik, baglanti, pozisyon, sirket, konum, calisma, tarih = k
        eski = mevcut.get(dis_kimlik)

        if eski is None:
            yeniler.append({
                "platform": platform,
                "external_id": dis_kimlik,
                "job_url": baglanti,
                "position": pozisyon,
                "company": sirket,
                "location": konum,
                "work_mode": calisma,
                "applied_at": tarih,
                "status": durum,
                "posting_status": ilan_durumu or "bilinmiyor",
                "source": "senkron",
                "synced_at": simdi,
            })
            continue

        if eski["ignored"]:
            atlanan += 1
            continue

        alanlar = {
            "job_url": baglanti,
            "position": pozisyon,
            "company": sirket,
            "location": konum,
            "synced_at": simdi,
        }
        if calisma:
            alanlar["work_mode"] = calisma
        if tarih:
            alanlar["applied_at"] = tarih
        if ilan_durumu:
            alanlar["posting_status"] = ilan_durumu
        if ileri_mi(eski["status"], durum):
            alanlar["status"] = durum
            ilerleyen += 1

        db.istek("PATCH", "?id=eq.%s" % eski["id"], alanlar)
        guncellenen += 1

    if yeniler:
        db.istek("POST", "", yeniler, prefer="return=minimal")

    print(
        "yeni: %d  guncellenen: %d  durum ilerleyen: %d  takip disi atlanan: %d"
        % (len(yeniler), guncellenen, ilerleyen, atlanan)
    )


if __name__ == "__main__":
    main()
