'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Certification } from '../../src/generated/prisma/client'
import ChampFichier from './ChampFichier'

type Props = {
  token: string
  certificationsInitiales: Certification[]
}

const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeQuatre({ token, certificationsInitiales }: Props) {
  const router = useRouter()
  const [certifications, setCertifications] = useState<Certification[]>(certificationsInitiales)
  const [formOuvert, setFormOuvert] = useState(certificationsInitiales.length === 0)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const [nouveau, setNouveau] = useState({
    nom: '', organisme: '', domaine: '', numero: '',
    dateObtention: '', dateExpiration: '', pays: '', lienVerification: '',
    fichierUrl: '', international: false,
  })

  async function ajouterCertification() {
    setErreur('')
    if (!nouveau.nom) {
      setErreur('Renseigne au moins le nom de la certification.')
      return
    }

    const res = await fetch(`/api/candidature/${token}/certifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouveau),
    })

    if (!res.ok) {
      setErreur("Impossible d'ajouter cette certification.")
      return
    }

    const { certification } = await res.json()
    setCertifications((prev) => [...prev, certification])
    setNouveau({
      nom: '', organisme: '', domaine: '', numero: '',
      dateObtention: '', dateExpiration: '', pays: '', lienVerification: '',
      fichierUrl: '', international: false,
    })
    setFormOuvert(false)
  }

  async function supprimerCertification(id: string) {
    await fetch(`/api/candidature/${token}/certifications/${id}`, { method: 'DELETE' })
    setCertifications((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    if (certifications.length === 0) {
      setErreur('Ajoute au moins une certification avant de continuer.')
      return
    }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 4 }),
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
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Etape 4 - Certifications</h1>
        <p className="text-sm text-slate-500 mb-6">
          Ajoute chaque certification professionnelle que tu detiens.
        </p>

        <div className="space-y-3 mb-4">
          {certifications.map((c) => (
            <div key={c.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {c.nom} {c.international && (
                    <span className="text-xs font-normal text-white rounded-full px-2 py-0.5 ml-1" style={{ backgroundColor: 'var(--cfp-blue)' }}>
                      Internationale
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {c.organisme ?? '—'} {c.pays ? `\u00b7 ${c.pays}` : ''}
                </p>
              </div>
              <button onClick={() => supprimerCertification(c.id)} className="text-xs text-red-500 hover:underline">
                Retirer
              </button>
            </div>
          ))}
        </div>

        {formOuvert ? (
          <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
            <input
              className={champClasse}
              placeholder="Nom exact de la certification"
              value={nouveau.nom}
              onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={champClasse}
                placeholder="Organisme certificateur"
                value={nouveau.organisme}
                onChange={(e) => setNouveau({ ...nouveau, organisme: e.target.value })}
              />
              <input
                className={champClasse}
                placeholder="Domaine"
                value={nouveau.domaine}
                onChange={(e) => setNouveau({ ...nouveau, domaine: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={champClasse}
                placeholder="Numero du certificat"
                value={nouveau.numero}
                onChange={(e) => setNouveau({ ...nouveau, numero: e.target.value })}
              />
              <input
                className={champClasse}
                placeholder="Pays de delivrance"
                value={nouveau.pays}
                onChange={(e) => setNouveau({ ...nouveau, pays: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs text-slate-500 mb-1">Date d&apos;obtention</span>
                <input
                  type="date"
                  className={champClasse}
                  value={nouveau.dateObtention}
                  onChange={(e) => setNouveau({ ...nouveau, dateObtention: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="block text-xs text-slate-500 mb-1">Date d&apos;expiration (optionnel)</span>
                <input
                  type="date"
                  className={champClasse}
                  value={nouveau.dateExpiration}
                  onChange={(e) => setNouveau({ ...nouveau, dateExpiration: e.target.value })}
                />
              </label>
            </div>
            <input
              className={champClasse}
              placeholder="Lien public de verification (optionnel)"
              value={nouveau.lienVerification}
              onChange={(e) => setNouveau({ ...nouveau, lienVerification: e.target.value })}
            />

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={nouveau.international}
                onChange={(e) => setNouveau({ ...nouveau, international: e.target.checked })}
              />
              Certification internationale
            </label>

            <ChampFichier
              label="Copie du certificat"
              valeurActuelle={nouveau.fichierUrl}
              onUploaded={(url) => setNouveau({ ...nouveau, fichierUrl: url })}
            />

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">
                Annuler
              </button>
              <button
                onClick={ajouterCertification}
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
            + Ajouter une certification
          </button>
        )}

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-end">
                  <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/3`)}
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