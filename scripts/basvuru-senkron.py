"""Is basvurularini job_applications tablosuna yazar.

Kullanim:
    python scripts/basvuru-senkron.py <kayitlar.json> <platform> [status] [posting_status]

Kayit dosyasi su sirayla alan tasiyan dizilerden olusur:
    [external_id, job_url, position, company, location, work_mode, applied_at]

Veri platformlarin KENDI sayfalarindan tarayici uzerinden cikariliyor (API yok);
bu betik sadece yazma adimini ustleniyor. `on_conflict=platform,external_id`
sayesinde ayni ilan ikinci kez eklenmiyor, mevcut satir guncelleniyor.

SUPABASE_SECRET_KEY RLS'i atlar ve YALNIZCA yerelde bulunur; Vercel'e konmaz.
"""

import io
import json
import os
import sys
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def ortam():
    deger = {}
    for satir in io.open(os.path.join(KOK, ".env.local"), encoding="utf-8"):
        if "=" in satir and not satir.strip().startswith("#"):
            anahtar, ham = satir.strip().split("=", 1)
            deger[anahtar] = ham.strip().strip('"')
    return deger


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    env = ortam()
    url, gizli = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SECRET_KEY"]
    platform = sys.argv[2]
    durum = sys.argv[3] if len(sys.argv) > 3 else "basvuruldu"
    ilan_durumu = sys.argv[4] if len(sys.argv) > 4 else "bilinmiyor"

    kayitlar = json.load(io.open(sys.argv[1], encoding="utf-8"))
    govde = [
        {
            "platform": platform,
            "external_id": k[0],
            "job_url": k[1],
            "position": k[2],
            "company": k[3],
            "location": k[4],
            "work_mode": k[5],
            "applied_at": k[6],
            "status": durum,
            "posting_status": ilan_durumu,
            "source": "senkron",
        }
        for k in kayitlar
    ]

    istek = urllib.request.Request(
        url + "/rest/v1/job_applications?on_conflict=platform,external_id",
        data=json.dumps(govde).encode("utf-8"),
        method="POST",
        headers={
            "apikey": gizli,
            "Authorization": "Bearer " + gizli,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
    )
    with urllib.request.urlopen(istek, timeout=60) as yanit:
        print("yazilan:", len(json.loads(yanit.read().decode("utf-8"))))


if __name__ == "__main__":
    main()
