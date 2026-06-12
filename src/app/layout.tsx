import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { GTMScript, GTMNoScript } from "@/components/analytics/GTM"
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import { SessionProvider } from "next-auth/react"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Umrava — Teman Setia Perjalanan Umrohmu",
  description: "Platform lengkap untuk calon jamaah umroh Indonesia. Al-Quran, panduan ibadah, kompas kiblat, bank doa, perencanaan biaya, dan spot foto terbaik di Tanah Suci.",
  keywords: "umroh, panduan umroh, doa umroh, tawaf, sa'i, makkah, madinah, al-quran, kompas kiblat",
  openGraph: {
    title: "Umrava — Teman Setia Perjalanan Umrohmu",
    description: "Dari persiapan sampai pulang — semua ada di Umrava",
    type: "website",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

async function getSiteSettings(): Promise<{ pixelId: string; gtmId: string }> {
  try {
    const rows = await db.select().from(siteSettings)
      .where(inArray(siteSettings.key, ['meta_pixel_id', 'gtm_id']))
    const map: Record<string, string> = {}
    for (const row of rows) map[row.key] = row.value
    return { pixelId: map.meta_pixel_id ?? '', gtmId: map.gtm_id ?? '' }
  } catch {
    return {
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
      gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? '',
    }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { pixelId, gtmId } = await getSiteSettings()

  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus Jakarta+Sans:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <GTMNoScript gtmId={gtmId} />
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-center" richColors />
        <GTMScript gtmId={gtmId} />
        <MetaPixel pixelId={pixelId} />
      </body>
    </html>
  )
}
