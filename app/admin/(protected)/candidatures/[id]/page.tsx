import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ActionsCandidat from '@/components/admin/ActionsCandidat'

const ONGLETS = [
  { id: 'infos', label: 'Informations' },
  { id: 'diplomes', label: 'Diplômes' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'experiences', label: 'Expériences' },
  { id: 'disponibilite', label: 'Disponibilité' },
]

export default async function FicheCandidatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ onglet?: string }>
}) {
  const { id } = await params
  const { onglet = 'infos' } = await searchParams

  const candidat = await prisma.candidat.findUnique({
    where: { id },
    include: {
      domaines: true,
      diplomes: true,
      certifications: true,
      experiencesPro: true,
      experiencesFormateur: true,
      disponibilite: true,
    },
  })

  if (!candidat) notFound()

  const couleurScore = (candidat.scoreTotal ?? 0) >= 70 ? 'var(--cfp-green)' : (candidat.scoreTotal ?? 0) >= 50 ? '#B8860B' : 'var(--cfp-red)'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">
          {candidat.nomComplet ?? candidat.email} — Fiche candidat
        </h1>
        {candidat.scoreTotal !== null && (
          <span
            className="text-sm font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F1F5F9', color: couleurScore }}
          >
            Score {candidat.scoreTotal}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-6">{candidat.email} · Statut : {candidat.statut}</p>

      <div className="flex gap-5 border-b border-slate-200 mb-6">
        {ONGLETS.map((o) => (
          <Link
            key={o.id}
            href={`/admin/candidatures/${id}?onglet=${o.id}`}
            className="text-sm pb-2.5 -mb-px"
            style={onglet === o.id
              ? { borderBottom: '2px solid var(--cfp-red)', color: 'var(--cfp-navy)', fontWeight: 600 }
              : { color: '#94a3b8' }}
          >
            {o.label}
          </Link>
        ))}
      </div>

      {onglet === 'infos' && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <Champ label="Nationalité" valeur={candidat.nationalite} />
          <Champ label="Pays / Ville" valeur={[candidat.paysResidence, candidat.villeResidence].filter(Boolean).join(', ')} />
          <Champ label="Type de formateur" valeur={candidat.typeFormateur} />
          <Champ label="Titre professionnel" valeur={candidat.titreProfessionnel} />
          <Champ label="WhatsApp" valeur={candidat.whatsapp} />
          <Champ label="Langues parlées" valeur={candidat.languesParlees} />
          <Champ label="CV" valeur={candidat.cvUrl ? 'Fourni' : 'Non fourni'} lien={candidat.cvUrl ?? undefined} />
        </div>
      )}

      {onglet === 'diplomes' && (
        <div className="space-y-3 mb-6">
          {candidat.diplomes.length === 0 && <VideMessage texte="Aucun diplôme renseigné." />}
          {candidat.diplomes.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{d.intitule}</p>
              <p className="text-xs text-slate-500">
                {d.niveau ?? '—'} · {d.etablissement ?? '—'} · {d.annee ?? '—'}
              </p>
              {d.fichierUrl && (
                <a href={d.fichierUrl} target="_blank" className="text-xs underline" style={{ color: 'var(--cfp-blue)' }}>
                  Voir le fichier
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {onglet === 'certifications' && (
        <div className="space-y-3 mb-6">
          {candidat.certifications.length === 0 && <VideMessage texte="Aucune certification renseignée." />}
          {candidat.certifications.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{c.nom}</p>
                <StatutBadge statut={c.statutVerification} />
              </div>
              <p className="text-xs text-slate-500">
                {c.organisme ?? '—'} · {c.pays ?? '—'} {c.international && '· Internationale'}
              </p>
              {c.fichierUrl && (
                <a href={c.fichierUrl} target="_blank" className="text-xs underline" style={{ color: 'var(--cfp-blue)' }}>
                  Voir le certificat
                </a>
              )}
            </div>
          ))}
        </div>
      )}

         {onglet === 'experiences' && (
        <div className="space-y-3 mb-6">
          {candidat.experiencesPro.some((e) => e.posteActuel) && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: '#FEF6E7', color: '#8a6d1a', border: '1px solid #F5D98B' }}
            >
              ⚠ Ce candidat occupe actuellement un poste salarié — à vérifier avant validation
              (conflit d&apos;intérêt potentiel selon la politique du CFP-MBS).
            </div>
          )}
          {candidat.experiencesPro.length === 0 && candidat.experiencesFormateur.length === 0 && (
            <VideMessage texte="Aucune expérience renseignée." />
          )}
          
          {candidat.experiencesPro.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{e.poste}</p>
              <p className="text-xs text-slate-500">{e.entreprise ?? '—'} · {e.pays ?? '—'}</p>
            </div>
          ))}
          {candidat.experiencesFormateur.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{e.intituleFormation}</p>
              <p className="text-xs text-slate-500">
                {e.organismeBeneficiaire ?? '—'} {e.nbParticipants ? `· ${e.nbParticipants} participants` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {onglet === 'disponibilite' && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <Champ label="Modalité" valeur={candidat.disponibilite?.modalite} />
          <Champ label="Disponibilité" valeur={candidat.disponibilite?.disponibilite} />
          <Champ label="Mobilité" valeur={[
            candidat.disponibilite?.mobiliteCameroun && 'Cameroun',
            candidat.disponibilite?.mobiliteInternationale && 'Internationale',
          ].filter(Boolean).join(', ') || 'Aucune'} />
          <Champ label="Tarif" valeur={
            candidat.disponibilite?.tarifJour
              ? `${candidat.disponibilite.tarifJour} ${candidat.disponibilite.devise ?? ''} / jour`
              : candidat.disponibilite?.tarifHeure
              ? `${candidat.disponibilite.tarifHeure} ${candidat.disponibilite.devise ?? ''} / heure`
              : undefined
          } />
        </div>
      )}

      <ActionsCandidat candidatId={id} statutActuel={candidat.statut} />
    </div>
  )
}

function Champ({ label, valeur, lien }: { label: string; valeur?: string | null; lien?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      {lien ? (
        <a href={lien} target="_blank" className="text-sm font-medium underline" style={{ color: 'var(--cfp-blue)' }}>
          {valeur || '—'}
        </a>
      ) : (
        <p className="text-sm font-medium text-slate-900">{valeur || '—'}</p>
      )}
    </div>
  )
}

function VideMessage({ texte }: { texte: string }) {
  return <p className="text-sm text-slate-400 bg-white rounded-xl border border-slate-200 p-6 text-center">{texte}</p>
}

function StatutBadge({ statut }: { statut: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    VERIFIEE: { bg: '#EAF6EB', color: 'var(--cfp-green)', label: 'Vérifiée' },
    EN_ATTENTE: { bg: '#FEF6E7', color: '#B8860B', label: 'En attente' },
    REJETEE: { bg: '#FDEDEC', color: 'var(--cfp-red)', label: 'Rejetée' },
  }
  const s = styles[statut] ?? styles.EN_ATTENTE
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}