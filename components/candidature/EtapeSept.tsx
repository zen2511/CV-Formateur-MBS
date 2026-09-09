'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Disponibilite } from '../../src/generated/prisma/client'

type Props = {
  disponibilite: Disponibilite | null
  token: string
}

type FormData = {
  modalite: string
  disponibilite: string
  mobiliteCameroun: boolean
  mobiliteInternationale: boolean
  paysIntervention: string[]
  heuresMaxSemaine: string
  dureeMinMission: string
  tarifHeure: string
  tarifJour: string
  devise: string
  tarifNegociable: boolean
  besoinsLogistiques: string
}

const PAYS_DISPONIBLES = [
  'Cameroun', 'Senegal', 'Cote d\u2019Ivoire', 'Gabon', 'Congo', 'Mali',
  'Burkina Faso', 'Benin', 'Togo', 'Niger', 'Tchad', 'France', 'Belgique',
  'Canada', 'Maroc', 'Tunisie', 'Rwanda',
]

function versFormData(d: Disponibilite | null): FormData {
  return {
    modalite: d?.modalite ?? '',
    disponibilite: d?.disponibilite ?? '',
    mobiliteCameroun: d?.mobiliteCameroun ?? false,
    mobiliteInternationale: d?.mobiliteInternationale ?? false,
    paysIntervention: d?.paysIntervention ? d.paysIntervention.split(',').filter(Boolean) : [],
    heuresMaxSemaine: d?.heuresMaxSemaine?.toString() ?? '',
    dureeMinMission: d?.dureeMinMission ?? '',
    tarifHeure: d?.tarifHeure?.toString() ?? '',
    tarifJour: d?.tarifJour?.toString() ?? '',
    devise: d?.devise ?? '',
    tarifNegociable: d?.tarifNegociable ?? false,
    besoinsLogistiques: d?.besoinsLogistiques ?? '',
  }
}

const champClasse = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"

