import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string; certificationId: string }> }
) {
  const { token, certificationId } = await params

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
  if (!candidat) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })

  const certification = await prisma.certification.findUnique({ where: { id: certificationId } })
  if (!certification || certification.candidatId !== candidat.id) {
    return NextResponse.json({ error: 'Certification introuvable' }, { status: 404 })
  }

  await prisma.certification.delete({ where: { id: certificationId } })

  return NextResponse.json({ ok: true })
}