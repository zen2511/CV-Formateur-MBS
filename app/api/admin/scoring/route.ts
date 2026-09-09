import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const data = await request.json()

  const poids = {
    poidsCertifications: Number(data.poidsCertifications),
    poidsExperience: Number(data.poidsExperience),
    poidsDiplomes: Number(data.poidsDiplomes),
    poidsDisponibilite: Number(data.poidsDisponibilite),
  }

  for (const [cle, valeur] of Object.entries(poids)) {
    if (Number.isNaN(valeur) || valeur < 0) {
      return NextResponse.json({ error: `Poids invalide pour ${cle}.` }, { status: 400 })
    }
  }

  const config = await prisma.scoreConfig.create({ data: poids })

  return NextResponse.json({ ok: true, config })
}