'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function FormulaireNouveauCompte() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur('')
    setEnvoiEnCours(true)

    try {
      const res = await fetch('/api/admin/comptes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        return
      }

      setEmail('')
      setMotDePasse('')
      router.refresh()
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-md mb-6">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Ajouter un compte admin</h2>
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <button
          type="submit"
          disabled={envoiEnCours}
          className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-60"
          style={{ backgroundColor: 'var(--cfp-navy)' }}
        >
          {envoiEnCours ? 'Création...' : 'Créer le compte'}
        </button>
      </div>
    </form>
  )
}