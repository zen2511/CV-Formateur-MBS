import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const candidat = await prisma.candidat.findUnique({ where: { id } })
  if (!candidat || candidat.statut !== 'ACCEPTEE') {
    return NextResponse.json({ error: 'Candidat introuvable ou non accepté.' }, { status: 404 })
  }

  await prisma.candidat.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}