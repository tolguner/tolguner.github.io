import type { Metadata } from "next";

/**
 * `/admin` altindaki HER sayfa icin noindex — giris sayfasi dahil.
 * `robots.txt` zaten `/admin`i engelliyor; bu ikinci katman, engellenen bir
 * adresin baska bir yerden baglanti alip yine de dizine girmesine karsi.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminDuzen({ children }: { children: React.ReactNode }) {
  return children;
}
