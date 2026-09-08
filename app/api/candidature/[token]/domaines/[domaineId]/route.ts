import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string; domaineId: string }> }
) {
  const { token, domaineId } = await params

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const domaine = await prisma.domaineExpertise.findUnique({ where: { id: domaineId } })
  if (!domaine || domaine.candidatId !== candidat.id) {
    return NextResponse.json({ error: 'Domaine introuvable' }, { status: 404 })
  }

  await prisma.domaineExpertise.delete({ where: { id: domaineId } })

  return NextResponse.json({ ok: true })
}