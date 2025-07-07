'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutClient() {
  const router = useRouter()

  useEffect(() => {
    localStorage.clear()
    sessionStorage.clear()
    router.replace('/login')
  }, [router])

  return null
}
