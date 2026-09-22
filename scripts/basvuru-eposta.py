"""E-postadan cikan basvuru bilgilerini job_applications tablosuna yazar.

Platform listeleri `basvuru-senkron.py` ile yaziliyor. Bu betik, listelerde
gorunmeyen ama e-postada gecen seyler icin: firmalarin kendi adreslerinden
gelen mulakat daveti / ret / teklif yazilari, "formu doldur", "testi coz" gibi
aksiyon istekleri ve Tolga'nin dogrudan e-postayla yaptigi basvurular.

Kullanim:
    python scripts/basvuru-eposta.py listele
    python scripts/basvuru-eposta.py uygula <islemler.json> [--kuru]

`listele` panelde gorunen kayitlari `id | platform | sirket | pozisyon | durum`
olarak basar; e-postayi dogru kayitla eslestirmek icin once bunu calistir.

islemler.json:
    [
      {"islem": "ekle", "kayit": {"platform": "diger", "external_id": "eposta-<firma>-<pozisyon>",
                                  "company": "...", "position": "...", "applied_at": "2026-09-19",
                                  "status": "basvuruldu", "notes": "..."}},
      {"islem": "guncelle", "id": "<uuid>", "status": "mulakat", "not": "20.09 telefon gorusmesi"}
    ]

Kurallar - e-posta tek basina panelde verilmis karari geri alamaz:
- Durum yalnizca ILERI gider: basvuru asamalari -> mulakat -> teklif.
  `olumsuz` her asamadan gelebilir ama teklif / geri_cekildi / olumsuz uzerine yazilmaz.
- `ignored` (takip disi) kayda dokunulmaz.
- Not EKLENIR, eski not silinmez; ayni metin zaten varsa tekrar eklenmez.
- `--kuru` hicbir sey yazmaz, ne yapilacagini basar.

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

SIRA = ["devam_ediyor", "basvuruldu", "goruntulendi", "mulakat", "teklif"]
SON_DURUMLAR = {"teklif", "olumsuz", "geri_cekildi"}


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
        self.basliklar = {"apikey": gizli, "Authorization": "Bearer " + gizli, "Content-Type": "application/json"}

    def istek(self, yontem, sorgu="", govde=None, prefer=None):
        basliklar = dict(self.basliklar)
        if prefer:
            basliklar["Prefer"] = prefer
        veri = json.dumps(govde).encode("utf-8") if govde is not None else None
        r = urllib.request.Request(self.taban + sorgu, data=veri, method=yontem, headers=basliklar)
        with urllib.request.urlopen(r, timeout=60) as yanit:
            icerik = yanit.read().decode("utf-8")
            return json.loads(icerik) if icerik else None


def gecis_serbest_mi(eski, yeni):
    if eski == yeni:
        return False
    if yeni == "olumsuz":
        return eski not in SON_DURUMLAR
    if yeni in SIRA and eski in SIRA:
        return SIRA.index(yeni) > SIRA.index(eski)
    return False


def listele(db):
    satirlar = db.istek(
        "GET",
        "?select=id,platform,company,position,status&ignored=eq.false&order=company.asc",
    )
    for s in satirlar:
        print("%s | %s | %s | %s | %s" % (s["id"], s["platform"], s["company"], s["position"], s["status"]))
    print("(%d kayit)" % len(satirlar), file=sys.stderr)


def uygula(db, islemler, kuru):
    bugun = datetime.now(timezone.utc).strftime("%d.%m")
    for i in islemler:
        if i["islem"] == "ekle":
            k = dict(i["kayit"])
            k.setdefault("source", "senkron")
            k.setdefault("posting_status", "bilinmiyor")
            if not k.get("external_id", "").startswith("eposta-"):
                print("ATLANDI (external_id 'eposta-' ile baslamali):", k.get("external_id"))
                continue
            print("EKLE     %s / %s [%s]" % (k["company"], k["position"], k.get("status", "basvuruldu")))
            if not kuru:
                db.istek(
                    "POST",
                    "?on_conflict=platform,external_id",
                    [k],
                    prefer="resolution=ignore-duplicates,return=minimal",
                )
            continue

        if i["islem"] != "guncelle":
            print("ATLANDI (bilinmeyen islem):", i.get("islem"))
            continue

        bulunan = db.istek("GET", "?select=id,company,status,notes,ignored&id=eq.%s" % urllib.parse.quote(i["id"]))
        if not bulunan:
            print("ATLANDI (kayit yok):", i["id"])
            continue
        s = bulunan[0]
        if s["ignored"]:
            print("ATLANDI (takip disi):", s["company"])
            continue

        alanlar = {}
        yeni = i.get("status")
        if yeni:
            if gecis_serbest_mi(s["status"], yeni):
                alanlar["status"] = yeni
            else:
                print("DURUM KORUNDU  %s: %s -> %s izinli degil" % (s["company"], s["status"], yeni))

        not_metni = (i.get("not") or "").strip()
        if not_metni and not_metni not in (s["notes"] or ""):
            satir = "%s: %s" % (bugun, not_metni)
            alanlar["notes"] = (s["notes"] + "\n" + satir) if s["notes"] else satir

        if not alanlar:
            print("DEGISIKLIK YOK %s" % s["company"])
            continue
        print("GUNCELLE %s  %s" % (s["company"], ", ".join(sorted(alanlar))))
        if not kuru:
            db.istek("PATCH", "?id=eq.%s" % urllib.parse.quote(s["id"]), alanlar)


def main():
    # Windows konsolu varsayilan olarak cp1254/cp437; Turkce sirket adlari
    # bozuk basilinca eslestirme yanlis yapiliyordu.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2 or sys.argv[1] not in ("listele", "uygula"):
        sys.exit(__doc__)
    env = ortam()
    db = Istemci(env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SECRET_KEY"])
    if sys.argv[1] == "listele":
        listele(db)
        return
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    uygula(db, json.load(io.open(sys.argv[2], encoding="utf-8")), "--kuru" in sys.argv)


if __name__ == "__main__":
    main()
