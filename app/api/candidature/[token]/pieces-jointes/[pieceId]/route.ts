import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string; pieceId: string }> }
) {
  const { token, pieceId } = await params

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

    if (candidat.statut !== 'EN_COURS') {
  return NextResponse.json({ error: 'Cette candidature ne peut plus être modifiée.' }, { status: 403 })
}
  const piece = await prisma.pieceJointe.findUnique({ where: { id: pieceId } })
  if (!piece || piece.candidatId !== candidat.id) {
    return NextResponse.json({ error: 'Pièce introuvable' }, { status: 404 })
  }

  await prisma.pieceJointe.delete({ where: { id: pieceId } })
  return NextResponse.json({ ok: true })
}