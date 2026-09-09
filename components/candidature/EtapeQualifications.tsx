'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Diplome, Certification } from '../../src/generated/prisma/client'
import ChampFichier from './ChampFichier'

type Props = {
  token: string
  diplomesInitiaux: Diplome[]
  certificationsInitiales: Certification[]
}

const NIVEAUX_DIPLOME = ['Bac', 'Bac+2', 'Licence', 'Master', 'Doctorat', 'Autre']
const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeQualifications({ token, diplomesInitiaux, certificationsInitiales }: Props) {
  const router = useRouter()
  const [onglet, setOnglet] = useState<'diplomes' | 'certifications'>('diplomes')

  const [diplomes, setDiplomes] = useState<Diplome[]>(diplomesInitiaux)
  const [certifications, setCertifications] = useState<Certification[]>(certificationsInitiales)
  const [formOuvert, setFormOuvert] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const [nouveauDiplome, setNouveauDiplome] = useState({
    intitule: '', domaineEtudes: '', etablissement: '', pays: '', annee: '', niveau: '', fichierUrl: '',
  })
  const [nouvelleCertif, setNouvelleCertif] = useState({
    nom: '', organisme: '', domaine: '', numero: '', dateObtention: '', dateExpiration: '',
    pays: '', lienVerification: '', fichierUrl: '', international: false,
  })

  async function ajouterDiplome() {
    setErreur('')
    if (!nouveauDiplome.intitule) { setErreur("Renseigne au moins l'intitulé du diplôme."); return }
    const res = await fetch(`/api/candidature/${token}/diplomes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nouveauDiplome),
    })
    if (!res.ok) { setErreur("Impossible d'ajouter ce diplôme."); return }
    const { diplome } = await res.json()
    setDiplomes((prev) => [...prev, diplome])
    setNouveauDiplome({ intitule: '', domaineEtudes: '', etablissement: '', pays: '', annee: '', niveau: '', fichierUrl: '' })
    setFormOuvert(false)
  }

  async function ajouterCertification() {
    setErreur('')
    if (!nouvelleCertif.nom) { setErreur('Renseigne au moins le nom de la certification.'); return }
    const res = await fetch(`/api/candidature/${token}/certifications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nouvelleCertif),
    })
    if (!res.ok) { setErreur("Impossible d'ajouter cette certification."); return }
    const { certification } = await res.json()
    setCertifications((prev) => [...prev, certification])
    setNouvelleCertif({ nom: '', organisme: '', domaine: '', numero: '', dateObtention: '', dateExpiration: '', pays: '', lienVerification: '', fichierUrl: '', international: false })
    setFormOuvert(false)
  }

  async function supprimerDiplome(id: string) {
    await fetch(`/api/candidature/${token}/diplomes/${id}`, { method: 'DELETE' })
    setDiplomes((prev) => prev.filter((d) => d.id !== id))
  }

  async function supprimerCertification(id: string) {
    await fetch(`/api/candidature/${token}/certifications/${id}`, { method: 'DELETE' })
    setCertifications((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    if (diplomes.length === 0) { setErreur('Ajoute au moins un diplôme avant de continuer.'); return }
    if (certifications.length === 0) { setErreur('Ajoute au moins une certification avant de continuer.'); return }

    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ etapeActuelle: 3 }),
      })
      const data = await res.json()
      if (!res.ok) { setErreur(data.error ?? 'Une erreur est survenue.'); setEnvoiEnCours(false); return }
      router.push(`/candidature/${token}/etape/${data.prochaineEtape}`)
    } catch {
      setErreur('Impossible de contacter le serveur.')
      setEnvoiEnCours(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto carte-cfp rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Etape 3 - Qualifications</h1>
        <p className="text-sm text-slate-500 mb-4">Ajoute tes diplômes et tes certifications professionnelles.</p>

        <div className="flex gap-1 mb-5 border-b border-slate-200">
          <button onClick={() => setOnglet('diplomes')} className="text-sm px-3 py-2 -mb-px"
            style={onglet === 'diplomes' ? { borderBottom: '2px solid var(--cfp-navy)', color: 'var(--cfp-navy)', fontWeight: 600 } : { color: '#94a3b8' }}>
            Diplômes ({diplomes.length})
          </button>
          <button onClick={() => setOnglet('certifications')} className="text-sm px-3 py-2 -mb-px"
            style={onglet === 'certifications' ? { borderBottom: '2px solid var(--cfp-navy)', color: 'var(--cfp-navy)', fontWeight: 600 } : { color: '#94a3b8' }}>
            Certifications ({certifications.length})
          </button>
        </div>

        {onglet === 'diplomes' && (
          <>
            <div className="space-y-3 mb-4">
              {diplomes.map((d) => (
                <div key={d.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.intitule}</p>
                    <p className="text-xs text-slate-500">{d.niveau ?? '—'} {d.etablissement ? `\u00b7 ${d.etablissement}` : ''} {d.annee ? `\u00b7 ${d.annee}` : ''}</p>
                  </div>
                  <button onClick={() => supprimerDiplome(d.id)} className="text-xs text-red-500 hover:underline">Retirer</button>
                </div>
              ))}
            </div>
            {formOuvert ? (
              <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
                <input className={champClasse} placeholder="Intitulé du diplôme" value={nouveauDiplome.intitule}
                  onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, intitule: e.target.value })} />
                <input className={champClasse} placeholder="Domaine d'études" value={nouveauDiplome.domaineEtudes}
                  onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, domaineEtudes: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={champClasse} placeholder="Établissement" value={nouveauDiplome.etablissement}
                    onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, etablissement: e.target.value })} />
                  <input className={champClasse} placeholder="Pays" value={nouveauDiplome.pays}
                    onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, pays: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className={champClasse} value={nouveauDiplome.niveau}
                    onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, niveau: e.target.value })}>
                    <option value="">Niveau</option>
                    {NIVEAUX_DIPLOME.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input type="number" className={champClasse} placeholder="Année d'obtention" value={nouveauDiplome.annee}
                    onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, annee: e.target.value })} />
                </div>
                <ChampFichier label="Copie du diplôme" valeurActuelle={nouveauDiplome.fichierUrl}
                  onUploaded={(url) => setNouveauDiplome({ ...nouveauDiplome, fichierUrl: url })} />
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">Annuler</button>
                  <button onClick={ajouterDiplome} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: 'var(--cfp-navy)' }}>Ajouter</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setFormOuvert(true)} className="w-full border border-dashed rounded-lg py-3 text-sm font-medium mb-4"
                style={{ borderColor: 'var(--cfp-blue)', color: 'var(--cfp-blue)' }}>+ Ajouter un diplôme</button>
            )}
          </>
        )}

        {onglet === 'certifications' && (
          <>
            <div className="space-y-3 mb-4">
              {certifications.map((c) => (
                <div key={c.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {c.nom} {c.international && <span className="text-xs font-normal text-white rounded-full px-2 py-0.5 ml-1" style={{ backgroundColor: 'var(--cfp-blue)' }}>Internationale</span>}
                    </p>
                    <p className="text-xs text-slate-500">{c.organisme ?? '—'} {c.pays ? `\u00b7 ${c.pays}` : ''}</p>
                  </div>
                  <button onClick={() => supprimerCertification(c.id)} className="text-xs text-red-500 hover:underline">Retirer</button>
                </div>
              ))}
            </div>
            {formOuvert ? (
              <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-4">
                <input className={champClasse} placeholder="Nom exact de la certification" value={nouvelleCertif.nom}
                  onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, nom: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={champClasse} placeholder="Organisme certificateur" value={nouvelleCertif.organisme}
                    onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, organisme: e.target.value })} />
                  <input className={champClasse} placeholder="Pays de délivrance" value={nouvelleCertif.pays}
                    onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, pays: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={nouvelleCertif.international}
                    onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, international: e.target.checked })} />
                  Certification internationale
                </label>
                <ChampFichier label="Copie du certificat" valeurActuelle={nouvelleCertif.fichierUrl}
                  onUploaded={(url) => setNouvelleCertif({ ...nouvelleCertif, fichierUrl: url })} />
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setFormOuvert(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500">Annuler</button>
                  <button onClick={ajouterCertification} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: 'var(--cfp-navy)' }}>Ajouter</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setFormOuvert(true)} className="w-full border border-dashed rounded-lg py-3 text-sm font-medium mb-4"
                style={{ borderColor: 'var(--cfp-blue)', color: 'var(--cfp-blue)' }}>+ Ajouter une certification</button>
            )}
          </>
        )}

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-between">
          <button onClick={() => router.push(`/candidature/${token}/etape/2`)} className="rounded-lg text-sm font-medium px-5 py-2.5 border"
            style={{ borderColor: 'var(--cfp-navy)', color: 'var(--cfp-navy)' }}>Précédent</button>
          <button onClick={handleSuivant} disabled={envoiEnCours} style={{ backgroundColor: 'var(--cfp-navy)' }}
            className="rounded-lg text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity">
            {envoiEnCours ? 'Enregistrement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </main>
  )
}