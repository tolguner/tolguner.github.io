"""Kesfedilen aday ilanlari job_postings tablosuna yazar.

Kullanim:
    python scripts/ilan-kesif.py bilinen <platform>
    python scripts/ilan-kesif.py yaz <ilanlar.json> [--kuru]
    python scripts/ilan-kesif.py esle
    python scripts/ilan-kesif.py onyazi <onyazilar.json> [--uzerine-yaz]

`bilinen`  Platformda zaten gorulmus ilan kimliklerini basar: hem kesif tablosundakiler
           hem basvurulmuslar. Ilan ayrintisini acmadan once bunlari ele; ayni ilani
           her gun yeniden okumak hem zaman kaybi hem gereksiz sayfa yuklemesi.
`yaz`      Aday ilanlari yazar (asagidaki kurallarla).
`esle`     Basvuru yapilmis ilanlari kesif listesinde `basvuruldu` yapar. Basvuru
           senkronundan SONRA calistir.
`onyazi`   On yazi TASLAGI yazar (onaysiz). Girdi:
           [{"platform": "...", "external_id": "...", "lang": "tr|en", "metin": "..."}]
           Tolga'nin onayladigi on yaziya dokunmaz; `--uzerine-yaz` verilmedikce.

ilanlar.json - nesne listesi:
    {"platform": "linkedin", "external_id": "4467781261", "company": "...", "position": "...",
     "location": "...", "work_mode": "is_yerinde", "job_url": "https://...",
     "kind": "staj", "easy_apply": true, "deadline": "2026-10-18", "summary": "...",
     "score": 72, "score_reasons": ["...", "..."], "areas": ["veri"], "source": "arama"}

Kurallar:
- Zaten basvurulmus ilan (job_applications'ta ayni platform + kimlik, takip disi
  olanlar dahil) YAZILMAZ.
- Tolga'nin karar verdigi ilana (listede / ilgilenmiyorum / basvuruldu) dokunulmaz;
  "ilgilenmiyorum" dedigi ilan bir daha one cikmaz.
- Karar bekleyen (`yeni`) ilanda puan ve aciklayici alanlar tazelenir.
"""

import io
import json
import sys

from supabase_rest import Tablo, in_listesi, utf8_cikti

ALANLAR = {"veri", "urun", "yazilim", "erp"}
ZORUNLU = ("platform", "external_id", "company", "position", "job_url", "source")


def bilinen(platform):
    ilanlar = Tablo("job_postings").istek("GET", "?select=external_id&platform=eq.%s" % platform)
    basvurular = Tablo("job_applications").istek("GET", "?select=external_id&platform=eq.%s" % platform)
    kimlikler = sorted({s["external_id"] for s in ilanlar} | {s["external_id"] for s in basvurular})
    print(",".join(kimlikler))
    print("(%d bilinen)" % len(kimlikler), file=sys.stderr)


def dogrula(i):
    eksik = [a for a in ZORUNLU if not i.get(a)]
    if eksik:
        return "eksik alan: " + ", ".join(eksik)
    if i.get("score") is not None and not 0 <= i["score"] <= 100:
        return "puan 0-100 disinda"
    yabanci = set(i.get("areas") or []) - ALANLAR
    if yabanci:
        return "bilinmeyen alan: " + ", ".join(sorted(yabanci))
    return None


