'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ExperiencePro, ExperienceFormateur } from '../../src/generated/prisma/client'

type Props = {
  token: string
  experiencesProInitiales: ExperiencePro[]
  experiencesFormateurInitiales: ExperienceFormateur[]
}

const MODALITES = [
  { value: 'PRESENTIEL', label: 'Présentiel' },
  { value: 'EN_LIGNE', label: 'En ligne' },
  { value: 'HYBRIDE', label: 'Hybride' },
]

const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeCinq({ token, experiencesProInitiales, experiencesFormateurInitiales }: Props) {
  const router = useRouter()
  const [onglet, setOnglet] = useState<'pro' | 'formateur'>('pro')

  const [experiencesPro, setExperiencesPro] = useState<ExperiencePro[]>(experiencesProInitiales)
  const [experiencesFormateur, setExperiencesFormateur] = useState<ExperienceFormateur[]>(experiencesFormateurInitiales)

  const [formOuvert, setFormOuvert] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const [nouveauPro, setNouveauPro] = useState({
    poste: '', entreprise: '', secteur: '', pays: '', dateDebut: '', dateFin: '',
    responsabilites: '', realisations: '',
  })

  const [nouveauFormateur, setNouveauFormateur] = useState({
    intituleFormation: '', organismeBeneficiaire: '', publicForme: '', nbParticipants: '',
    dureeHeures: '', modalite: '', pays: '', resultats: '', reference: '',
  })

  async function ajouterPro() {
    setErreur('')
    if (!nouveauPro.poste) {
      setErreur('Renseigne au moins le poste occupé.')
      return
    }
    const res = await fetch(`/api/candidature/${token}/experiences-pro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouveauPro),
    })
    if (!res.ok) {
      setErreur("Impossible d'ajouter cette expérience.")
      return
    }
    const { experience } = await res.json()
    setExperiencesPro((prev) => [...prev, experience])
    setNouveauPro({ poste: '', entreprise: '', secteur: '', pays: '', dateDebut: '', dateFin: '', responsabilites: '', realisations: '' })
    setFormOuvert(false)
  }

  async function ajouterFormateur() {
    setErreur('')
    if (!nouveauFormateur.intituleFormation) {
      setErreur('Renseigne au moins l\'intitulé de la formation.')
      return
    }
    const res = await fetch(`/api/candidature/${token}/experiences-formateur`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouveauFormateur),
    })
    if (!res.ok) {
      setErreur("Impossible d'ajouter cette expérience.")
      return
    }
    const { experience } = await res.json()
    setExperiencesFormateur((prev) => [...prev, experience])
    setNouveauFormateur({ intituleFormation: '', organismeBeneficiaire: '', publicForme: '', nbParticipants: '', dureeHeures: '', modalite: '', pays: '', resultats: '', reference: '' })
    setFormOuvert(false)
  }

  async function supprimerPro(id: string) {
    await fetch(`/api/candidature/${token}/experiences-pro/${id}`, { method: 'DELETE' })
    setExperiencesPro((prev) => prev.filter((e) => e.id !== id))
  }

  async function supprimerFormateur(id: string) {
    await fetch(`/api/candidature/${token}/experiences-formateur/${id}`, { method: 'DELETE' })
    setExperiencesFormateur((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    if (experiencesPro.length === 0 && experiencesFormateur.length === 0) {
      setErreur('Ajoute au moins une expérience (professionnelle ou formateur) avant de continuer.')
      return
    }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 5 }),
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
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Etape 5 - Experiences</h1>
        <p className="text-sm text-slate-500 mb-4">
          Ajoute tes experiences professionnelles et/ou tes experiences comme formateur.
        </p>

        <div className="flex gap-1 mb-5 border-b border-slate-200">
          <button
            onClick={() => setOnglet('pro')}
            className="text-sm px-3 py-2 -mb-px"
            style={onglet === 'pro'
              ? { borderBottom: '2px solid var(--cfp-navy)', color: 'var(--cfp-navy)', fontWeight: 600 }
              : { color: '#94a3b8' }}
          >
            Professionnelle ({experiencesPro.length})
          </button>
          <button
            onClick={() => setOnglet('formateur')}
            className="text-sm px-3 py-2 -mb-px"
            style={onglet === 'formateur'
              ? { borderBottom: '2px solid var(--cfp-navy)', color: 'var(--cfp-navy)', fontWeight: 600 }
              : { color: '#94a3b8' }}
          >
            Formateur ({experiencesFormateur.length})
          </button>
        </div>

        {onglet === 'pro' && (
          <>
            <div className="space-y-3 mb-4">
              {experiencesPro.map((e) => (
                <div key={e.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{e.poste}</p>
                    <p className="text-xs text-slate-500">
                      {e.entreprise ?? '—'} {e.pays ? `\u00b7 ${e.pays}` : ''}
                    </p>
                  </div>
                  <button onClick={() => supprimerPro(e.id)} className="text-xs text-red-500 hover:underline">
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            {formOuvert ? (
              <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
                <input className={champClasse} placeholder="Poste occupé" value={nouveauPro.poste}
                  onChange={(e) => setNouveauPro({ ...nouveauPro, poste: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={champClasse} placeholder="Entreprise" value={nouveauPro.entreprise}
                    onChange={(e) => setNouveauPro({ ...nouveauPro, entreprise: e.target.value })} />
                  <input className={champClasse} placeholder="Secteur d'activité" value={nouveauPro.secteur}
                    onChange={(e) => setNouveauPro({ ...nouveauPro, secteur: e.target.value })} />
                </div>
                <input className={champClasse} placeholder="Pays" value={nouveauPro.pays}
                  onChange={(e) => setNouveauPro({ ...nouveauPro, pays: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs text-slate-500 mb-1">Date de début</span>
                    <input type="date" className={champClasse} value={nouveauPro.dateDebut}
                      onChange={(e) => setNouveauPro({ ...nouveauPro, dateDebut: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="block text-xs text-slate-500 mb-1">Date de fin</span>
                    <input type="date" className={champClasse} value={nouveauPro.dateFin}
                      onChange={(e) => setNouveauPro({ ...nouveauPro, dateFin: e.target.value })} />
                  </label>
                </div>
                <textarea className={champClasse} rows={2} placeholder="Principales responsabilités" value={nouveauPro.responsabilites}
                  onChange={(e) => setNouveauPro({ ...nouveauPro, responsabilites: e.target.value })} />
                <textarea className={champClasse} rows={2} placeholder="Réalisations significatives" value={nouveauPro.realisations}
                  onChange={(e) => setNouveauPro({ ...nouveauPro, realisations: e.target.value })} />

                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">Annuler</button>
                  <button onClick={ajouterPro} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: 'var(--cfp-navy)' }}>
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setFormOuvert(true)} className="w-full border border-dashed rounded-lg py-3 text-sm font-medium mb-4"
                style={{ borderColor: 'var(--cfp-blue)', color: 'var(--cfp-blue)' }}>
                + Ajouter une expérience professionnelle
              </button>
            )}
          </>
        )}

        {onglet === 'formateur' && (
          <>
            <div className="space-y-3 mb-4">
              {experiencesFormateur.map((e) => (
                <div key={e.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{e.intituleFormation}</p>
                    <p className="text-xs text-slate-500">
                      {e.organismeBeneficiaire ?? '—'} {e.nbParticipants ? `\u00b7 ${e.nbParticipants} participants` : ''}
                    </p>
                  </div>
                  <button onClick={() => supprimerFormateur(e.id)} className="text-xs text-red-500 hover:underline">
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            {formOuvert ? (
              <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
                <input className={champClasse} placeholder="Intitulé de la formation animée" value={nouveauFormateur.intituleFormation}
                  onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, intituleFormation: e.target.value })} />
                <input className={champClasse} placeholder="Organisme bénéficiaire" value={nouveauFormateur.organismeBeneficiaire}
                  onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, organismeBeneficiaire: e.target.value })} />
                <input className={champClasse} placeholder="Public formé" value={nouveauFormateur.publicForme}
                  onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, publicForme: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className={champClasse} placeholder="Nombre de participants" value={nouveauFormateur.nbParticipants}
                    onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, nbParticipants: e.target.value })} />
                  <input type="number" className={champClasse} placeholder="Durée totale (heures)" value={nouveauFormateur.dureeHeures}
                    onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, dureeHeures: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className={champClasse} value={nouveauFormateur.modalite}
                    onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, modalite: e.target.value })}>
                    <option value="">Modalité</option>
                    {MODALITES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <input className={champClasse} placeholder="Pays d'intervention" value={nouveauFormateur.pays}
                    onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, pays: e.target.value })} />
                </div>
                <textarea className={champClasse} rows={2} placeholder="Résultats obtenus" value={nouveauFormateur.resultats}
                  onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, resultats: e.target.value })} />
                <input className={champClasse} placeholder="Référence professionnelle vérifiable" value={nouveauFormateur.reference}
                  onChange={(e) => setNouveauFormateur({ ...nouveauFormateur, reference: e.target.value })} />

                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">Annuler</button>
                  <button onClick={ajouterFormateur} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: 'var(--cfp-navy)' }}>
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setFormOuvert(true)} className="w-full border border-dashed rounded-lg py-3 text-sm font-medium mb-4"
                style={{ borderColor: 'var(--cfp-blue)', color: 'var(--cfp-blue)' }}>
                + Ajouter une expérience formateur
              </button>
            )}
          </>
        )}

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-end">
                  <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/4`)}
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