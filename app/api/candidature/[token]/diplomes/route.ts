import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const diplomes = await prisma.diplome.findMany({
    where: { candidatId: candidat.id },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({ diplomes })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const data = await request.json()

  if (!data.intitule) {
    return NextResponse.json({ error: "L'intitulé du diplôme est obligatoire" }, { status: 400 })
  }

  const diplome = await prisma.diplome.create({
    data: {
      candidatId: candidat.id,
      intitule: data.intitule,
      domaineEtudes: data.domaineEtudes || null,
      etablissement: data.etablissement || null,
      pays: data.pays || null,
      annee: data.annee ? Number(data.annee) : null,
      niveau: data.niveau || null,
      fichierUrl: data.fichierUrl || null,
    },
  })

  return NextResponse.json({ diplome })
}