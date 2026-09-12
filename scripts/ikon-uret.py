# -*- coding: utf-8 -*-
"""
Site ikonunu uretir: src/app/{icon.svg, apple-icon.png, favicon.ico}

    python scripts/ikon-uret.py

Neden betik: ikon uc formatta duruyor ve elle senkron tutulursa kacinilmaz
olarak birbirinden ayrilir. Geometri BURADA tek yerde tanimli, uc cikti da
ayni sayilardan uretiliyor.

Tasarim: koyu lacivert yuvarlatilmis kare uzerinde serif "T." — nokta harfin
yaninda, taban cizgisinde. Harf bir YAZI TIPINDEN degil, elle tanimlanmis
geometriden: ikon her yerde ayni gorunuyor ve lisansli bir yazi tipine
bagimli olmuyor.
"""
from pathlib import Path

from PIL import Image, ImageDraw

KOK = Path(__file__).resolve().parent.parent
HEDEF = KOK / "src" / "app"

# --- Renkler (globals.css ile ayni) ---------------------------------------
ZEMIN = "#0b1524"   # --color-hero: birincil metin / koyu tema zemini
HARF = "#e9eef7"    # --color-space: acik tema zemini
NOKTA = "#2f5ce0"   # --color-brand: vurgu mavisi

# --- Geometri (64x64 birimlik tuval) --------------------------------------
BOY = 64
YARICAP = 14        # yuvarlatilmis kare

# Serif "T": ust cubuk + iki ucta asagi inen tirnaklar + govde + taban ayagi.
# Harf 5 birim sola kaydirildi ki noktayla birlikte optik olarak ortalansin.
KAYMA = -5
UST_BAR = (14, 17, 50, 21.5)          # sol, ust, sag, alt
TIRNAK_SOL = (14, 17, 17.2, 26.5)
TIRNAK_SAG = (46.8, 17, 50, 26.5)
GOVDE = (27.4, 21.5, 36.6, 49.3)
TABAN = (23.4, 49.3, 40.6, 52)

NOKTA_MERKEZ = (51, 48.7)
NOKTA_YARICAP = 3.3


def kaydir(k):
    sol, ust, sag, alt = k
    return (sol + KAYMA, ust, sag + KAYMA, alt)


HARF_PARCALARI = [kaydir(k) for k in (UST_BAR, TIRNAK_SOL, TIRNAK_SAG, GOVDE, TABAN)]


def svg_yaz():
    """SVG: tarayicinin kullandigi birincil ikon, her olcude keskin."""
    parcalar = "\n".join(
        f'  <rect x="{s:g}" y="{u:g}" width="{sa - s:g}" height="{a - u:g}" fill="{HARF}"/>'
        for s, u, sa, a in HARF_PARCALARI
    )
    icerik = f"""<svg width="{BOY}" height="{BOY}" viewBox="0 0 {BOY} {BOY}" xmlns="http://www.w3.org/2000/svg">
  <title>Tolga Olguner</title>
  <rect width="{BOY}" height="{BOY}" rx="{YARICAP}" fill="{ZEMIN}"/>
  <!-- Serif "T." — scripts/ikon-uret.py tarafindan uretildi, elle duzenlemeyin. -->
{parcalar}
  <circle cx="{NOKTA_MERKEZ[0]:g}" cy="{NOKTA_MERKEZ[1]:g}" r="{NOKTA_YARICAP:g}" fill="{NOKTA}"/>
</svg>
"""
    (HEDEF / "icon.svg").write_text(icerik, encoding="utf-8")
    return len(icerik)


def raster(olcu):
    """Ayni geometriyi PIL ile cizer. 8 kat buyuk cizip kucultuyoruz:
    PIL'in kendi kenar yumusatmasi zayif, asagi ornekleme daha temiz."""
    k = 8
    n = olcu * k
    o = n / BOY  # birim -> piksel
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, n - 1, n - 1], radius=YARICAP * o, fill=ZEMIN)
    for s, u, sa, a in HARF_PARCALARI:
        d.rectangle([s * o, u * o, sa * o, a * o], fill=HARF)
    nx, ny = NOKTA_MERKEZ
    r = NOKTA_YARICAP * o
    d.ellipse([nx * o - r, ny * o - r, nx * o + r, ny * o + r], fill=NOKTA)
    return im.resize((olcu, olcu), Image.LANCZOS)


if __name__ == "__main__":
    print("icon.svg      :", svg_yaz(), "bayt")

    # iOS ana ekran ikonu
    elma = raster(180)
    elma.save(HEDEF / "apple-icon.png")
    print("apple-icon.png:", (HEDEF / "apple-icon.png").stat().st_size, "bayt", elma.size)

    # /favicon.ico'yu dogrudan yoklayan tarayici ve tarayicilar icin
    raster(48).save(HEDEF / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("favicon.ico   :", (HEDEF / "favicon.ico").stat().st_size, "bayt")
