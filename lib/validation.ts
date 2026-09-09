// lib/validation.ts
import type { Candidat } from '../src/generated/prisma/client'
import type { Disponibilite } from '../src/generated/prisma/client'

export const CHAMPS_REQUIS_ETAPE_1: (keyof Candidat)[] = [
  'nomComplet',
  'nationalite',
  'paysResidence',
  'villeResidence',
  'typeFormateur',
  'titreProfessionnel',
'cvUrl',
]

export function etapeEstComplete(candidat: Partial<Candidat>, champsRequis: (keyof Candidat)[]) {
  return champsRequis.every((champ) => {
    const valeur = candidat[champ]
    return valeur !== null && valeur !== undefined && valeur !== ''
  })
}


export const CHAMPS_REQUIS_ETAPE_7: (keyof Disponibilite)[] = [
  'modalite',
  'disponibilite',
  'devise',
]

export function etapeSeptEstComplete(dispo: Partial<Disponibilite> | null | undefined) {
  if (!dispo) return false

  const champsBase = CHAMPS_REQUIS_ETAPE_7.every(
    (c) => dispo[c] !== null && dispo[c] !== undefined && dispo[c] !== ''
  )

  const auMoinsUnTarif =
    (dispo.tarifHeure ?? null) !== null || (dispo.tarifJour ?? null) !== null

  const paysOk =
    !dispo.mobiliteInternationale ||
    (dispo.paysIntervention && dispo.paysIntervention.trim() !== '')

  return champsBase && auMoinsUnTarif && paysOk
}