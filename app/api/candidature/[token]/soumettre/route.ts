// app/api/candidature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/mail'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_VALIDITY_DAYS = 30

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  const existant = await prisma.candidat.findUnique({ where: { email } })

  if (existant?.statut === 'SOUMISE' || existant?.statut === 'PRESELECTIONNEE' || existant?.statut === 'ACCEPTEE' || existant?.statut === 'REJETEE') {
    return NextResponse.json(
      { error: 'Une candidature a déjà été soumise avec cette adresse email.' },
      { status: 409 }
    )
  }

  const token = randomBytes(32).toString('hex')
  const tokenExpiration = new Date(Date.now() + TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000)

  const candidat = await prisma.candidat.upsert({
    where: { email },
    update: { tokenLienMagique: token, tokenExpiration },
    create: { email, tokenLienMagique: token, tokenExpiration },
  })

  // L'email est un bonus (utile sur un autre appareil), plus jamais bloquant
  try {
    await sendMagicLinkEmail(email, token)
  } catch (err) {
    console.error('Email non envoyé (non bloquant):', err)
  }

  const reponse = NextResponse.json({
    success: true,
    token,
    candidatId: candidat.id,
  })

  reponse.cookies.set('candidature_token', token, {
    maxAge: TOKEN_VALIDITY_DAYS * 24 * 60 * 60,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  })

  return reponse
}