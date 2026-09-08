'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LienSidebar({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const actif = pathname === href

  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={
        actif
          ? { backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }
          : { color: 'rgba(255,255,255,0.65)' }
      }
    >
      {label}
    </Link>
  )
}