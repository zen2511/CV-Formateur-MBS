// app/api/candidature/route.ts
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/mail'

const NB_ETAPES = 6

export async function POST(request: Request) {
  let body: { email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  const token = randomUUID()
  const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

  const candidat = await prisma.candidat.upsert({
    where: { email },
    update: { tokenLienMagique: token, tokenExpiration: expiration },
    create: { email, tokenLienMagique: token, tokenExpiration: expiration },
  })

  // Plafonne les vieilles candidatures dont etapeCourante > 6 (créées avant la restructuration 8→6 étapes)
  const etapeCouranteValide = Math.min(candidat.etapeCourante, NB_ETAPES)
  if (etapeCouranteValide !== candidat.etapeCourante) {
    await prisma.candidat.update({
      where: { id: candidat.id },
      data: { etapeCourante: etapeCouranteValide },
    })
  }

  try {
    await sendMagicLinkEmail(email, token)
  } catch (err) {
    console.error('Envoi email echoue (non bloquant) :', err)
  }

  return NextResponse.json({ ok: true, token, etapeCourante: etapeCouranteValide })
}