export default function EtapeSept({ disponibilite, token }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(versFormData(disponibilite))
  const [statutSauvegarde, setStatutSauvegarde] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const versPayload = useCallback((f: FormData) => ({
    modalite: f.modalite || null,
    disponibilite: f.disponibilite || null,
    mobiliteCameroun: f.mobiliteCameroun,
    mobiliteInternationale: f.mobiliteInternationale,
    paysIntervention: f.paysIntervention.length ? f.paysIntervention.join(',') : null,
    heuresMaxSemaine: f.heuresMaxSemaine ? Number(f.heuresMaxSemaine) : null,
    dureeMinMission: f.dureeMinMission || null,
    tarifHeure: f.tarifHeure ? Number(f.tarifHeure) : null,
    tarifJour: f.tarifJour ? Number(f.tarifJour) : null,
    devise: f.devise || null,
    tarifNegociable: f.tarifNegociable,
    besoinsLogistiques: f.besoinsLogistiques || null,
  }), [])

  const sauvegarder = useCallback(async (data: FormData) => {
    setStatutSauvegarde('saving')
    try {
      const res = await fetch(`/api/candidature/${token}/disponibilite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versPayload(data)),
      })
      setStatutSauvegarde(res.ok ? 'saved' : 'error')
    } catch {
      setStatutSauvegarde('error')
    }
  }, [token, versPayload])

  function majEtSauvegarder(nouveauForm: FormData) {
    setForm(nouveauForm)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => sauvegarder(nouveauForm), 1000)
  }

  function handleChange<K extends keyof FormData>(champ: K, valeur: FormData[K]) {
    majEtSauvegarder({ ...form, [champ]: valeur })
  }

  function togglePays(pays: string) {
    const nouveauxPays = form.paysIntervention.includes(pays)
      ? form.paysIntervention.filter((p) => p !== pays)
      : [...form.paysIntervention, pays]
    handleChange('paysIntervention', nouveauxPays)
  }

  async function handleSuivant() {
    setErreur('')
    const auMoinsUnTarif = form.tarifHeure !== '' || form.tarifJour !== ''

    if (!form.modalite || !form.disponibilite || !form.devise || !auMoinsUnTarif) {
      setErreur('Merci de renseigner la modalité, la disponibilité, la devise et au moins un tarif.')
      return
    }
    if (form.mobiliteInternationale && form.paysIntervention.length === 0) {
      setErreur('Sélectionnez au moins un pays pour la mobilité internationale.')
      return
    }

    setEnvoiEnCours(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await sauvegarder(form)

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
    <main className="min-h-[80vh] bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Etape 7 - Disponibilite et tarifs
          </h1>
          <span className="text-xs text-slate-400">
            {statutSauvegarde === 'saving' && 'Enregistrement...'}
            {statutSauvegarde === 'saved' && 'Enregistre'}
            {statutSauvegarde === 'error' && 'Erreur de sauvegarde'}
          </span>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">
              Modalite d&apos;intervention *
            </span>
            <select
              className={champClasse}
              value={form.modalite}
              onChange={(e) => handleChange('modalite', e.target.value)}
            >
              <option value="">Selectionner</option>
              <option value="PRESENTIEL">Presentiel</option>
              <option value="EN_LIGNE">En ligne</option>
              <option value="HYBRIDE">Hybride</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">
              Disponibilite generale *
            </span>
            <input
              className={champClasse}
              placeholder="Ex: Soirs et week-ends, temps plein a partir de..."
              value={form.disponibilite}
              onChange={(e) => handleChange('disponibilite', e.target.value)}
            />
          </label>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.mobiliteCameroun}
                onChange={(e) => handleChange('mobiliteCameroun', e.target.checked)}
              />
              Mobilite dans tout le Cameroun
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.mobiliteInternationale}
                onChange={(e) => handleChange('mobiliteInternationale', e.target.checked)}
              />
              Mobilite internationale
            </label>
          </div>

          {form.mobiliteInternationale && (
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">
                Pays d&apos;intervention possibles
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYS_DISPONIBLES.map((pays) => (
                  <label key={pays} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.paysIntervention.includes(pays)}
                      onChange={() => togglePays(pays)}
                    />
                    {pays}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Heures max / semaine
              </span>
              <input
                type="number"
                className={champClasse}
                value={form.heuresMaxSemaine}
                onChange={(e) => handleChange('heuresMaxSemaine', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Duree min. mission
              </span>
              <input
                className={champClasse}
                placeholder="Ex: 1 jour, 1 semaine..."
                value={form.dureeMinMission}
                onChange={(e) => handleChange('dureeMinMission', e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Tarif / heure
              </span>
              <input
                type="number"
                className={champClasse}
                value={form.tarifHeure}
                onChange={(e) => handleChange('tarifHeure', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Tarif / jour
              </span>
              <input
                type="number"
                className={champClasse}
                value={form.tarifJour}
                onChange={(e) => handleChange('tarifJour', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Devise *
              </span>
              <select
                className={champClasse}
                value={form.devise}
                onChange={(e) => handleChange('devise', e.target.value)}
              >
                <option value="">Selectionner</option>
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.tarifNegociable}
              onChange={(e) => handleChange('tarifNegociable', e.target.checked)}
            />
            Tarif negociable
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">
              Besoins logistiques
            </span>
            <textarea
              className={champClasse}
              rows={3}
              placeholder="Materiel, transport, hebergement..."
              value={form.besoinsLogistiques}
              onChange={(e) => handleChange('besoinsLogistiques', e.target.value)}
            />
          </label>
        </div>

        {erreur && <p className="text-sm text-red-600 mt-4">{erreur}</p>}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/4`)}
            className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 transition-colors"
          >
            Precedent
          </button>
          <button
            onClick={handleSuivant}
            disabled={envoiEnCours}
            style={{ backgroundColor: 'var(--cfp-navy)' }}
            className="rounded-lg text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {envoiEnCours ? 'Validation...' : 'Suivant'}
          </button>
        </div>
      </div>
    </main>
  )
}