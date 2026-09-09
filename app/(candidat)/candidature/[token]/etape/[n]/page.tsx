// app/(candidat)/candidature/[token]/etape/[n]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EtapeUn from '@/components/candidature/EtapeUn'
import EtapeDeux from '@/components/candidature/EtapeDeux'
import EtapeCinq from '@/components/candidature/EtapeCinq'
import EtapeSept from '@/components/candidature/EtapeSept'
import EtapeHuit from '@/components/candidature/EtapeHuit'

import EtapeQualifications from '@/components/candidature/EtapeQualifications'
// ... garde EtapeUn, EtapeDeux, EtapeCinq, EtapeSept, EtapeHuit

export default async function EtapePage({ params }: { params: Promise<{ token: string; n: string }> }) {
  const { token, n } = await params
  const numeroEtape = Number(n)

  if (!numeroEtape || numeroEtape < 1 || numeroEtape > 6) notFound()

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) redirect('/')
  if (candidat.statut !== 'EN_COURS') redirect('/confirmation')
  if (numeroEtape > candidat.etapeCourante) redirect(`/candidature/${token}/etape/${candidat.etapeCourante}`)

  if (numeroEtape === 1) return <EtapeUn candidat={candidat} token={token} />
  if (numeroEtape === 2) {
    const domaines = await prisma.domaineExpertise.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } })
    return <EtapeDeux token={token} domainesInitiaux={domaines} />
  }
  if (numeroEtape === 3) {
    const [diplomes, certifications] = await Promise.all([
      prisma.diplome.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
      prisma.certification.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
    ])
    return <EtapeQualifications token={token} diplomesInitiaux={diplomes} certificationsInitiales={certifications} />
  }
  if (numeroEtape === 4) {
    const [experiencesPro, experiencesFormateur] = await Promise.all([
      prisma.experiencePro.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
      prisma.experienceFormateur.findMany({ where: { candidatId: candidat.id }, orderBy: { id: 'asc' } }),
    ])
    return <EtapeCinq token={token} experiencesProInitiales={experiencesPro} experiencesFormateurInitiales={experiencesFormateur} />
  }
  if (numeroEtape === 5) return <EtapeSept candidat={candidat} token={token} />
  if (numeroEtape === 6) return <EtapeHuit candidat={candidat} token={token} />
}