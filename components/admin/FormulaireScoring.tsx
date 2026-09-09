'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  configActuelle: {
    version: number
    poidsCertifications: number
    poidsExperience: number
    poidsDiplomes: number
    poidsDisponibilite: number
  }
}

export default function FormulaireScoring({ configActuelle }: Props) {
  const router = useRouter()
  const [poids, setPoids] = useState({
    poidsCertifications: configActuelle.poidsCertifications,
    poidsExperience: configActuelle.poidsExperience,
    poidsDiplomes: configActuelle.poidsDiplomes,
    poidsDisponibilite: configActuelle.poidsDisponibilite,
  })
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const total = Object.values(poids).reduce((a, b) => a + b, 0)

  async function handleSubmit() {
    setErreur('')
    setSucces(false)
    setEnvoiEnCours(true)

    try {
      const res = await fetch('/api/admin/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poids),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        return
      }

      setSucces(true)
      router.refresh()
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const champs: { cle: keyof typeof poids; label: string }[] = [
    { cle: 'poidsCertifications', label: 'Certifications' },
    { cle: 'poidsExperience', label: 'Expérience' },
    { cle: 'poidsDiplomes', label: 'Diplômes' },
    { cle: 'poidsDisponibilite', label: 'Disponibilité' },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
      <p className="text-xs text-slate-400 mb-4">Version actuelle : v{configActuelle.version}</p>

      <div className="space-y-4">
        {champs.map((c) => (
          <div key={c.cle}>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">{c.label}</label>
              <span className="text-sm text-slate-500">{poids[c.cle]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={poids[c.cle]}
              onChange={(e) => setPoids({ ...poids, [c.cle]: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <p className={`text-xs mt-4 ${total === 100 ? 'text-slate-400' : 'font-semibold'}`} style={total !== 100 ? { color: 'var(--cfp-red)' } : {}}>
        Total : {total}% {total !== 100 && '— idéalement 100% (le calcul reste normalisé quel que soit le total, mais 100% facilite la lecture)'}
      </p>

      {erreur && <p className="text-sm text-red-600 mt-3">{erreur}</p>}
      {succes && <p className="text-sm mt-3" style={{ color: 'var(--cfp-green)' }}>Nouvelle version enregistrée.</p>}

      <button
        onClick={handleSubmit}
        disabled={envoiEnCours}
        className="mt-4 text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-60"
        style={{ backgroundColor: 'var(--cfp-navy)' }}
      >
        {envoiEnCours ? 'Enregistrement...' : 'Enregistrer une nouvelle version'}
      </button>

      <p className="text-xs text-slate-400 mt-3">
        Cette action crée une nouvelle version de configuration — les candidats déjà notés gardent leur score
        actuel jusqu&apos;à ce que tu cliques sur &quot;Recalculer&quot; sur leur fiche.
      </p>
    </div>
  )
}