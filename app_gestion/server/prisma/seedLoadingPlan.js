require("dotenv").config({ path: ".env.development" });

const { PrismaClient, Prisma } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const decimal = (value) => new Prisma.Decimal(String(value));

async function upsertPort(data) {
  return prisma.port.upsert({
    where: { code: data.code },
    update: data,
    create: data,
  });
}

async function upsertVessel(data) {
  return prisma.vessel.upsert({
    where: { registrationNumber: data.registrationNumber },
    update: data,
    create: data,
  });
}

async function upsertVehicle(data) {
  return prisma.vehicle.upsert({
    where: { licensePlate: data.licensePlate },
    update: data,
    create: data,
  });
}

async function findOrCreateClient(data) {
  const existing = await prisma.client.findFirst({
    where: { name: data.name },
  });
  return existing || prisma.client.create({ data });
}

async function findOrCreateDriver(data) {
  const existing = await prisma.driver.findFirst({
    where: { licensePlate: data.licensePlate },
  });
  return existing || prisma.driver.create({ data });
}

async function upsertVoyage(data) {
  return prisma.voyage.upsert({
    where: {
      vesselId_voyageNumber: {
        vesselId: data.vesselId,
        voyageNumber: data.voyageNumber,
      },
    },
    update: data,
    create: data,
  });
}

async function seedPlan({ reference, voyageId, status, lines }) {
  const plan = await prisma.loadingPlan.upsert({
    where: { reference },
    update: { voyageId, status },
    create: { reference, voyageId, status, totalWeightKg: decimal(0) },
  });

  await prisma.cargoLine.deleteMany({ where: { loadingPlanId: plan.id } });

  const totalWeightKg = lines.reduce(
    (total, line) => total + Number(line.weightKg),
    0,
  );

  await prisma.cargoLine.createMany({
    data: lines.map((line) => ({
      ...line,
      loadingPlanId: plan.id,
      weightKg: decimal(line.weightKg),
    })),
  });

  return prisma.loadingPlan.update({
    where: { id: plan.id },
    data: { totalWeightKg: decimal(totalWeightKg) },
    include: { cargoLines: true },
  });
}

