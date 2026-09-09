// lib/adminSession.ts
import { randomBytes } from 'crypto'
import { prisma } from './prisma'

const DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

export async function creerSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + DUREE_SESSION_MS)

  await prisma.session.create({
    data: { token, adminId, expiresAt },
  })

  return token
}

export async function obtenirSession(token: string | undefined) {
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { admin: true },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {})
    return null
  }

  return { adminId: session.adminId, email: session.admin.email }
}

export async function supprimerSession(token: string | undefined) {
  if (!token) return
  await prisma.session.delete({ where: { token } }).catch(() => {})
}