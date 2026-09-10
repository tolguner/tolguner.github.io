import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Oturum tazeleme.
 *
 * Notlar (bu API yakin zamanda degisti):
 *  - Dosya adi Next 15'te `middleware.ts`; Supabase dokumanindaki `proxy.ts`
 *    Next 16 adlandirmasi ve bu projede kullanilirsa auth hic calismaz.
 *  - `createServerClient(...)` ile `getClaims()` arasina KOD GIRMEYECEK;
 *    aradaki her is rastgele cikislara yol aciyor.
 *  - `getClaims()` JWT'yi yerel dogruluyor, her istekte network cagrisi yok.
 *  - `setAll` ikinci argumani (`headers`) yanita forward edilmeli.
 *
 * Bu middleware yalnizca UX icin: gercek kapi korumali layout'taki `getUser()`
 * kontrolu ve veritabanindaki RLS.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(yazilacaklar, headers) {
          for (const { name, value, options } of yazilacaklar) {
            response.cookies.set(name, value, options);
          }
          if (headers) {
            for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  /**
   * Yonlendirme YENI bir yanit nesnesidir; yukarida `response` uzerine yazilan
   * tazelenmis oturum cerezleri onda YOKTUR. Kopyalanmazsa Supabase token'i
   * tazeler, yonlendirme onu atar, eski refresh token da tuketilmis oldugu icin
   * oturum kalici olarak duser — kullanici durup dururken cikis yapmis olur.
   */
  const yonlendir = (url: URL) => {
    const r = NextResponse.redirect(url);
    for (const cerez of response.cookies.getAll()) r.cookies.set(cerez);
    return r;
  };

  // `trailingSlash: true` acik: gercek yol "/admin/login/" seklinde geliyor.
  // Sondaki egik cizgi kirpilmazsa giris sayfasi kendini yonlendirir.
  const yol = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const girisSayfasi = yol === "/admin/login";

  if (!data?.claims && yol.startsWith("/admin") && !girisSayfasi) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("nereden", yol);
    return yonlendir(url);
  }

  if (data?.claims && girisSayfasi) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return yonlendir(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