async function main() {
  console.log("Debut du seed des donnees logistiques de demonstration...");

  const [toamasina, antalaha, mahajanga, antsiranana] = await Promise.all([
    upsertPort({
      code: "MGTOA",
      name: "Port de Toamasina",
      country: "Madagascar",
    }),
    upsertPort({
      code: "MGANT",
      name: "Port d'Antalaha",
      country: "Madagascar",
    }),
    upsertPort({
      code: "MGMAJ",
      name: "Port de Mahajanga",
      country: "Madagascar",
    }),
    upsertPort({
      code: "MGDIE",
      name: "Port d'Antsiranana",
      country: "Madagascar",
    }),
  ]);

  const [lctAzad, premiumExpress] = await Promise.all([
    upsertVessel({
      name: "LCT AZAD FENOVAVY",
      operatorName: "Transport maritime Tamatave - Antalaha",
      registrationNumber: "MG-LCT-AZAD",
      capacityTons: decimal(120),
      status: "ACTIVE",
    }),
    upsertVessel({
      name: "PREMIUM EXPRESS I",
      operatorName: "Mada Maritime Logistics",
      registrationNumber: "MG-PEX-001",
      capacityTons: decimal(250),
      status: "ACTIVE",
    }),
  ]);

  const [voyage13, voyage14, voyage21] = await Promise.all([
    upsertVoyage({
      vesselId: lctAzad.id,
      departurePortId: antalaha.id,
      arrivalPortId: toamasina.id,
      voyageNumber: "13E VOYAGE",
      departureDate: new Date("2026-07-10T08:00:00.000Z"),
      arrivalDate: new Date("2026-07-11T08:00:00.000Z"),
      status: "CLOSED",
    }),
    upsertVoyage({
      vesselId: lctAzad.id,
      departurePortId: toamasina.id,
      arrivalPortId: antsiranana.id,
      voyageNumber: "14E VOYAGE",
      departureDate: new Date("2026-08-02T08:00:00.000Z"),
      arrivalDate: new Date("2026-08-04T08:00:00.000Z"),
      status: "OPEN",
    }),
    upsertVoyage({
      vesselId: premiumExpress.id,
      departurePortId: mahajanga.id,
      arrivalPortId: toamasina.id,
      voyageNumber: "21E VOYAGE",
      departureDate: new Date("2026-09-20T08:00:00.000Z"),
      arrivalDate: new Date("2026-09-22T08:00:00.000Z"),
      status: "OPEN",
    }),
  ]);

  const [kenny, pairon, richard, herve, anais, tsaravokatra, amical] =
    await Promise.all([
      findOrCreateClient({
        name: "Mr KENNY",
        type: "INDIVIDUAL",
        phone: "+261340000101",
      }),
      findOrCreateClient({
        name: "PAITRON AZAD",
        type: "COMPANY",
        phone: "+261340000102",
      }),
      findOrCreateClient({
        name: "RICHARD",
        type: "INDIVIDUAL",
        phone: "+261340000103",
      }),
      findOrCreateClient({
        name: "Mr HERVE",
        type: "INDIVIDUAL",
        phone: "+261340000104",
      }),
      findOrCreateClient({
        name: "ANAIS",
        type: "INDIVIDUAL",
        phone: "+261340000105",
      }),
      findOrCreateClient({
        name: "TSARAVOKATRA",
        type: "COMPANY",
        phone: "+261340000106",
      }),
      findOrCreateClient({
        name: "AMICAL",
        type: "COMPANY",
        phone: "+261340000107",
      }),
    ]);

  const [rakoto, odilon, jimmy, haja, fulgence, toihire] = await Promise.all([
    findOrCreateDriver({
      name: "Rakoto",
      type: "INDIVIDUAL",
      licensePlate: "8466AJ",
      phone: "+261340001101",
    }),
    findOrCreateDriver({
      name: "Odilon",
      type: "INDIVIDUAL",
      licensePlate: "ODILON-01",
      phone: "+261340001102",
    }),
    findOrCreateDriver({
      name: "Jimmy",
      type: "INDIVIDUAL",
      licensePlate: "4676AF",
      phone: "+261340001103",
    }),
    findOrCreateDriver({
      name: "Haja",
      type: "INDIVIDUAL",
      licensePlate: "6253DJ",
      phone: "+261340001104",
    }),
    findOrCreateDriver({
      name: "Fulgence",
      type: "INDIVIDUAL",
      licensePlate: "5066AH",
      phone: "+261340001105",
    }),
    findOrCreateDriver({
      name: "Toihire",
      type: "INDIVIDUAL",
      licensePlate: "0467AJ",
      phone: "+261340001106",
    }),
  ]);

  const [truckRakoto, truckJimmy, truckHaja, truckFulgence, truckToihire] =
    await Promise.all([
      upsertVehicle({
        licensePlate: "8466AJ",
        type: "Camion plateau",
        capacityTons: decimal(20),
        status: "ACTIVE",
      }),
      upsertVehicle({
        licensePlate: "4676AF",
        type: "Camion benne",
        capacityTons: decimal(25),
        status: "ACTIVE",
      }),
      upsertVehicle({
        licensePlate: "6253DJ",
        type: "Camion fourgon",
        capacityTons: decimal(15),
        status: "ACTIVE",
      }),
      upsertVehicle({
        licensePlate: "5066AH",
        type: "Camion citerne",
        capacityTons: decimal(35),
        status: "ACTIVE",
      }),
      upsertVehicle({
        licensePlate: "0467AJ",
        type: "Camion plateau",
        capacityTons: decimal(30),
        status: "ACTIVE",
      }),
    ]);

  const referencePlan = await seedPlan({
    reference: "PL-13E-2026",
    voyageId: voyage13.id,
    status: "SUBMITTED",
    lines: [
      {
        clientId: kenny.id,
        driverId: rakoto.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-07-13T08:00:00.000Z"),
        packageCount: 135,
        description: "Colis Balles FRIPE 45KG",
        weightKg: 6075,
        anomaly: null,
        loadingPosition: "AZAD",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: kenny.id,
        driverId: rakoto.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-07-13T08:00:00.000Z"),
        packageCount: 295,
        description: "Colis Balles FRIPE 40KG",
        weightKg: 11800,
        anomaly: null,
        loadingPosition: "AZAD",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: kenny.id,
        driverId: rakoto.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-07-13T08:00:00.000Z"),
        packageCount: 5,
        description: "Colis BIG BAG Valise",
        weightKg: 224,
        anomaly: null,
        loadingPosition: "AZAD",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: pairon.id,
        driverId: odilon.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-07-14T08:00:00.000Z"),
        packageCount: 46,
        description: "Cornieres de 60x60",
        weightKg: 0,
        anomaly: "Poids a confirmer",
        loadingPosition: "AZAD",
        isHazardous: false,
        status: "PENDING",
      },
      {
        clientId: richard.id,
        driverId: jimmy.id,
        vehicleId: truckJimmy.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 1400,
        description: "SABA BLEU 3,75 kg",
        weightKg: 5625,
        anomaly: null,
        loadingPosition: "C2",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: richard.id,
        driverId: jimmy.id,
        vehicleId: truckJimmy.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 100,
        description: "SABA FLORAL 3,75 kg",
        weightKg: 0,
        anomaly: "Poids a confirmer",
        loadingPosition: "C2",
        isHazardous: false,
        status: "PENDING",
      },
      {
        clientId: herve.id,
        driverId: jimmy.id,
        vehicleId: truckJimmy.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 80,
        description: "Sacs de Riz la FAMILLE",
        weightKg: 4000,
        anomaly: null,
        loadingPosition: "C2",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: anais.id,
        driverId: haja.id,
        vehicleId: truckHaja.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 30,
        description: "Cartons de lait CEBON 24kg",
        weightKg: 720,
        anomaly: null,
        loadingPosition: "C2",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: tsaravokatra.id,
        driverId: fulgence.id,
        vehicleId: truckFulgence.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 640,
        description: "Sacs de Ciment LUCKY",
        weightKg: 32000,
        anomaly: "12 colis",
        loadingPosition: "C2",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: amical.id,
        driverId: toihire.id,
        vehicleId: truckToihire.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 400,
        description: "Sacs de Farine LAFARINA",
        weightKg: 20000,
        anomaly: null,
        loadingPosition: "C1",
        isHazardous: false,
        status: "LOADED",
      },
      {
        clientId: amical.id,
        driverId: toihire.id,
        vehicleId: truckToihire.id,
        loadingDate: new Date("2026-07-15T08:00:00.000Z"),
        packageCount: 300,
        description: "Sacs de Farine le PAIN",
        weightKg: 15000,
        anomaly: null,
        loadingPosition: "C1",
        isHazardous: false,
        status: "LOADED",
      },
    ],
  });

  await seedPlan({
    reference: "PL-14E-2026",
    voyageId: voyage14.id,
    status: "DRAFT",
    lines: [
      {
        clientId: kenny.id,
        driverId: rakoto.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-08-03T08:00:00.000Z"),
        packageCount: 80,
        description: "Cartons de pièces détachées",
        weightKg: 3200,
        anomaly: null,
        loadingPosition: "A1",
        isHazardous: false,
        status: "PENDING",
      },
      {
        clientId: pairon.id,
        driverId: odilon.id,
        vehicleId: truckRakoto.id,
        loadingDate: new Date("2026-08-03T08:00:00.000Z"),
        packageCount: 120,
        description: "Tôles galvanisées",
        weightKg: 7800,
        anomaly: null,
        loadingPosition: "A2",
        isHazardous: false,
        status: "PENDING",
      },
      {
        clientId: richard.id,
        driverId: jimmy.id,
        vehicleId: truckJimmy.id,
        loadingDate: new Date("2026-08-04T08:00:00.000Z"),
        packageCount: 60,
        description: "Matériel de chantier",
        weightKg: 4250,
        anomaly: null,
        loadingPosition: "B1",
        isHazardous: false,
        status: "PENDING",
      },
    ],
  });

  await seedPlan({
    reference: "PL-21E-2026",
    voyageId: voyage21.id,
    status: "SUBMITTED",
    lines: [
      {
        clientId: herve.id,
        driverId: haja.id,
        vehicleId: truckHaja.id,
        loadingDate: new Date("2026-09-21T08:00:00.000Z"),
        packageCount: 250,
        description: "Sacs de riz premium",
        weightKg: 12500,
        anomaly: null,
        loadingPosition: "D1",
        isHazardous: false,
        status: "PENDING",
      },
      {
        clientId: tsaravokatra.id,
        driverId: fulgence.id,
        vehicleId: truckFulgence.id,
        loadingDate: new Date("2026-09-21T08:00:00.000Z"),
        packageCount: 400,
        description: "Ciment et matériaux",
        weightKg: 20000,
        anomaly: null,
        loadingPosition: "D2",
        isHazardous: false,
        status: "PENDING",
      },
    ],
  });

  console.log(
    `Plans de demonstration crees : ${referencePlan.reference} (95,444 tonnes attendues), PL-14E-2026, PL-21E-2026`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
