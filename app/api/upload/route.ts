import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
  const formData = await request.formData()
  const fichier = formData.get('fichier') as File | null

  if (!fichier) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
  }

  if (fichier.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 413 })
  }

  const buffer = Buffer.from(await fichier.arrayBuffer())

  const resultat = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: 'raw', folder: 'cv-mbs' },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      )
      .end(buffer)
  })

  return NextResponse.json({ url: resultat.secure_url })
}