import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string; experienceId: string }> }
) {
  const { token, experienceId } = await params

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const experience = await prisma.experiencePro.findUnique({ where: { id: experienceId } })
  if (!experience || experience.candidatId !== candidat.id) {
    return NextResponse.json({ error: 'Expérience introuvable' }, { status: 404 })
  }

  await prisma.experiencePro.delete({ where: { id: experienceId } })

  return NextResponse.json({ ok: true })
}