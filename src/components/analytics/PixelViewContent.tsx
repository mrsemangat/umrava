'use client'
import { useEffect } from 'react'

export function PixelViewContent({ contentName }: { contentName: string }) {
  useEffect(() => {
    let attempts = 0
    const fire = () => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', { content_name: contentName })
        return
      }
      if (++attempts < 20) setTimeout(fire, 300)
    }
    fire()
  }, [contentName])
  return null
}
