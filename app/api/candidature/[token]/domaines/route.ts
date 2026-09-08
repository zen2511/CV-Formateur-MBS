import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const domaines = await prisma.domaineExpertise.findMany({
    where: { candidatId: candidat.id },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({ domaines })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const data = await request.json()

  if (!data.domaine) {
    return NextResponse.json({ error: 'Le domaine est obligatoire' }, { status: 400 })
  }

  const domaine = await prisma.domaineExpertise.create({
    data: {
      candidatId: candidat.id,
      domaine: data.domaine,
      specialite: data.specialite || null,
      niveau: data.niveau || null,
      publics: data.publics || null,
      anneesExperience: data.anneesExperience ? Number(data.anneesExperience) : null,
    },
  })

  return NextResponse.json({ domaine })
}