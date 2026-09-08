import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const data = await request.json()

  if (!data.intituleFormation) {
    return NextResponse.json({ error: 'L\'intitulé de la formation est obligatoire' }, { status: 400 })
  }

  const experience = await prisma.experienceFormateur.create({
    data: {
      candidatId: candidat.id,
      intituleFormation: data.intituleFormation,
      organismeBeneficiaire: data.organismeBeneficiaire || null,
      publicForme: data.publicForme || null,
      nbParticipants: data.nbParticipants ? Number(data.nbParticipants) : null,
      dureeHeures: data.dureeHeures ? Number(data.dureeHeures) : null,
      modalite: data.modalite || null,
      pays: data.pays || null,
      resultats: data.resultats || null,
      reference: data.reference || null,
    },
  })

  return NextResponse.json({ experience })
}