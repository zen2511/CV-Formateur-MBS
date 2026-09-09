'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Etat = 'idle' | 'loading' | 'erreur'

export default function AccueilForm() {
  const router = useRouter()
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [email, setEmail] = useState('')
  const [etat, setEtat] = useState<Etat>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEtat('loading')
    setMessage('')

    try {
      const res = await fetch('/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setEtat('erreur')
        setMessage(data.error ?? 'Une erreur est survenue. Réessayez.')
        return
      }

      router.push(`/candidature/${data.token}/etape/${data.etapeCourante}`)
    } catch {
      setEtat('erreur')
      setMessage('Impossible de contacter le serveur. Vérifiez votre connexion.')
    }
  }

  return (
    <main
      className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--cfp-navy)' }}
    >
      <div className="w-full max-w-xl carte-cfp rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: 'var(--cfp-red)' }} />
          <div className="flex-1" style={{ backgroundColor: 'var(--cfp-blue)' }} />
          <div className="flex-1" style={{ backgroundColor: 'var(--cfp-green)' }} />
        </div>

        <div className="p-10 text-center">
          <Image src="/logo-mbs.png" alt="CFP-MBS" width={90} height={90} className="rounded-full mb-6 mx-auto shadow-md" priority />

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--cfp-navy)' }}>
            Portail Consultant Formateur CFP-MBS
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
            Rejoignez notre répertoire de formateurs certifiés, locaux et internationaux,
            et participez à nos missions de formation professionnelle.
          </p>
          <p className="text-xs font-semibold mb-7" style={{ color: 'var(--cfp-red)' }}>
            Vos données personnelles sont protégées à 100%.
          </p>

          {!afficherFormulaire ? (
            <>
              <button
                onClick={() => setAfficherFormulaire(true)}
                className="text-white text-sm font-semibold px-9 py-3 rounded-lg mb-3.5 shadow-sm hover:opacity-90 hover:shadow-md transition-all"
                style={{ backgroundColor: 'var(--cfp-red)' }}
              >
                Commencer ma candidature
              </button>
              <button
                onClick={() => setAfficherFormulaire(true)}
                className="text-xs underline block mx-auto hover:opacity-70 transition-opacity"
                style={{ color: 'var(--cfp-blue)' }}
              >
                J&apos;ai déjà commencé - reprendre ma candidature par email
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--cfp-navy)' } as React.CSSProperties}
              />
              {etat === 'erreur' && <p className="text-sm text-red-600">{message}</p>}
              <button
                type="submit"
                disabled={etat === 'loading'}
                className="w-full text-white text-sm font-semibold px-9 py-3 rounded-lg disabled:opacity-60 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--cfp-red)' }}
              >
                {etat === 'loading' ? 'Connexion...' : 'Continuer'}
              </button>
            </form>
          )}

          <div className="flex gap-3.5 mt-9 flex-wrap justify-center">
            <div className="border-t-2 border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-left w-36" style={{ borderTopColor: 'var(--cfp-navy)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--cfp-navy)' }}>6 étapes</p>
              <p className="text-[11px] text-slate-500">5 à 10 minutes</p>
            </div>
            <div className="border-t-2 border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-left w-36" style={{ borderTopColor: 'var(--cfp-blue)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--cfp-navy)' }}>Sauvegarde</p>
              <p className="text-[11px] text-slate-500">reprise par lien magique</p>
            </div>
            <div className="border-t-2 border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-left w-36" style={{ borderTopColor: 'var(--cfp-green)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--cfp-navy)' }}>Confidentiel</p>
              <p className="text-[11px] text-slate-500">données protégées</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}