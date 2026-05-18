/* ═══════════════════════════════════════════════════════
   DONNÉES MOCK — Maritime Admin
   Remplacer par les vrais appels API une fois le back connecté
   ═══════════════════════════════════════════════════════ */

export const mockStats = {
  naviresEnMer: 3,
  naviresTotal: 5,
  voyagesEnCours: 4,
  voyagesEnRetard: 1,
  tonnageMois: 12450,
  caMois: 48200000,
  ponctualite: 87,
  tauxRemplissage: 73,
  clientsActifs: 24,
}

export const mockVoyages = [
  {
    id: 'V-2025-041',
    navire: 'MV Fianarana',
    depart: 'Toamasina',
    destination: 'Mahajanga',
    dateDepart: '2025-05-08',
    arriveePrevisionnelle: '2025-05-12',
    fret: 'Riz, 320 T',
    statut: 'En cours',
    clientId: 1,
  },
  {
    id: 'V-2025-042',
    navire: 'MV Morondava',
    depart: 'Toamasina',
    destination: 'Morondava',
    dateDepart: '2025-05-07',
    arriveePrevisionnelle: '2025-05-10',
    fret: 'Carburant, 180 T',
    statut: 'Retard',
    clientId: 2,
  },
  {
    id: 'V-2025-043',
    navire: 'MV Betsileo',
    depart: 'Mahajanga',
    destination: 'Toamasina',
    dateDepart: '2025-05-15',
    arriveePrevisionnelle: '2025-05-18',
    fret: 'Crevettes, 45 T',
    statut: 'Planifié',
    clientId: 3,
  },
  {
    id: 'V-2025-040',
    navire: 'MV Sakalava',
    depart: 'Toliara',
    destination: 'Toamasina',
    dateDepart: '2025-05-02',
    arriveePrevisionnelle: '2025-05-05',
    fret: 'Sel, 210 T',
    statut: 'Terminé',
    clientId: 1,
  },
]

export const mockNavires = [
  {
    id: 1,
    nom: 'MV Fianarana',
    type: 'Cargo général',
    capaciteTonnes: 500,
    anneeConstruction: 2010,
    numeroIMO: 'IMO9876543',
    pavillon: 'Madagascar',
    statut: 'En mer',
    prochaineMaintenance: '2025-07-15',
  },
  {
    id: 2,
    nom: 'MV Morondava',
    type: 'Citerne',
    capaciteTonnes: 300,
    anneeConstruction: 2008,
    numeroIMO: 'IMO9876544',
    pavillon: 'Madagascar',
    statut: 'En mer',
    prochaineMaintenance: '2025-06-01',
  },
  {
    id: 3,
    nom: 'MV Betsileo',
    type: 'Cargo général',
    capaciteTonnes: 450,
    anneeConstruction: 2015,
    numeroIMO: 'IMO9876545',
    pavillon: 'Madagascar',
    statut: 'En mer',
    prochaineMaintenance: '2025-05-13',  // bientôt !
  },
  {
    id: 4,
    nom: 'MV Sakalava',
    type: 'Cargo général',
    capaciteTonnes: 400,
    anneeConstruction: 2012,
    numeroIMO: 'IMO9876546',
    pavillon: 'Madagascar',
    statut: 'Au port',
    prochaineMaintenance: '2025-08-20',
  },
  {
    id: 5,
    nom: 'MV Tamotamo',
    type: 'Remorqueur',
    capaciteTonnes: 80,
    anneeConstruction: 2005,
    numeroIMO: 'IMO9876547',
    pavillon: 'Madagascar',
    statut: 'Au port',
    prochaineMaintenance: '2025-09-10',
  },
]

export const mockClients = [
  {
    id: 1,
    nom: 'SOCOLAIT Mahajanga',
    contact: 'Jean Rakoto',
    email: 'j.rakoto@socolait.mg',
    telephone: '+261 20 62 123 45',
    ville: 'Mahajanga',
    actif: true,
    voyagesTotal: 12,
  },
  {
    id: 2,
    nom: 'JIRAMA',
    contact: 'Marie Razafy',
    email: 'm.razafy@jirama.mg',
    telephone: '+261 20 22 456 78',
    ville: 'Antananarivo',
    actif: true,
    voyagesTotal: 8,
  },
  {
    id: 3,
    nom: 'SME Toliara',
    contact: 'Paul Andriamasy',
    email: 'p.andriamasy@sme.mg',
    telephone: '+261 20 94 789 01',
    ville: 'Toliara',
    actif: true,
    voyagesTotal: 5,
  },
  {
    id: 4,
    nom: 'COTONA',
    contact: 'Hanta Rakotondrabe',
    email: 'h.rakotondrabe@cotona.mg',
    telephone: '+261 20 53 234 56',
    ville: 'Toamasina',
    actif: false,
    voyagesTotal: 3,
  },
]

export const mockEmployes = [
  { id: 1, nom: 'Rakoto Jean',    poste: 'Capitaine',          departement: 'Navigation', statut: 'En mission' },
  { id: 2, nom: 'Razafy Marie',   poste: 'Officier de pont',   departement: 'Navigation', statut: 'En mission' },
  { id: 3, nom: 'Andry Paul',     poste: 'Mécanicien chef',    departement: 'Technique',  statut: 'Au port'    },
  { id: 4, nom: 'Hanta Solo',     poste: 'Agent commercial',   departement: 'Commercial', statut: 'Bureau'     },
  { id: 5, nom: 'Feno Carlie',    poste: 'Resp. Informatique', departement: 'Admin',      statut: 'Bureau'     },
]

export const mockAlerts = [
  { id: 1, titre: 'MV Morondava en retard', detail: 'ETA dépassé de 14h — contacter le client',     type: 'error'   },
  { id: 2, titre: 'Connaissement manquant', detail: 'Voyage #V-2025-042 — document requis',           type: 'warning' },
  { id: 3, titre: 'Visite technique due',   detail: 'MV Betsileo — échéance dans 3 jours',           type: 'warning' },
]
