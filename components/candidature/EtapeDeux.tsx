// components/candidature/EtapeDeux.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DomaineExpertise } from '../../src/generated/prisma/client'

type Props = {
  token: string
  domainesInitiaux: DomaineExpertise[]
}

const DOMAINES = [
  'Intelligence artificielle', 'Informatique et transformation numerique', 'Cybersecurite',
  'Maintenance informatique et reseaux', 'Marketing digital', 'Commerce et techniques de vente',
  'Management et leadership', 'Gestion des projets', 'Ressources humaines',
  'Comptabilite, finance et fiscalite', 'Entrepreneuriat et incubation', 'Developpement personnel',
  'Secretariat et bureautique', 'Electricite du batiment', 'Energies renouvelables',
  'Plomberie et hydraulique', 'Genie civil et telecommunications', 'Agriculture durable',
  'Elevage et pisciculture', "Logistique et chaine d'approvisionnement",
  'Qualite, hygiene, securite et environnement', 'RSE et developpement durable', 'Autre',
]
const NIVEAUX = ['Initiation', 'Intermediaire', 'Avance', 'Expert']
const PUBLICS = ['Jeunes', 'Etudiants', 'Salaries', 'Managers', 'Directeurs', 'Entrepreneurs']

const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeDeux({ token, domainesInitiaux }: Props) {
  const router = useRouter()
  const [domaines, setDomaines] = useState<DomaineExpertise[]>(domainesInitiaux)
  const [formOuvert, setFormOuvert] = useState(domainesInitiaux.length === 0)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const [nouveau, setNouveau] = useState({
    domaine: '', specialite: '', niveau: '', anneesExperience: '',
  })
  const [publicsSelectionnes, setPublicsSelectionnes] = useState<string[]>([])

  function togglePublic(p: string) {
    setPublicsSelectionnes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  async function ajouterDomaine() {
    setErreur('')
    if (!nouveau.domaine) {
      setErreur('Choisis un domaine.')
      return
    }

    const res = await fetch(`/api/candidature/${token}/domaines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...nouveau,
        publics: publicsSelectionnes.join(', '),
      }),
    })

    if (!res.ok) {
      setErreur("Impossible d'ajouter ce domaine.")
      return
    }

    const { domaine } = await res.json()
    setDomaines((prev) => [...prev, domaine])
    setNouveau({ domaine: '', specialite: '', niveau: '', anneesExperience: '' })
    setPublicsSelectionnes([])
    setFormOuvert(false)
  }

  async function supprimerDomaine(id: string) {
    await fetch(`/api/candidature/${token}/domaines/${id}`, { method: 'DELETE' })
    setDomaines((prev) => prev.filter((d) => d.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    if (domaines.length === 0) {
      setErreur('Ajoute au moins un domaine d\u2019expertise avant de continuer.')
      return
    }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 2 }),
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
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Etape 2 - Domaines d&apos;expertise
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Ajoute chaque domaine dans lequel tu peux intervenir comme formateur.
        </p>

        <div className="space-y-3 mb-4">
          {domaines.map((d) => (
            <div
              key={d.id}
              className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.domaine}</p>
                <p className="text-xs text-slate-500">
                  {d.niveau ?? '—'} {d.anneesExperience ? `\u00b7 ${d.anneesExperience} ans d'experience` : ''}
                </p>
                {d.publics && <p className="text-xs text-slate-400 mt-0.5">{d.publics}</p>}
              </div>
              <button
                onClick={() => supprimerDomaine(d.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>

        {formOuvert ? (
          <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
            <select
              className={champClasse}
              value={nouveau.domaine}
              onChange={(e) => setNouveau({ ...nouveau, domaine: e.target.value })}
            >
              <option value="">Choisir un domaine</option>
              {DOMAINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <input
              className={champClasse}
              placeholder="Specialite precise (optionnel)"
              value={nouveau.specialite}
              onChange={(e) => setNouveau({ ...nouveau, specialite: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className={champClasse}
                value={nouveau.niveau}
                onChange={(e) => setNouveau({ ...nouveau, niveau: e.target.value })}
              >
                <option value="">Niveau enseigne</option>
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              <input
                type="number"
                min={0}
                className={champClasse}
                placeholder="Annees d'experience"
                value={nouveau.anneesExperience}
                onChange={(e) => setNouveau({ ...nouveau, anneesExperience: e.target.value })}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-1.5">Publics maitrises</p>
              <div className="flex flex-wrap gap-2">
                {PUBLICS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePublic(p)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      publicsSelectionnes.includes(p)
                        ? 'border-transparent text-white'
                        : 'border-slate-300 text-slate-600'
                    }`}
                    style={publicsSelectionnes.includes(p) ? { backgroundColor: 'var(--cfp-blue)' } : {}}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setFormOuvert(false)}
                className="text-sm px-4 py-2 rounded-lg text-slate-500"
              >
                Annuler
              </button>
              <button
                onClick={ajouterDomaine}
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
            + Ajouter un domaine d&apos;expertise
          </button>
        )}

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-end">
                  <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/1`)}
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
      </div>
    </main>
  )
}