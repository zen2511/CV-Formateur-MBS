import { prisma } from '@/lib/prisma'
import FormulaireNouveauCompte from '@/components/admin/FormulaireNouveauCompte'
import BoutonSupprimerCompte from '@/components/admin/BoutonSupprimerCompte'

export default async function ComptesPage() {
  const comptes = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, createdAt: true },
  })

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Comptes admin</h1>
      <p className="text-sm text-slate-500 mb-6">{comptes.length} compte(s)</p>

      <FormulaireNouveauCompte />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200 uppercase tracking-wide">
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Rôle</th>
              <th className="px-4 py-2.5 font-medium">Créé le</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {comptes.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-900">{c.email}</td>
                <td className="px-4 py-2.5 text-slate-500">{c.role}</td>
                <td className="px-4 py-2.5 text-slate-500">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-2.5 text-right">
                  <BoutonSupprimerCompte compteId={c.id} email={c.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}