def yaz(ilanlar, kuru):
    postings, basvurular = Tablo("job_postings"), Tablo("job_applications")
    platformlar = {i.get("platform") for i in ilanlar}

    basvurulmus, mevcut = set(), {}
    for p in platformlar:
        kimlikler = [i["external_id"] for i in ilanlar if i.get("platform") == p and i.get("external_id")]
        if not kimlikler:
            continue
        for s in basvurular.istek("GET", "?select=external_id&platform=eq.%s&external_id=in.(%s)" % (p, in_listesi(kimlikler))):
            basvurulmus.add((p, s["external_id"]))
        for s in postings.istek("GET", "?select=id,external_id,decision&platform=eq.%s&external_id=in.(%s)" % (p, in_listesi(kimlikler))):
            mevcut[(p, s["external_id"])] = s

    yeni, tazelenen, atlanan = [], 0, 0
    for i in ilanlar:
        hata = dogrula(i)
        if hata:
            print("ATLANDI (%s): %s / %s" % (hata, i.get("company"), i.get("position")))
            atlanan += 1
            continue
        anahtar = (i["platform"], i["external_id"])
        if anahtar in basvurulmus:
            atlanan += 1
            continue
        eski = mevcut.get(anahtar)
        if eski is None:
            yeni.append({**i, "decision": "yeni"})
            print("YENI     %3s  %s / %s" % (i.get("score", "-"), i["company"], i["position"]))
            continue
        if eski["decision"] != "yeni":
            atlanan += 1
            continue
        alanlar = {k: v for k, v in i.items() if k not in ("platform", "external_id", "source") and v is not None}
        if not kuru:
            postings.istek("PATCH", "?id=eq.%s" % eski["id"], alanlar)
        tazelenen += 1

    if yeni and not kuru:
        # PostgREST toplu eklemede butun nesnelerin ayni anahtarlari tasimasini istiyor.
        anahtarlar = set().union(*(y.keys() for y in yeni))
        yeni = [{a: y.get(a) for a in anahtarlar} for y in yeni]
        for y in yeni:
            y["score_reasons"] = y["score_reasons"] or []
            y["areas"] = y["areas"] or []
        postings.istek("POST", "", yeni, prefer="return=minimal")
    print("yeni: %d  tazelenen: %d  atlanan: %d%s" % (len(yeni), tazelenen, atlanan, "  (KURU)" if kuru else ""))


def esle():
    postings, basvurular = Tablo("job_postings"), Tablo("job_applications")
    adaylar = postings.istek("GET", "?select=id,platform,external_id,company,position&decision=in.(yeni,listede)")
    esleyen = 0
    for p in {a["platform"] for a in adaylar}:
        kimlikler = [a["external_id"] for a in adaylar if a["platform"] == p]
        var = {s["external_id"] for s in basvurular.istek(
            "GET", "?select=external_id&platform=eq.%s&external_id=in.(%s)" % (p, in_listesi(kimlikler)))}
        for a in adaylar:
            if a["platform"] == p and a["external_id"] in var:
                postings.istek("PATCH", "?id=eq.%s" % a["id"], {"decision": "basvuruldu"})
                print("BASVURULDU  %s / %s" % (a["company"], a["position"]))
                esleyen += 1
    print("eslenen: %d" % esleyen)


def onyazi(girdiler, uzerine_yaz):
    postings = Tablo("job_postings")
    from datetime import datetime, timezone

    simdi = datetime.now(timezone.utc).isoformat()
    for g in girdiler:
        if g.get("lang") not in ("tr", "en") or not (g.get("metin") or "").strip():
            print("ATLANDI (lang ya da metin eksik): %s" % g.get("external_id"))
            continue
        bulunan = postings.istek(
            "GET",
            "?select=id,company,decision,cover_letter_confirmed&platform=eq.%s&external_id=eq.%s"
            % (g["platform"], in_listesi([g["external_id"]]).strip('"')),
        )
        if not bulunan:
            print("ATLANDI (ilan yok): %s" % g["external_id"])
            continue
        s = bulunan[0]
        if s["decision"] not in ("yeni", "listede"):
            print("ATLANDI (karar: %s): %s" % (s["decision"], s["company"]))
            continue
        if s["cover_letter_confirmed"] and not uzerine_yaz:
            print("KORUNDU  onayli on yazi var: %s" % s["company"])
            continue
        postings.istek("PATCH", "?id=eq.%s" % s["id"], {
            "cover_letter": g["metin"].strip(),
            "cover_letter_lang": g["lang"],
            "cover_letter_confirmed": False,
            "cover_letter_updated_at": simdi,
        })
        print("TASLAK   %s  (%s, %d kelime)" % (s["company"], g["lang"], len(g["metin"].split())))


def main():
    utf8_cikti()
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    komut = sys.argv[1]
    if komut == "bilinen" and len(sys.argv) >= 3:
        bilinen(sys.argv[2])
    elif komut == "yaz" and len(sys.argv) >= 3:
        yaz(json.load(io.open(sys.argv[2], encoding="utf-8")), "--kuru" in sys.argv)
    elif komut == "esle":
        esle()
    elif komut == "onyazi" and len(sys.argv) >= 3:
        onyazi(json.load(io.open(sys.argv[2], encoding="utf-8")), "--uzerine-yaz" in sys.argv)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
