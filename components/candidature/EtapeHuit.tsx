// components/candidature/EtapeHuit.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Candidat } from '../../src/generated/prisma/client'

type Props = {
  candidat: Candidat
  token: string
}

export default function EtapeHuit({ candidat, token }: Props) {
  const router = useRouter()
  const [signatureNom, setSignatureNom] = useState(candidat.nomComplet ?? '')
  const [certifie, setCertifie] = useState(false)
  const [accepteConditions, setAccepteConditions] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  async function handleSoumettre() {
    setErreur('')

    if (!signatureNom.trim()) {
      setErreur('Merci de saisir votre nom complet en guise de signature.')
      return
    }
    if (!certifie || !accepteConditions) {
      setErreur('Merci de cocher les deux cases de declaration avant de soumettre.')
      return
    }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/soumettre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureNom }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        setEnvoiEnCours(false)
        return
      }

      router.push('/confirmation')
    } catch {
      setErreur('Impossible de contacter le serveur.')
      setEnvoiEnCours(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto carte-cfp rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Etape 8 - Declaration finale et signature
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Derniere etape avant l&apos;envoi de votre candidature au CFP-MBS.
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={certifie}
              onChange={(e) => setCertifie(e.target.checked)}
            />
            <span>
              Je certifie sur l&apos;honneur que toutes les informations fournies dans cette
              candidature sont exactes et completes.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={accepteConditions}
              onChange={(e) => setAccepteConditions(e.target.checked)}
            />
            <span>
              J&apos;accepte que le CFP-MBS verifie les informations et documents fournis, et je
              comprends que toute fausse declaration peut entrainer le rejet de ma candidature.
            </span>
          </label>
        </div>

        <label className="block mb-6">
          <span className="block text-sm font-medium text-slate-700 mb-1">
            Signature (nom complet) *
          </span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            value={signatureNom}
            onChange={(e) => setSignatureNom(e.target.value)}
            placeholder="Tapez votre nom complet"
          />
        </label>

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/7`)}
            className="rounded-lg text-sm font-medium px-5 py-2.5 border"
            style={{ borderColor: 'var(--cfp-navy)', color: 'var(--cfp-navy)' }}
          >
            Precedent
          </button>
          <button
            onClick={handleSoumettre}
            disabled={envoiEnCours}
            style={{ backgroundColor: 'var(--cfp-navy)' }}
            className="rounded-lg text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {envoiEnCours ? 'Envoi en cours...' : 'Soumettre ma candidature'}
          </button>
        </div>
      </div>
    </main>
  )
}