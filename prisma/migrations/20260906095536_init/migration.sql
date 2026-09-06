-- CreateEnum
CREATE TYPE "TypeFormateur" AS ENUM ('LOCAL', 'INTERNATIONAL', 'DIASPORA');

-- CreateEnum
CREATE TYPE "StatutCandidature" AS ENUM ('EN_COURS', 'SOUMISE', 'PRESELECTIONNEE', 'ACCEPTEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "StatutVerification" AS ENUM ('EN_ATTENTE', 'VERIFIEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "ModaliteIntervention" AS ENUM ('PRESENTIEL', 'EN_LIGNE', 'HYBRIDE');

-- CreateTable
CREATE TABLE "candidats" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomComplet" TEXT,
    "sexe" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "nationalite" TEXT,
    "paysResidence" TEXT,
    "villeResidence" TEXT,
    "whatsapp" TEXT,
    "linkedin" TEXT,
    "cvUrl" TEXT,
    "typeFormateur" "TypeFormateur",
    "titreProfessionnel" TEXT,
    "languesParlees" TEXT,
    "statut" "StatutCandidature" NOT NULL DEFAULT 'EN_COURS',
    "etapeCourante" INTEGER NOT NULL DEFAULT 1,
    "tokenLienMagique" TEXT,
    "tokenExpiration" TIMESTAMP(3),
    "scoreTotal" INTEGER,
    "scoreConfigVersion" INTEGER,
    "signatureNom" TEXT,
    "dateSoumission" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domaines_expertise" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,
    "specialite" TEXT,
    "niveau" TEXT,
    "publics" TEXT,
    "anneesExperience" INTEGER,

    CONSTRAINT "domaines_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "domaineEtudes" TEXT,
    "etablissement" TEXT,
    "pays" TEXT,
    "annee" INTEGER,
    "niveau" TEXT,
    "fichierUrl" TEXT,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "organisme" TEXT,
    "domaine" TEXT,
    "numero" TEXT,
    "dateObtention" TIMESTAMP(3),
    "dateExpiration" TIMESTAMP(3),
    "pays" TEXT,
    "lienVerification" TEXT,
    "fichierUrl" TEXT,
    "international" BOOLEAN NOT NULL DEFAULT false,
    "statutVerification" "StatutVerification" NOT NULL DEFAULT 'EN_ATTENTE',

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences_pro" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "entreprise" TEXT,
    "secteur" TEXT,
    "pays" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "responsabilites" TEXT,
    "realisations" TEXT,
    "attestationUrl" TEXT,

    CONSTRAINT "experiences_pro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences_formateur" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "intituleFormation" TEXT NOT NULL,
    "organismeBeneficiaire" TEXT,
    "publicForme" TEXT,
    "nbParticipants" INTEGER,
    "dureeHeures" INTEGER,
    "modalite" "ModaliteIntervention",
    "pays" TEXT,
    "resultats" TEXT,
    "reference" TEXT,

    CONSTRAINT "experiences_formateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "candidatId" TEXT NOT NULL,
    "modalite" "ModaliteIntervention",
    "disponibilite" TEXT,
    "mobiliteCameroun" BOOLEAN NOT NULL DEFAULT false,
    "mobiliteInternationale" BOOLEAN NOT NULL DEFAULT false,
    "paysIntervention" TEXT,
    "heuresMaxSemaine" INTEGER,
    "dureeMinMission" TEXT,
    "tarifHeure" DOUBLE PRECISION,
    "tarifJour" DOUBLE PRECISION,
    "devise" TEXT,
    "tarifNegociable" BOOLEAN NOT NULL DEFAULT false,
    "besoinsLogistiques" TEXT,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("candidatId")
);

-- CreateTable
CREATE TABLE "pieces_jointes" (
    "id" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "pieces_jointes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_configs" (
    "id" SERIAL NOT NULL,
    "version" SERIAL NOT NULL,
    "poidsCertifications" INTEGER NOT NULL DEFAULT 40,
    "poidsExperience" INTEGER NOT NULL DEFAULT 30,
    "poidsDiplomes" INTEGER NOT NULL DEFAULT 15,
    "poidsDisponibilite" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidats_email_key" ON "candidats"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidats_tokenLienMagique_key" ON "candidats"("tokenLienMagique");

-- CreateIndex
CREATE UNIQUE INDEX "score_configs_version_key" ON "score_configs"("version");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "domaines_expertise" ADD CONSTRAINT "domaines_expertise_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences_pro" ADD CONSTRAINT "experiences_pro_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences_formateur" ADD CONSTRAINT "experiences_formateur_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
