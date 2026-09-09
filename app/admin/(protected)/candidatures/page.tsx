import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type SearchParams = {
  domaine?: string
  pays?: string
  certifieOnly?: string
  scoreMin?: string
}

export default async function CandidaturesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const where: Record<string, unknown> = { statut: { not: 'EN_COURS' } }

  if (params.pays) {
    where.paysResidence = { contains: params.pays, mode: 'insensitive' }
  }
  if (params.scoreMin) {
    where.scoreTotal = { gte: Number(params.scoreMin) }
  }
  if (params.domaine) {
    where.domaines = { some: { domaine: { contains: params.domaine, mode: 'insensitive' } } }
  }
  if (params.certifieOnly === '1') {
    where.certifications = { some: { statutVerification: 'VERIFIEE' } }
  }

  const candidats = await prisma.candidat.findMany({
    where,
    orderBy: { dateSoumission: 'desc' },
    include: { domaines: { take: 1 } },
  })

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Candidatures reçues</h1>
      <p className="text-sm text-slate-500 mb-6">{candidats.length} candidature(s)</p>

      <form className="flex flex-wrap gap-2 mb-5" method="get">
        <input
          type="text"
          name="domaine"
          placeholder="Domaine"
          defaultValue={params.domaine}
          className="text-xs rounded-full border border-slate-300 px-3 py-1.5"
        />
        <input
          type="text"
          name="pays"
          placeholder="Pays"
          defaultValue={params.pays}
          className="text-xs rounded-full border border-slate-300 px-3 py-1.5"
        />
        <input
          type="number"
          name="scoreMin"
          placeholder="Score ≥"
          defaultValue={params.scoreMin}
          className="text-xs rounded-full border border-slate-300 px-3 py-1.5 w-24"
        />
        <label className="flex items-center gap-1.5 text-xs rounded-full border border-slate-300 px-3 py-1.5">
          <input type="checkbox" name="certifieOnly" value="1" defaultChecked={params.certifieOnly === '1'} />
          Certification vérifiée
        </label>
        <button
          type="submit"
          className="text-xs rounded-full px-4 py-1.5 text-white font-medium"
          style={{ backgroundColor: 'var(--cfp-navy)' }}
        >
          Filtrer
        </button>
        <Link href="/admin/candidatures" className="text-xs px-3 py-1.5 text-slate-400 underline">
          Réinitialiser
        </Link>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {candidats.length === 0 ? (
          <p className="text-sm text-slate-400 px-4 py-6 text-center">Aucune candidature ne correspond.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200 uppercase tracking-wide">
                <th className="px-4 py-2.5 font-medium">Candidat</th>
                <th className="px-4 py-2.5 font-medium">Domaine principal</th>
                <th className="px-4 py-2.5 font-medium">Pays</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Reçu le</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {candidats.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/candidatures/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.nomComplet ?? c.email}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{c.domaines[0]?.domaine ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.paysResidence ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.typeFormateur ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {c.dateSoumission ? new Date(c.dateSoumission).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    {c.scoreTotal !== null ? (
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: c.scoreTotal >= 70 ? '#EAF6EB' : c.scoreTotal >= 50 ? '#FEF6E7' : '#FDEDEC',
                          color: c.scoreTotal >= 70 ? 'var(--cfp-green)' : c.scoreTotal >= 50 ? '#B8860B' : 'var(--cfp-red)',
                        }}
                      >
                        {c.scoreTotal}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}