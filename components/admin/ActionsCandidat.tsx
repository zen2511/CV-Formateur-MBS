'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  candidatId: string
  statutActuel: string
}

export default function ActionsCandidat({ candidatId, statutActuel }: Props) {
  const router = useRouter()
  const [enCours, setEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState('')

  async function executer(action: 'accepter' | 'rejeter' | 'recalculer') {
    if (action === 'accepter' && !confirm('Confirmer l\u2019acceptation définitive de ce candidat ? Un email lui sera envoyé.')) return
    if (action === 'rejeter' && !confirm('Confirmer le rejet de cette candidature ?')) return

    setEnCours(action)
    setErreur('')

    try {
      const res = await fetch(`/api/admin/candidatures/${candidatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        setEnCours(null)
        return
      }

      router.refresh()
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnCours(null)
    }
  }

  if (statutActuel !== 'SOUMISE' && statutActuel !== 'PRESELECTIONNEE') {
    return (
      <p className="text-sm text-slate-500">
        Cette candidature est déjà <strong>{statutActuel}</strong> — aucune action supplémentaire disponible.
      </p>
    )
  }

  return (
    <div>
      {erreur && <p className="text-sm text-red-600 mb-3">{erreur}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => executer('accepter')}
          disabled={enCours !== null}
          className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-60"
          style={{ backgroundColor: 'var(--cfp-green)' }}
        >
          {enCours === 'accepter' ? 'Traitement...' : 'Accepter définitivement'}
        </button>
        <button
          onClick={() => executer('rejeter')}
          disabled={enCours !== null}
          className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-60"
          style={{ backgroundColor: 'var(--cfp-red)' }}
        >
          {enCours === 'rejeter' ? 'Traitement...' : 'Rejeter'}
        </button>
        <button
          onClick={() => executer('recalculer')}
          disabled={enCours !== null}
          className="text-sm font-medium px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-60"
        >
          {enCours === 'recalculer' ? 'Calcul...' : 'Recalculer le score'}
        </button>
      </div>
    </div>
  )
}