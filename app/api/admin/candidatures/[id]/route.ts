import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculerScoreCandidat } from '@/lib/scoring'
import { sendAcceptanceEmail } from '@/lib/mail'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action } = await request.json()

  const candidat = await prisma.candidat.findUnique({ where: { id } })
  if (!candidat) {
    return NextResponse.json({ error: 'Candidat introuvable.' }, { status: 404 })
  }

  if (action === 'recalculer') {
    const resultat = await calculerScoreCandidat(id)
    const maj = await prisma.candidat.update({
      where: { id },
      data: {
        scoreTotal: resultat.scoreTotal,
        scoreConfigVersion: resultat.scoreConfigVersion,
      },
    })
    return NextResponse.json({ ok: true, candidat: maj })
  }

  if (action === 'accepter') {
    const maj = await prisma.candidat.update({
      where: { id },
      data: { statut: 'ACCEPTEE' },
    })

    try {
      await sendAcceptanceEmail(candidat.email, candidat.nomComplet)
    } catch (err) {
      console.error('Envoi email acceptation échoué (non bloquant) :', err)
    }

    return NextResponse.json({ ok: true, candidat: maj })
  }

  if (action === 'rejeter') {
    const maj = await prisma.candidat.update({
      where: { id },
      data: { statut: 'REJETEE' },
    })
    return NextResponse.json({ ok: true, candidat: maj })
  }

  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
}