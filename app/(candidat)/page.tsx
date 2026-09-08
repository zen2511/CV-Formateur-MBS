// app/(candidat)/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AccueilForm from '@/components/candidature/AccueilForm'

export default async function AccueilCandidat() {
  const cookieStore = await cookies()
  const token = cookieStore.get('candidature_token')?.value

  if (token) {
    const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })
    if (candidat) {
      redirect(`/candidature/continuer?token=${token}`)
    }
  }

  return <AccueilForm />
}