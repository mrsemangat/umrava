'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Fires InitiateCheckout for new users (Google OAuth) who land on /dashboard?welcome=1
export function PixelNewUser() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!searchParams.get('welcome')) return

    let attempts = 0
    const fire = () => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          value: 49000,
          currency: 'IDR',
          content_name: 'Umrava Premium',
        })
        // Bersihkan query param dari URL tanpa reload
        const url = new URL(window.location.href)
        url.searchParams.delete('welcome')
        router.replace(url.pathname + (url.search || ''))
        return
      }
      if (++attempts < 20) setTimeout(fire, 300)
    }
    fire()
  }, [searchParams, router])

  return null
}
