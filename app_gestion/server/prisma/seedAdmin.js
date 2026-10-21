// prisma/seedAdmin.js
// Amorçage d'un administrateur universel.
//
// Ce script est exécuté au démarrage de l'environnement conteneurisé. Il
// garantit qu'un compte disposant de tous les droits existe, afin de pouvoir
// créer ensuite les comptes des utilisateurs de l'entreprise depuis
// l'interface (écran « Utilisateurs »), qui sont réservés au département
// technique.
//
// Le compte est idempotent : le relancer met à jour le mot de passe et les
// droits du compte existant au lieu d'en créer un second.
//
// Variables d'environnement reconnues :
//   ADMIN_EMAIL     adresse de connexion   (defaut : admin@lct.mg)
//   ADMIN_PASSWORD  mot de passe initial   (defaut : Admin@2026)
//   ADMIN_NAME      nom affiché           (defaut : Administrateur Système)
// L'environnement de developpement est prioritaire ; en conteneur, les
// variables proviennent de l'orchestrateur.
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();

const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { hashPassword } = require("../src/common/utils/password.utils");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN = {
  name: process.env.ADMIN_NAME || "Administrateur Système",
  email: (process.env.ADMIN_EMAIL || "admin@lct.mg").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "Admin@2026",
  departmentCode: "TECH",
  departmentLabel: "Technologie & Systèmes",
  positionCode: "SYS_ADMIN",
  positionLabel: "Administrateur Système / Réseau",
};

async function ensureDepartment() {
  const department = await prisma.department.upsert({
    where: { code: ADMIN.departmentCode },
    update: { label: ADMIN.departmentLabel },
    create: { code: ADMIN.departmentCode, label: ADMIN.departmentLabel },
  });

  const position = await prisma.position.upsert({
    where: { code: ADMIN.positionCode },
    update: { label: ADMIN.positionLabel, departmentId: department.id },
    create: {
      code: ADMIN.positionCode,
      label: ADMIN.positionLabel,
      departmentId: department.id,
    },
  });

  return { department, position };
}

async function ensureSuperAdminModule() {
  return prisma.appModule.upsert({
    where: { code: "*" },
    update: { label: "Tous les modules (super-accès)" },
    create: { code: "*", label: "Tous les modules (super-accès)" },
  });
}

async function main() {
  console.log("🛡️  Amorçage de l'administrateur universel...");

  const { department, position } = await ensureDepartment();
  await ensureSuperAdminModule();

  const password = await hashPassword(ADMIN.password);

  // Le matricule suit la convention DEPT-POSTE-INDEX du module employés.
  const matricule = "TECH-SA-01";

  const employee = await prisma.employee.upsert({
    where: { email: ADMIN.email },
    update: {
      name: ADMIN.name,
      password,
      hasAppAccess: true,
      isActive: true,
      departmentId: department.id,
      positionId: position.id,
      deletedAt: null,
    },
    create: {
      name: ADMIN.name,
      email: ADMIN.email,
      password,
      matricule,
      hasAppAccess: true,
      isActive: true,
      departmentId: department.id,
      positionId: position.id,
    },
  });

  // Droit universel : le couple (module, action) vaut ("*", "*").
  await prisma.employeePermission.upsert({
    where: {
      employeeId_module_action: {
        employeeId: employee.id,
        module: "*",
        action: "*",
      },
    },
    update: {},
    create: { employeeId: employee.id, module: "*", action: "*" },
  });

  console.log("✅ Administrateur universel disponible.");
  console.log(`   matricule : ${employee.matricule}`);
  console.log(`   adresse   : ${employee.email}`);
  console.log(`   mot de passe initial : ${ADMIN.password}`);
  console.log(
    "   Ce mot de passe doit être changé dès la première connexion ; il est lisible dans la configuration de l'environnement.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
