'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const ETAPES = [
  'Identité & coordonnées',
  "Domaines d'expertise",
  'Qualifications',
  'Expériences',
  'Disponibilité & tarifs',
  'Déclaration finale',
]

export default function CandidatLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const match = pathname.match(/\/etape\/(\d+)/)
  const etapeActuelle = match ? Number(match[1]) : null

  if (etapeActuelle) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--cfp-bg)' }}>
        <aside className="w-64 shrink-0 px-6 py-8" style={{ backgroundColor: 'var(--cfp-navy)' }}>
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo-mbs.png" alt="CFP-MBS" width={32} height={32} className="rounded-full" />
            <span className="text-white font-bold text-sm">CV+MBS</span>
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-white/50 mb-4">
            VOTRE CANDIDATURE
          </p>
          <nav className="space-y-1">
            {ETAPES.map((label, i) => {
              const numero = i + 1
              const estFaite = numero < etapeActuelle
              const estActive = numero === etapeActuelle
              return (
                <div key={label} className="flex items-center gap-2.5 py-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      backgroundColor: estFaite ? 'var(--cfp-green)' : estActive ? 'var(--cfp-red)' : 'transparent',
                      border: estFaite || estActive ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
                      color: estFaite || estActive ? 'white' : 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {estFaite ? '✓' : numero}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: estActive ? 'white' : 'rgba(255,255,255,0.55)',
                      fontWeight: estActive ? 600 : 400,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Image
            src="/logo-mbs.png"
            alt="CFP-MBS"
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--cfp-navy)' }}>
              CFP-MBS
            </p>
            <p className="text-xs text-slate-500">Candidature Formateur Certifie</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}