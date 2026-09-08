// app/api/admin/seed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.secret || body.secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  if (!body.email || !body.motDePasse) {
    return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
  }

  const motDePasseHash = await bcrypt.hash(body.motDePasse, 10)

  const admin = await prisma.admin.upsert({
    where: { email: body.email.toLowerCase() },
    update: { motDePasse: motDePasseHash },
    create: { email: body.email.toLowerCase(), motDePasse: motDePasseHash, role: 'admin' },
  })

  return NextResponse.json({ success: true, adminId: admin.id, email: admin.email })
}