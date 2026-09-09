import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BoutonSupprimerCandidat from '@/components/admin/BoutonSupprimerCandidat'

export default async function CandidaturesAccepteesPage() {
  const candidats = await prisma.candidat.findMany({
    where: { statut: 'ACCEPTEE' },
    orderBy: { dateSoumission: 'desc' },
    include: { domaines: { take: 1 } },
  })

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Candidatures acceptées</h1>
      <p className="text-sm text-slate-500 mb-6">{candidats.length} formateur(s) accepté(s) définitivement</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {candidats.length === 0 ? (
          <p className="text-sm text-slate-400 px-4 py-6 text-center">Aucun candidat accepté pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200 uppercase tracking-wide">
                <th className="px-4 py-2.5 font-medium">Candidat</th>
                <th className="px-4 py-2.5 font-medium">Domaine principal</th>
                <th className="px-4 py-2.5 font-medium">Pays</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium"></th>
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
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{c.scoreTotal ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <BoutonSupprimerCandidat candidatId={c.id} nom={c.nomComplet ?? c.email} />
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