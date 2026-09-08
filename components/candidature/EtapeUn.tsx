// components/candidature/EtapeUn.tsx
'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Candidat } from '../../src/generated/prisma/client'
import ChampFichier from './ChampFichier'

type Props = {
  candidat: Candidat
  token: string
}

type FormData = {
  nomComplet: string
  sexe: string
  dateNaissance: string
  nationalite: string
  paysResidence: string
  villeResidence: string
  whatsapp: string
  linkedin: string
  typeFormateur: string
  titreProfessionnel: string
  languesParlees: string
  cvUrl: string
}

function versFormData(c: Candidat): FormData {
  return {
    nomComplet: c.nomComplet ?? '',
    sexe: c.sexe ?? '',
    dateNaissance: c.dateNaissance ? new Date(c.dateNaissance).toISOString().slice(0, 10) : '',
    nationalite: c.nationalite ?? '',
    paysResidence: c.paysResidence ?? '',
    villeResidence: c.villeResidence ?? '',
    whatsapp: c.whatsapp ?? '',
    linkedin: c.linkedin ?? '',
    typeFormateur: c.typeFormateur ?? '',
    titreProfessionnel: c.titreProfessionnel ?? '',
    languesParlees: c.languesParlees ?? '',
    cvUrl: c.cvUrl ?? '',
  }
}

const CHAMPS_REQUIS: (keyof FormData)[] = [
  'nomComplet', 'sexe', 'nationalite', 'paysResidence', 'villeResidence',
  'typeFormateur', 'titreProfessionnel', 'cvUrl',
]

export default function EtapeUn({ candidat, token }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(versFormData(candidat))
  const [statutSauvegarde, setStatutSauvegarde] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [erreurSuivant, setErreurSuivant] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sauvegarder = useCallback(async (data: FormData) => {
    setStatutSauvegarde('saving')
    try {
      const res = await fetch(`/api/candidature/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setStatutSauvegarde(res.ok ? 'saved' : 'error')
    } catch {
      setStatutSauvegarde('error')
    }
  }, [token])

  function handleChange(champ: keyof FormData, valeur: string) {
    const nouveauForm = { ...form, [champ]: valeur }
    setForm(nouveauForm)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      sauvegarder(nouveauForm)
    }, 1000)
  }

  function handleFichierUploaded(url: string) {
  const nouveauForm = { ...form, cvUrl: url }
  setForm(nouveauForm)
  sauvegarder(nouveauForm)
}

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const champsManquants = CHAMPS_REQUIS.filter((c) => !form[c])

  async function handleSuivant() {
    setErreurSuivant('')

    if (champsManquants.length > 0) {
      setErreurSuivant('Merci de completer tous les champs obligatoires (marques *).')
      return
    }

    setEnvoiEnCours(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    await sauvegarder(form)

    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 1 }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreurSuivant(data.error ?? 'Une erreur est survenue.')
        setEnvoiEnCours(false)
        return
      }

      router.push(`/candidature/${token}/etape/${data.prochaineEtape}`)
    } catch {
      setErreurSuivant('Impossible de contacter le serveur.')
      setEnvoiEnCours(false)
    }
  }

  const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto carte-cfp rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Etape 1 - Informations personnelles
          </h1>
          <span className="text-xs text-slate-400">
            {statutSauvegarde === 'saving' && 'Enregistrement...'}
            {statutSauvegarde === 'saved' && 'Enregistre'}
            {statutSauvegarde === 'error' && 'Erreur de sauvegarde'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ label="Nom complet" requis>
            <input
              className={champClasse}
              value={form.nomComplet}
              onChange={(e) => handleChange('nomComplet', e.target.value)}
            />
          </Champ>

          <Champ label="Sexe" requis>
            <select
              className={champClasse}
              value={form.sexe}
              onChange={(e) => handleChange('sexe', e.target.value)}
            >
              <option value="">Selectionner</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </Champ>

          <Champ label="Date de naissance">
            <input
              type="date"
              className={champClasse}
              value={form.dateNaissance}
              onChange={(e) => handleChange('dateNaissance', e.target.value)}
            />
          </Champ>

          <Champ label="Nationalite" requis>
            <input
              className={champClasse}
              value={form.nationalite}
              onChange={(e) => handleChange('nationalite', e.target.value)}
            />
          </Champ>

          <Champ label="Pays de residence" requis>
            <input
              className={champClasse}
              value={form.paysResidence}
              onChange={(e) => handleChange('paysResidence', e.target.value)}
            />
          </Champ>

          <Champ label="Ville de residence" requis>
            <input
              className={champClasse}
              value={form.villeResidence}
              onChange={(e) => handleChange('villeResidence', e.target.value)}
            />
          </Champ>

          <Champ label="WhatsApp">
            <input
              className={champClasse}
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
            />
          </Champ>

          <Champ label="LinkedIn">
            <input
              className={champClasse}
              value={form.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
          </Champ>

          <Champ label="Type de formateur" requis>
            <select
              className={champClasse}
              value={form.typeFormateur}
              onChange={(e) => handleChange('typeFormateur', e.target.value)}
            >
              <option value="">Selectionner</option>
              <option value="LOCAL">Local</option>
              <option value="INTERNATIONAL">International</option>
              <option value="DIASPORA">Diaspora</option>
            </select>
          </Champ>

          <Champ label="Titre professionnel" requis>
            <input
              className={champClasse}
              value={form.titreProfessionnel}
              onChange={(e) => handleChange('titreProfessionnel', e.target.value)}
            />
          </Champ>
          <Champ label="Langues parlees" className="sm:col-span-2">
            <input
              className={champClasse}
              placeholder="Francais, Anglais..."
              value={form.languesParlees}
              onChange={(e) => handleChange('languesParlees', e.target.value)}
            />
          </Champ>
        </div>

        <div className="mt-4">
          <ChampFichier
            label="CV en PDF"
            valeurActuelle={form.cvUrl}
            onUploaded={handleFichierUploaded}
            requis
          />
        </div>

        {erreurSuivant && (
          <p className="text-sm text-red-600 mt-4">{erreurSuivant}</p>
        )}

        <div className="mt-8 flex justify-end">
                    <button
            onClick={() => router.push('/')}
            className="rounded-lg text-sm font-medium px-5 py-2.5 border"
            style={{ borderColor: 'var(--cfp-navy)', color: 'var(--cfp-navy)' }}
          >
            Retour à l'accueil
          </button>
            <button
            onClick={handleSuivant}
            disabled={envoiEnCours}
            style={{ backgroundColor: 'var(--cfp-navy)' }}
            className="rounded-lg text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {envoiEnCours ? 'Enregistrement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </main>
  )
}

function Champ({
  label, requis, children, className = '',
}: {
  label: string
  requis?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label} {requis && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}