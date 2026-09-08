import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const certifications = await prisma.certification.findMany({
    where: { candidatId: candidat.id },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({ certifications })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const data = await request.json()

  if (!data.nom) {
    return NextResponse.json({ error: 'Le nom de la certification est obligatoire' }, { status: 400 })
  }

  const certification = await prisma.certification.create({
    data: {
      candidatId: candidat.id,
      nom: data.nom,
      organisme: data.organisme || null,
      domaine: data.domaine || null,
      numero: data.numero || null,
      dateObtention: data.dateObtention ? new Date(data.dateObtention) : null,
      dateExpiration: data.dateExpiration ? new Date(data.dateExpiration) : null,
      pays: data.pays || null,
      lienVerification: data.lienVerification || null,
      fichierUrl: data.fichierUrl || null,
      international: Boolean(data.international),
      // statutVerification reste EN_ATTENTE par défaut (géré par l'admin ensuite)
    },
  })

  return NextResponse.json({ certification })
}