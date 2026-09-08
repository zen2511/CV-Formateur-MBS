// app/(candidat)/candidature/[token]/etape/[n]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EtapeUn from '@/components/candidature/EtapeUn'
import EtapeDeux from '@/components/candidature/EtapeDeux'
import EtapeTrois from '@/components/candidature/EtapeTrois'
import EtapeQuatre from '@/components/candidature/EtapeQuatre'
import EtapeCinq from '@/components/candidature/EtapeCinq'
import EtapeSix from '@/components/candidature/EtapeSix'
import EtapeSept from '@/components/candidature/EtapeSept'
import EtapeHuit from '@/components/candidature/EtapeHuit'

export default async function EtapePage({
  params,
}: {
  params: Promise<{ token: string; n: string }>
}) {
  const { token, n } = await params
  const numeroEtape = Number(n)

  if (!numeroEtape || numeroEtape < 1 || numeroEtape > 8) {
    notFound()
  }

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })

  if (!candidat) {
    redirect('/')
  }

  if (candidat.statut !== 'EN_COURS') {
    redirect('/confirmation')
  }

  if (numeroEtape > candidat.etapeCourante) {
    redirect(`/candidature/${token}/etape/${candidat.etapeCourante}`)
  }

  if (numeroEtape === 1) {
    return <EtapeUn candidat={candidat} token={token} />
  }

  if (numeroEtape === 2) {
    const domaines = await prisma.domaineExpertise.findMany({
      where: { candidatId: candidat.id },
      orderBy: { id: 'asc' },
    })
    return <EtapeDeux token={token} domainesInitiaux={domaines} />
  }

  if (numeroEtape === 3) {
    const diplomes = await prisma.diplome.findMany({
      where: { candidatId: candidat.id },
      orderBy: { id: 'asc' },
    })
    return <EtapeTrois token={token} diplomesInitiaux={diplomes} />
  }

  if (numeroEtape === 4) {
    const certifications = await prisma.certification.findMany({
      where: { candidatId: candidat.id },
      orderBy: { id: 'asc' },
    })
    return <EtapeQuatre token={token} certificationsInitiales={certifications} />
  }

  if (numeroEtape === 5) {
    const [experiencesPro, experiencesFormateur] = await Promise.all([
      prisma.experiencePro.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
      prisma.experienceFormateur.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
    ])
    return (
      <EtapeCinq
        token={token}
        experiencesProInitiales={experiencesPro}
        experiencesFormateurInitiales={experiencesFormateur}
      />
    )
  }

  if (numeroEtape === 6) {
    const pieces = await prisma.pieceJointe.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } })
    return <EtapeSix candidat={candidat} token={token} piecesJointesInitiales={pieces} />
  }

  if (numeroEtape === 7) {
    const disponibilite = await prisma.disponibilite.findUnique({ where: { candidatId: candidat.id } })
    return <EtapeSept token={token} disponibilite={disponibilite} />
  }

  if (numeroEtape === 8) {
  return <EtapeHuit candidat={candidat} token={token} />
}

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Étape {numeroEtape} — à construire.</p>
    </main>
  )
}