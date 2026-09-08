// app/api/candidature/route.ts
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/mail'

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

  // On tente d'envoyer l'email de reprise, mais un échec (limite Resend, etc.)
  // ne doit jamais empêcher le candidat d'accéder directement au formulaire.
  try {
    await sendMagicLinkEmail(email, token)
  } catch (err) {
    console.error('Envoi email échoué (non bloquant) :', err)
  }

  return NextResponse.json({ ok: true, token, etapeCourante: candidat.etapeCourante })
}