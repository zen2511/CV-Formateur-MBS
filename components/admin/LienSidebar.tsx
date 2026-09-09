'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LienSidebar({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const actif = pathname === href

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative"
      style={
        actif
          ? { backgroundColor: 'rgba(255,255,255,0.10)', color: 'white' }
          : { color: 'rgba(255,255,255,0.60)' }
      }
    >
      {actif && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r"
          style={{ backgroundColor: 'var(--cfp-red)' }}
        />
      )}
      <span className="pl-1">{label}</span>
    </Link>
  )
}