import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CV+MBS — CFP-MBS',
  description: 'Candidature Formateur Certifié — CFP-MBS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}