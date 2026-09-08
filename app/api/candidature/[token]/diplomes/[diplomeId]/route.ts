import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string; diplomeId: string }> }
) {
  const { token, diplomeId } = await params

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const diplome = await prisma.diplome.findUnique({ where: { id: diplomeId } })
  if (!diplome || diplome.candidatId !== candidat.id) {
    return NextResponse.json({ error: 'Diplôme introuvable' }, { status: 404 })
  }

  await prisma.diplome.delete({ where: { id: diplomeId } })

  return NextResponse.json({ ok: true })
}