'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BoutonSupprimerCandidat({ candidatId, nom }: { candidatId: string; nom: string }) {
  const router = useRouter()
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  async function handleSupprimer() {
    if (!confirm(`Supprimer définitivement la candidature de ${nom} ? Cette action est irréversible.`)) return

    setSuppressionEnCours(true)
    try {
      const res = await fetch(`/api/admin/candidatures-acceptees/${candidatId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Échec de la suppression.')
      }
    } finally {
      setSuppressionEnCours(false)
    }
  }

  return (
    <button
      onClick={handleSupprimer}
      disabled={suppressionEnCours}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {suppressionEnCours ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}