import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function ErreurLien({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Lien invalide</h1>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <a href="/" className="inline-block rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-blue-700 transition-colors">Retour a l&apos;accueil</a>
      </div>
    </main>
  )
}

export default async function ContinuerCandidature({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams

  if (!token) {
    return <ErreurLien message="Aucun lien n&apos;a ete fourni." />
  }

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })

  if (!candidat) {
    return <ErreurLien message="Ce lien n&apos;est plus valide. Redemandez un lien depuis la page d&apos;accueil." />
  }

  if (candidat.tokenExpiration && candidat.tokenExpiration < new Date()) {
    return <ErreurLien message="Ce lien a expire. Redemandez un lien depuis la page d&apos;accueil." />
  }

  if (candidat.statut !== 'EN_COURS') {
    redirect('/confirmation')
  }

  redirect(`/candidature/${token}/etape/${candidat.etapeCourante}`)
}