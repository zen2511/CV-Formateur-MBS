// app/api/candidature/[token]/suivant/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CHAMPS_REQUIS_ETAPE_1, etapeEstComplete } from '@/lib/validation'
import { etapeSeptEstComplete } from '@/lib/validation'

const NB_ETAPES = 6

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const etapeActuelle = Number(body.etapeActuelle)

  if (!etapeActuelle || etapeActuelle < 1 || etapeActuelle > NB_ETAPES) {
    return NextResponse.json({ error: 'Étape invalide.' }, { status: 400 })
  }

  const candidat = await prisma.candidat.findUnique({ where: { tokenLienMagique: token } })

  if (!candidat) {
    return NextResponse.json({ error: 'Lien invalide.' }, { status: 404 })
  }

  if (candidat.statut !== 'EN_COURS') {
    return NextResponse.json({ error: 'Candidature déjà finalisée.' }, { status: 403 })
  }

  if (etapeActuelle === 1 && !etapeEstComplete(candidat, CHAMPS_REQUIS_ETAPE_1)) {
    return NextResponse.json(
      { error: 'Merci de compléter tous les champs obligatoires avant de continuer.' },
      { status: 422 }
    )
  }

  if (etapeActuelle === 2) {
    const nbDomaines = await prisma.domaineExpertise.count({
      where: { candidatId: candidat.id },
    })
    if (nbDomaines === 0) {
      return NextResponse.json(
        { error: "Ajoute au moins un domaine d'expertise avant de continuer." },
        { status: 422 }
      )
    }
  }

   if (etapeActuelle === 3) {
    const [nbDiplomes, nbCertifications] = await Promise.all([
      prisma.diplome.count({ where: { candidatId: candidat.id } }),
      prisma.certification.count({ where: { candidatId: candidat.id } }),
    ])
    if (nbDiplomes === 0) {
      return NextResponse.json({ error: 'Ajoute au moins un diplôme avant de continuer.' }, { status: 422 })
    }
    if (nbCertifications === 0) {
      return NextResponse.json({ error: 'Ajoute au moins une certification avant de continuer.' }, { status: 422 })
    }
  }

    if (etapeActuelle === 4) {
    const [nbPro, nbFormateur] = await Promise.all([
      prisma.experiencePro.count({ where: { candidatId: candidat.id } }),
      prisma.experienceFormateur.count({ where: { candidatId: candidat.id } }),
    ])
    if (nbPro === 0 && nbFormateur === 0) {
      return NextResponse.json(
        { error: 'Ajoute au moins une expérience (professionnelle ou formateur) avant de continuer.' },
        { status: 422 }
      )
    }
  }

  if (etapeActuelle === 5) {
  const dispo = await prisma.disponibilite.findUnique({ where: { candidatId: candidat.id } })
  if (!etapeSeptEstComplete(dispo)) {
    return NextResponse.json(
      { error: 'Merci de compléter la disponibilité et au moins un tarif (heure ou jour).' },
      { status: 422 }
    )
  }
}

  // Étapes 3 à 8 : validation à ajouter au fur et à mesure qu'on les construit.

  const prochaineEtape = Math.min(etapeActuelle + 1, NB_ETAPES)
  const nouvelleEtapeCourante = Math.min(Math.max(candidat.etapeCourante, prochaineEtape), NB_ETAPES)

  await prisma.candidat.update({
    where: { id: candidat.id },
    data: { etapeCourante: nouvelleEtapeCourante },
  })

  return NextResponse.json({ success: true, prochaineEtape })
}