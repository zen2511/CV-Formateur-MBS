import { prisma } from '@/lib/prisma'
import FormulaireScoring from '@/components/admin/FormulaireScoring'

const CONFIG_PAR_DEFAUT = {
  poidsCertifications: 40,
  poidsExperience: 30,
  poidsDiplomes: 15,
  poidsDisponibilite: 15,
}

export default async function ScoringPage() {
  let config = await prisma.scoreConfig.findFirst({ orderBy: { version: 'desc' } })
  if (!config) {
    config = await prisma.scoreConfig.create({ data: CONFIG_PAR_DEFAUT })
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Configuration du scoring</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ajuste le poids de chaque critère dans le calcul automatique du score des candidats.
      </p>

      <FormulaireScoring configActuelle={config} />
    </div>
  )
}