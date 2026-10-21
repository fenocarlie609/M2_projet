// prisma/seeds/00_structure.js
// Structure de l'entreprise : departements et postes.

const structureEntreprise = [
  {
    code: "LOGISTICS",
    label: "Logistique & Opérations Maritimes",
    positions: [
      { code: "QUAY_AGENT", label: "Agent de quai" },
      { code: "CREW_MEMBER", label: "Membre d'équipage" },
      { code: "FLEET_MGR", label: "Gestionnaire de flotte" },
      { code: "LOGISTICS_COORD", label: "Coordinateur logistique" },
    ],
  },
  {
    code: "ADMIN",
    label: "Administration & RH",
    positions: [
      { code: "HR_MGR", label: "Responsable Ressources Humaines" },
      { code: "ADMIN_ASST", label: "Assistant administratif" },
      { code: "DIRECTOR", label: "Directeur des opérations" },
    ],
  },
  {
    code: "FINANCE",
    label: "Finance & Comptabilité",
    positions: [
      { code: "ACCOUNTANT", label: "Comptable" },
      { code: "FINANCIAL_ANALYST", label: "Analyste financier" },
    ],
  },
  {
    code: "TECH",
    label: "Technologie & Systèmes",
    positions: [
      { code: "SOFTWARE_ENG", label: "Ingénieur Logiciel" },
      { code: "SYS_ADMIN", label: "Administrateur Système / Réseau" },
      { code: "DBA", label: "Administrateur de Base de Données" },
    ],
  },
  {
    code: "COMMERCIAL",
    label: "Commercial & Relation Client",
    positions: [
      { code: "SALES_REPRESENTATIVE", label: "Chargé de clientèle" },
      { code: "COMMERCIAL_MGR", label: "Responsable Commercial" },
    ],
  },
];

async function run(prisma) {
  for (const departement of structureEntreprise) {
    await prisma.department.upsert({
      where: { code: departement.code },
      update: { label: departement.label },
      create: {
        code: departement.code,
        label: departement.label,
        positions: {
          create: departement.positions.map((poste) => ({
            code: poste.code,
            label: poste.label,
          })),
        },
      },
    });
  }

  console.log(
    `   structure : ${structureEntreprise.length} departements, ` +
      `${structureEntreprise.reduce((t, d) => t + d.positions.length, 0)} postes`,
  );
}

module.exports = { run, structureEntreprise };
