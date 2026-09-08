'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Candidat, PieceJointe } from '../../src/generated/prisma/client'
import ChampFichier from './ChampFichier'

type Props = {
  candidat: Candidat
  token: string
  piecesJointesInitiales: PieceJointe[]
}

const COMPETENCES = [
  'Conception de programmes de formation', 'Approche par compétences', 'Formation des adultes',
  'Animation participative', 'Études de cas et simulations', 'Évaluation des compétences',
  'Mentorat et coaching', "Utilisation de l'intelligence artificielle",
  'Maîtrise des plateformes de formation en ligne',
]
const OUTILS = ['Zoom', 'Teams', 'Google Meet', 'Moodle', 'Canva', 'PowerPoint']
const TYPES_PIECE = [
  { value: 'support_pedagogique', label: 'Exemple de support pédagogique' },
  { value: 'video', label: 'Courte vidéo de présentation' },
  { value: 'lien_formation', label: 'Lien vers une formation déjà animée' },
  { value: 'temoignage', label: 'Témoignage ou lettre de recommandation' },
]

function listeVersTableau(v: string | null): string[] {
  return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []
}

export default function EtapeSix({ candidat, token, piecesJointesInitiales }: Props) {
  const router = useRouter()
  const [competences, setCompetences] = useState<string[]>(listeVersTableau(candidat.competencesPedagogiques))
  const [outils, setOutils] = useState<string[]>(listeVersTableau(candidat.outilsMaitrises))
  const [pieces, setPieces] = useState<PieceJointe[]>(piecesJointesInitiales)
  const [typePiece, setTypePiece] = useState('support_pedagogique')
  const [lienPiece, setLienPiece] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sauvegarder = useCallback((nouvellesCompetences: string[], nouveauxOutils: string[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch(`/api/candidature/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competencesPedagogiques: nouvellesCompetences.join(', '),
          outilsMaitrises: nouveauxOutils.join(', '),
        }),
      })
    }, 800)
  }, [token])

  function toggleCompetence(c: string) {
    const maj = competences.includes(c) ? competences.filter((x) => x !== c) : [...competences, c]
    setCompetences(maj)
    sauvegarder(maj, outils)
  }

  function toggleOutil(o: string) {
    const maj = outils.includes(o) ? outils.filter((x) => x !== o) : [...outils, o]
    setOutils(maj)
    sauvegarder(competences, maj)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  async function ajouterPieceFichier(url: string) {
    const res = await fetch(`/api/candidature/${token}/pieces-jointes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: typePiece, url }),
    })
    if (res.ok) {
      const { piece } = await res.json()
      setPieces((prev) => [...prev, piece])
    }
  }

  async function ajouterPieceLien() {
    if (!lienPiece) return
    const res = await fetch(`/api/candidature/${token}/pieces-jointes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: typePiece, url: lienPiece }),
    })
    if (res.ok) {
      const { piece } = await res.json()
      setPieces((prev) => [...prev, piece])
      setLienPiece('')
    }
  }

  async function supprimerPiece(id: string) {
    await fetch(`/api/candidature/${token}/pieces-jointes/${id}`, { method: 'DELETE' })
    setPieces((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSuivant() {
    setErreur('')
    setEnvoiEnCours(true)
    try {
      const res = await fetch(`/api/candidature/${token}/suivant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapeActuelle: 6 }),
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
          Etape 6 - Competences pedagogiques &amp; pieces jointes
        </h1>
        <p className="text-sm text-slate-500 mb-6">Cette etape est facultative.</p>

        <p className="text-sm font-medium text-slate-700 mb-2">Competences pedagogiques</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {COMPETENCES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCompetence(c)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={competences.includes(c)
                ? { backgroundColor: 'var(--cfp-blue)', borderColor: 'var(--cfp-blue)', color: 'white' }
                : { borderColor: '#cbd5e1', color: '#475569' }}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-slate-700 mb-2">Outils maitrises</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {OUTILS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggleOutil(o)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={outils.includes(o)
                ? { backgroundColor: 'var(--cfp-green)', borderColor: 'var(--cfp-green)', color: 'white' }
                : { borderColor: '#cbd5e1', color: '#475569' }}
            >
              {o}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-slate-700 mb-2">Pieces jointes (optionnel)</p>
        <div className="space-y-2 mb-3">
          {pieces.map((p) => (
            <div key={p.id} className="border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {TYPES_PIECE.find((t) => t.value === p.type)?.label ?? p.type}
              </span>
              <button onClick={() => supprimerPiece(p.id)} className="text-xs text-red-500 hover:underline">
                Retirer
              </button>
            </div>
          ))}
        </div>

        <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 mb-6">
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={typePiece}
            onChange={(e) => setTypePiece(e.target.value)}
          >
            {TYPES_PIECE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {typePiece === 'lien_formation' ? (
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="https://..."
                value={lienPiece}
                onChange={(e) => setLienPiece(e.target.value)}
              />
              <button
                onClick={ajouterPieceLien}
                className="text-sm px-4 rounded-lg text-white"
                style={{ backgroundColor: 'var(--cfp-navy)' }}
              >
                Ajouter
              </button>
            </div>
          ) : (
            <ChampFichier label="Fichier" onUploaded={ajouterPieceFichier} />
          )}
        </div>

        {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

        <div className="flex justify-between">
          <button
            onClick={() => router.push(`/candidature/${token}/etape/5`)}
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