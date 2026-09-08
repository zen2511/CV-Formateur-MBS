// lib/scoring.ts
import { prisma } from './prisma'

const NIVEAU_DIPLOME_POINTS: Record<string, number> = {
  'Doctorat': 100,
  'Master': 80,
  'Licence': 60,
  'Bac+2': 40,
  'Bac': 20,
  'Autre': 30,
}

function calculerScoreCertifications(
  certifications: { statutVerification: string; international: boolean }[]
) {
  let score = 0
  for (const cert of certifications) {
    if (cert.statutVerification === 'VERIFIEE') {
      score += cert.international ? 30 : 20
    } else if (cert.statutVerification === 'EN_ATTENTE') {
      score += 5
    }
  }
  return Math.min(100, score)
}

function calculerScoreExperience(
  experiencesPro: { dateDebut: Date | null; dateFin: Date | null }[],
  experiencesFormateur: { dureeHeures: number | null }[]
) {
  const maintenant = new Date()
  const totalMoisExperience = experiencesPro.reduce((total, exp) => {
    if (!exp.dateDebut) return total
    const fin = exp.dateFin ?? maintenant
    const mois = (fin.getFullYear() - exp.dateDebut.getFullYear()) * 12 + (fin.getMonth() - exp.dateDebut.getMonth())
    return total + Math.max(0, mois)
  }, 0)
  const totalAnnees = totalMoisExperience / 12

  const totalHeuresFormation = experiencesFormateur.reduce((total, exp) => total + (exp.dureeHeures ?? 0), 0)

  const scoreAnnees = Math.min(50, totalAnnees * 10)
  const scoreFormateur = Math.min(50, totalHeuresFormation / 10 + experiencesFormateur.length * 5)

  return Math.min(100, Math.round(scoreAnnees + scoreFormateur))
}

function calculerScoreDiplomes(diplomes: { niveau: string | null }[]) {
  if (diplomes.length === 0) return 0
  const meilleurNiveau = Math.max(
    ...diplomes.map((d) => NIVEAU_DIPLOME_POINTS[d.niveau ?? ''] ?? 0)
  )
  const bonusMultiplesDiplomes = Math.max(0, diplomes.length - 1) * 5
  return Math.min(100, meilleurNiveau + bonusMultiplesDiplomes)
}

function calculerScoreDisponibilite(dispo: {
  modalite: string | null
  disponibilite: string | null
  devise: string | null
  tarifHeure: number | null
  tarifJour: number | null
  mobiliteCameroun: boolean
  mobiliteInternationale: boolean
  tarifNegociable: boolean
} | null) {
  if (!dispo) return 0
  let score = 0
  if (dispo.modalite) score += 20
  if (dispo.disponibilite) score += 20
  if (dispo.devise && (dispo.tarifHeure !== null || dispo.tarifJour !== null)) score += 20
  if (dispo.mobiliteCameroun) score += 15
  if (dispo.mobiliteInternationale) score += 15
  if (dispo.tarifNegociable) score += 10
  return Math.min(100, score)
}

const CONFIG_PAR_DEFAUT = {
  poidsCertifications: 40,
  poidsExperience: 30,
  poidsDiplomes: 15,
  poidsDisponibilite: 15,
}

export async function calculerScoreCandidat(candidatId: string) {
  const [certifications, experiencesPro, experiencesFormateur, diplomes, disponibilite] = await Promise.all([
    prisma.certification.findMany({ where: { candidatId } }),
    prisma.experiencePro.findMany({ where: { candidatId } }),
    prisma.experienceFormateur.findMany({ where: { candidatId } }),
    prisma.diplome.findMany({ where: { candidatId } }),
    prisma.disponibilite.findUnique({ where: { candidatId } }),
  ])

  let config = await prisma.scoreConfig.findFirst({ orderBy: { version: 'desc' } })
  if (!config) {
    config = await prisma.scoreConfig.create({ data: CONFIG_PAR_DEFAUT })
  }

  const scoreCertifications = calculerScoreCertifications(certifications)
  const scoreExperience = calculerScoreExperience(experiencesPro, experiencesFormateur)
  const scoreDiplomes = calculerScoreDiplomes(diplomes)
  const scoreDisponibilite = calculerScoreDisponibilite(disponibilite)

  const totalPoids =
    config.poidsCertifications + config.poidsExperience + config.poidsDiplomes + config.poidsDisponibilite

  const scoreTotal = totalPoids > 0
    ? Math.round(
        (scoreCertifications * config.poidsCertifications +
          scoreExperience * config.poidsExperience +
          scoreDiplomes * config.poidsDiplomes +
          scoreDisponibilite * config.poidsDisponibilite) / totalPoids
      )
    : 0

  return {
    scoreTotal,
    scoreConfigVersion: config.version,
    details: { scoreCertifications, scoreExperience, scoreDiplomes, scoreDisponibilite },
  }
}