'use client'

import { useState } from 'react'

type Props = {
  label: string
  valeurActuelle?: string | null
  onUploaded: (url: string) => void
  requis?: boolean
}

export default function ChampFichier({ label, valeurActuelle, onUploaded, requis }: Props) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0]
    if (!fichier) return

    setEnCours(true)
    setErreur('')

    const formData = new FormData()
    formData.append('fichier', fichier)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? "Echec de l'envoi")
        return
      }

      onUploaded(data.url)
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label} {requis && <span className="text-red-500">*</span>}
      </span>
      <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2.5 text-sm">
        <input type="file" accept=".pdf,image/*" onChange={handleFile} className="text-xs" />
        {enCours && <p className="text-xs mt-1" style={{ color: 'var(--cfp-blue)' }}>Envoi en cours...</p>}
        {valeurActuelle && !enCours && (
          <p className="text-xs mt-1 text-green-600">✓ Fichier déjà envoyé</p>
        )}
        {erreur && <p className="text-xs mt-1 text-red-600">{erreur}</p>}
      </div>
    </label>
  )
}