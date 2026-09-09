'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BoutonSupprimerCompte({ compteId, email }: { compteId: string; email: string }) {
  const router = useRouter()
  const [enCours, setEnCours] = useState(false)

  async function handleSupprimer() {
    if (!confirm(`Supprimer le compte admin ${email} ?`)) return

    setEnCours(true)
    try {
      const res = await fetch(`/api/admin/comptes/${compteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'Échec de la suppression.')
        return
      }
      router.refresh()
    } finally {
      setEnCours(false)
    }
  }

  return (
    <button onClick={handleSupprimer} disabled={enCours} className="text-xs text-red-500 hover:underline disabled:opacity-50">
      {enCours ? '...' : 'Supprimer'}
    </button>
  )
}