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

  if (!data.poste) {
    return NextResponse.json({ error: 'Le poste occupé est obligatoire' }, { status: 400 })
  }

  const experience = await prisma.experiencePro.create({
    data: {
      candidatId: candidat.id,
      poste: data.poste,
      entreprise: data.entreprise || null,
      secteur: data.secteur || null,
      pays: data.pays || null,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
      responsabilites: data.responsabilites || null,
      realisations: data.realisations || null,
      attestationUrl: data.attestationUrl || null,
    },
  })

  return NextResponse.json({ experience })
}