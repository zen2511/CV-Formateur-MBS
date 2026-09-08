import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CHAMPS_AUTORISES = [
  'modalite', 'disponibilite', 'mobiliteCameroun', 'mobiliteInternationale',
  'paysIntervention', 'heuresMaxSemaine', 'dureeMinMission',
  'tarifHeure', 'tarifJour', 'devise', 'tarifNegociable', 'besoinsLogistiques',
] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })

  if (!candidat) {
    return NextResponse.json({ error: 'Lien invalide.' }, { status: 404 })
  }

  if (candidat.statut !== 'EN_COURS') {
    return NextResponse.json({ error: 'Candidature verrouillée.' }, { status: 403 })
  }

  const data: Record<string, unknown> = {}
  for (const champ of CHAMPS_AUTORISES) {
    if (champ in body) {
      data[champ] = body[champ] === '' ? null : body[champ]
    }
  }

  const dispo = await prisma.disponibilite.upsert({
    where: { candidatId: candidat.id },
    update: data,
    create: { candidatId: candidat.id, ...data },
  })

  return NextResponse.json({ success: true, disponibilite: dispo })
}