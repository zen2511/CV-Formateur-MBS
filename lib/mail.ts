// lib/mail.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.MAIL_FROM ?? 'CFP-MBS <onboarding@resend.dev>'

export async function sendMagicLinkEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/candidature/continuer?token=${token}`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Continuez votre candidature — CFP-MBS',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Votre candidature CFP-MBS</h2>
        <p>Cliquez sur le lien ci-dessous pour continuer ou reprendre votre candidature de formateur certifié :</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#0B5FFF;color:#fff;text-decoration:none;border-radius:6px;">
            Continuer ma candidature
          </a>
        </p>
        <p style="color:#666;font-size:13px;">Ce lien est personnel, ne le partagez pas. Il reste valable tant que votre candidature n'est pas soumise.</p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Échec envoi email: ${error.message}`)
  }

  return data
}