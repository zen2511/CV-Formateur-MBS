'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Diplome } from '../../src/generated/prisma/client'
import ChampFichier from './ChampFichier'

type Props = {
  token: string
  diplomesInitiaux: Diplome[]
}

const NIVEAUX = ['Bac', 'Bac+2', 'Licence', 'Master', 'Doctorat', 'Autre']

const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeTrois({ token, diplomesInitiaux }: Props) {
  const router = useRouter()
  const [diplomes, setDiplomes] = useState<Diplome[]>(diplomesInitiaux)
  const [formOuvert, setFormOuvert] = useState(diplomesInitiaux.length === 0)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const [nouveau, setNouveau] = useState({
    intitule: '', domaineEtudes: '', etablissement: '', pays: '', annee: '', niveau: '', fichierUrl: '',
  })

  async function ajouterDiplome() {
    setErreur('')
    if (!nouveau.intitule) {
      setErreur("Renseigne au moins l'intitulé du diplôme.")
      return
    }

    const res = await fetch(`/api/candidature/${token}/diplomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouveau),
    })

    if (!res.ok) {
      setErreur("Impossible d'ajouter ce diplôme.")
      return
    }

    const { diplome } = await res.json()
    setDiplomes((prev) => [...prev, diplome])
    setNouveau({ intitule: '', domaineEtudes: '', etablissement: '', pays: '', annee: '', niveau: '', fichierUrl: '' })
    setFormOuvert(false)
  }

  async function supprimerDiplome(id: string) {
    await fetch(`/api/candidature/${token}/diplomes/${id}`, { method: 'DELETE' })
    setDiplomes((prev) => prev.filter((d) => d.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    if (diplomes.length === 0) {
      setErreur('Ajoute au moins un diplôme avant de continuer.')
      return
    }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 3 }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error ?? 'Une erreur est survenue.')
        setEnvoiEnCours(false)
        return
      }

      router.push(`/candidature/${token}/etape/${data.prochaineEtape}`)
    } catch {
      setErreur('Impossible de contacter le serveur.')
      setEnvoiEnCours(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto carte-cfp rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Etape 3 - Diplomes</h1>
        <p className="text-sm text-slate-500 mb-6">Ajoute chacun de tes diplomes obtenus.</p>

        <div className="space-y-3 mb-4">
          {diplomes.map((d) => (
            <div key={d.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.intitule}</p>
                <p className="text-xs text-slate-500">
                  {d.niveau ?? '—'} {d.etablissement ? `\u00b7 ${d.etablissement}` : ''} {d.annee ? `\u00b7 ${d.annee}` : ''}
                </p>
              </div>
              <button onClick={() => supprimerDiplome(d.id)} className="text-xs text-red-500 hover:underline">
                Retirer
              </button>
            </div>
          ))}
        </div>

        {formOuvert ? (
          <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
            <input
              className={champClasse}
              placeholder="Intitule du diplome"
              value={nouveau.intitule}
              onChange={(e) => setNouveau({ ...nouveau, intitule: e.target.value })}
            />
            <input
              className={champClasse}
              placeholder="Domaine d'etudes"
              value={nouveau.domaineEtudes}
              onChange={(e) => setNouveau({ ...nouveau, domaineEtudes: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={champClasse}
                placeholder="Etablissement"
                value={nouveau.etablissement}
                onChange={(e) => setNouveau({ ...nouveau, etablissement: e.target.value })}
              />
              <input
                className={champClasse}
                placeholder="Pays"
                value={nouveau.pays}
                onChange={(e) => setNouveau({ ...nouveau, pays: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                className={champClasse}
                value={nouveau.niveau}
                onChange={(e) => setNouveau({ ...nouveau, niveau: e.target.value })}
              >
                <option value="">Niveau</option>
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <input
                type="number"
                className={champClasse}
                placeholder="Annee d'obtention"
                value={nouveau.annee}
                onChange={(e) => setNouveau({ ...nouveau, annee: e.target.value })}
              />
            </div>

            <ChampFichier
              label="Copie du diplome"
              valeurActuelle={nouveau.fichierUrl}
              onUploaded={(url) => setNouveau({ ...nouveau, fichierUrl: url })}
            />

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">
                Annuler
              </button>
              <button
                onClick={ajouterDiplome}
                className="text-sm px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: 'var(--cfp-navy)' }}
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFormOuvert(true)}
            className="w-full border border-dashed rounded-lg py-3 text-sm font-medium mb-4"
            style={{ borderColor: 'var(--cfp-blue)', color: 'var(--cfp-blue)' }}
          >
            + Ajouter un diplome
          </button>
        )}

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

                <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/2`)}
            className="rounded-lg text-sm font-medium px-5 py-2.5 border"
            style={{ borderColor: 'var(--cfp-navy)', color: 'var(--cfp-navy)' }}
          >
            Précédent
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