// app/admin/login/page.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
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
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        setEnvoiEnCours(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setErreur('Impossible de contacter le serveur.')
      setEnvoiEnCours(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--cfp-navy)' }}>
      <div className="w-full max-w-sm carte-cfp rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-6 text-center">Espace Admin CFP-MBS</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</span>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </label>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={envoiEnCours}
            style={{ backgroundColor: 'var(--cfp-navy)' }}
            className="w-full rounded-lg text-white text-sm font-medium py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {envoiEnCours ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}