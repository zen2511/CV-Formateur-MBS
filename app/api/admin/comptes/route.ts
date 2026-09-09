import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const comptes = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json({ comptes })
}

export async function POST(request: Request) {
  const { email, motDePasse } = await request.json()

  if (!email || !motDePasse) {
    return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
  }
  if (motDePasse.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
  }

  const existant = await prisma.admin.findUnique({ where: { email } })
  if (existant) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 })
  }

  const hash = await bcrypt.hash(motDePasse, 10)
  const compte = await prisma.admin.create({
    data: { email, motDePasse: hash, role: 'admin' },
    select: { id: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json({ ok: true, compte })
}