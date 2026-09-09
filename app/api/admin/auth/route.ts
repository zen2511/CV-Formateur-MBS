// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { creerSession } from '@/lib/adminSession'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.email || !body?.motDePasse) {
    return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
  }

  const admin = await prisma.admin.findUnique({ where: { email: body.email.toLowerCase() } })

  if (!admin) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
  }

  const motDePasseValide = await bcrypt.compare(body.motDePasse, admin.motDePasse)

  if (!motDePasseValide) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
  }

  const token = await creerSession(admin.id)

  const reponse = NextResponse.json({ success: true })
  reponse.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return reponse
}