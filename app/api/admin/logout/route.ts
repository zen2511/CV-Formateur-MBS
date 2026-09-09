// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supprimerSession } from '@/lib/adminSession'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value
  await supprimerSession(token)

  const reponse = NextResponse.redirect(new URL('/admin/login', req.url))
  reponse.cookies.delete('admin_session')
  return reponse
}