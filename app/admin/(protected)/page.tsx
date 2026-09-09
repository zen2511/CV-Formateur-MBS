// app/admin/page.tsx
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function AdminDashboard() {
  const [total, enAttente, preselectionnees, acceptees, rejetees, scoreMoyenResult] = await Promise.all([
    prisma.candidat.count({ where: { statut: { not: 'EN_COURS' } } }),
    prisma.candidat.count({ where: { statut: 'SOUMISE' } }),
    prisma.candidat.count({ where: { statut: 'PRESELECTIONNEE' } }),
    prisma.candidat.count({ where: { statut: 'ACCEPTEE' } }),
    prisma.candidat.count({ where: { statut: 'REJETEE' } }),
    prisma.candidat.aggregate({
      where: { statut: { not: 'EN_COURS' }, scoreTotal: { not: null } },
      _avg: { scoreTotal: true },
    }),
  ])

  const scoreMoyen = scoreMoyenResult._avg.scoreTotal
    ? Math.round(scoreMoyenResult._avg.scoreTotal)
    : null

  const dernieresCandidatures = await prisma.candidat.findMany({
    where: { statut: { not: 'EN_COURS' } },
    orderBy: { dateSoumission: 'desc' },
    take: 5,
    select: {
      id: true, nomComplet: true, email: true, statut: true,
      scoreTotal: true, dateSoumission: true,
    },
  })

    const cartes = [
    { label: 'Total soumises', valeur: total, couleur: 'var(--cfp-navy)' },
    { label: 'En attente', valeur: enAttente, couleur: 'var(--cfp-blue)' },
    { label: 'Présélectionnées', valeur: preselectionnees, couleur: 'var(--cfp-green)' },
    { label: 'Acceptées', valeur: acceptees, couleur: 'var(--cfp-green)' },
    { label: 'Rejetées', valeur: rejetees, couleur: 'var(--cfp-red)' },
  ]

  return (
   <div className="p-8">
  <AdminPageHeader titre="Dashboard" description="Vue d'ensemble des candidatures" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cartes.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-2xl font-semibold" style={{ color: c.couleur }}>{c.valeur}</p>
          </div>
        ))}
      </div>

      {scoreMoyen !== null && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 inline-block">
          <p className="text-xs text-slate-500 mb-1">Score moyen (candidatures soumises)</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--cfp-navy)' }}>{scoreMoyen} / 100</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Dernières candidatures</h2>
        </div>

        {dernieresCandidatures.length === 0 ? (
          <p className="text-sm text-slate-400 px-4 py-6 text-center">Aucune candidature soumise pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {dernieresCandidatures.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-900">{c.nomComplet ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{c.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-900">{c.scoreTotal ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {c.dateSoumission ? new Date(c.dateSoumission).toLocaleDateString('fr-FR') : '—'}
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