// app/api/candidature/[token]/pieces-jointes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })

  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  if (candidat.statut !== 'EN_COURS') {
    return NextResponse.json({ error: 'Cette candidature ne peut plus être modifiée.' }, { status: 403 })
  }

  const { type, url } = await request.json()
  if (!type || !url) {
    return NextResponse.json({ error: 'Type et url requis' }, { status: 400 })
  }

  const piece = await prisma.pieceJointe.create({
    data: { candidatId: candidat.id, type, url },
  })

  return NextResponse.json({ piece })
}