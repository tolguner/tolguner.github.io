"""Basvuru betiklerinin ortak Supabase REST istemcisi.

`.env.local` icindeki SUPABASE_SECRET_KEY ile PostgREST'e gider; anahtar RLS'i
atlar ve YALNIZCA yerelde bulunur, Vercel'e konmaz.
"""

import io
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def utf8_cikti():
    """Windows konsolu cp1254/cp437; Turkce adlar bozuk basilinca eslestirme sasiyor."""
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def ortam():
    deger = {}
    for satir in io.open(os.path.join(KOK, ".env.local"), encoding="utf-8"):
        if "=" in satir and not satir.strip().startswith("#"):
            anahtar, ham = satir.strip().split("=", 1)
            deger[anahtar] = ham.strip().strip('"')
    return deger


class Tablo:
    def __init__(self, ad):
        env = ortam()
        gizli = env["SUPABASE_SECRET_KEY"]
        self.taban = env["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/" + ad
        self.basliklar = {"apikey": gizli, "Authorization": "Bearer " + gizli, "Content-Type": "application/json"}

    def istek(self, yontem, sorgu="", govde=None, prefer=None):
        basliklar = dict(self.basliklar)
        if prefer:
            basliklar["Prefer"] = prefer
        veri = json.dumps(govde).encode("utf-8") if govde is not None else None
        r = urllib.request.Request(self.taban + sorgu, data=veri, method=yontem, headers=basliklar)
        try:
            with urllib.request.urlopen(r, timeout=60) as yanit:
                icerik = yanit.read().decode("utf-8")
                return json.loads(icerik) if icerik else None
        except urllib.error.HTTPError as h:
            # PostgREST hatanin nedenini govdede veriyor; onsuz "400 Bad Request" hicbir sey soylemiyor.
            raise RuntimeError("%s %s: %s" % (yontem, h.code, h.read().decode("utf-8", "replace")[:400])) from None


def in_listesi(degerler):
    """PostgREST `in.(...)` icin tirnakli, URL'ye guvenli liste."""
    ham = ",".join('"%s"' % str(d).replace('"', "") for d in degerler)
    return urllib.parse.quote(ham, safe=',"')
