// lib/adminSession.ts
import { randomBytes } from 'crypto'

type Session = {
  adminId: string
  email: string
  expiresAt: number
}

const globalForSessions = globalThis as unknown as {
  adminSessions: Map<string, Session> | undefined
}

const sessions = globalForSessions.adminSessions ?? new Map<string, Session>()
if (process.env.NODE_ENV !== 'production') globalForSessions.adminSessions = sessions

const DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

export function creerSession(adminId: string, email: string): string {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { adminId, email, expiresAt: Date.now() + DUREE_SESSION_MS })
  return token
}

export function obtenirSession(token: string | undefined): Session | null {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}

export function supprimerSession(token: string | undefined) {
  if (token) sessions.delete(token)
}