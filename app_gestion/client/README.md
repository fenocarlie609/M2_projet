# 📱 App Gestion - Frontend (Client)

Architecture modulaire basée sur les **fonctionnalités** pour une maintenance et scalabilité optimales.

## 🏗️ Structure du Projet

```
src/
├── core/                          # Shell de l'application
│   ├── App.jsx                   # Routage principal & protection des routes
│   └── routes/
│       └── routeConfig.jsx       # Configuration centralisée des routes
│
├── features/                      # Modules fonctionnels isolés
│   ├── auth/                     # Module d'authentification
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # State global auth + session persistence
│   │   ├── pages/
│   │   │   └── LoginPage/
│   │   │       ├── LoginPage.jsx # UI Login
│   │   │       └── login.service.js # API login
│   │   └── index.js              # Barrel export
│   │
│   ├── dashboard/                # Module Dashboard
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   └── index.js
│   │
│   ├── admin/                    # Module Admin
│   ├── superadmin/               # Module SuperAdmin
│   └── user/                     # Module User
│
├── shared/                        # Code réutilisable
│   ├── services/
│   │   ├── axiosInstance.js      # Client HTTP configuré
│   │   └── (autres services)
│   ├── contexts/
│   ├── hooks/
│   ├── utils/
│   ├── components/               # Composants génériques
│   ├── styles/
│   └── constants/
│
├── main.jsx                      # Entry point
└── index.css                     # Styles globaux
```

## 🎯 Principes d'Architecture

### 1. **Module = Fonctionnalité Autonome**

Chaque feature est indépendante et contient:

- Pages/Components spécifiques
- Services API (appels HTTP)
- Contexts (state local si nécessaire)
- Logique métier

### 2. **Partage via `shared/`**

- Services HTTP génériques
- Utilitaires réutilisables
- Contextes globaux (Auth)
- Composants UI réutilisables

### 3. **Routing Centralisé**

Toutes les routes définies dans `routeConfig.jsx` avec:

- Métadonnées (icônes, labels)
- Rôles d'accès
- Sections de navigation

## 🚀 Comment Ajouter un Nouveau Module

### Exemple: Créer un module "Boats"

#### 1. Créer la structure

```bash
src/features/boats/
├── pages/
│   └── BoatsPage/
│       ├── BoatsPage.jsx
│       └── boats.service.js
├── contexts/
│   └── BoatsContext.jsx (optionnel si state local)
├── components/ (optionnel)
│   ├── BoatCard.jsx
│   └── BoatForm.jsx
└── index.js
```

#### 2. Créer le service API (`boats.service.js`)

```javascript
import axiosInstance from "@/shared/services/axiosInstance";

export const boatsService = {
  getAll: () => axiosInstance.get("/boats"),
  getById: (id) => axiosInstance.get(`/boats/${id}`),
  create: (data) => axiosInstance.post("/boats", data),
  update: (id, data) => axiosInstance.put(`/boats/${id}`, data),
  delete: (id) => axiosInstance.delete(`/boats/${id}`),
};
```

#### 3. Créer la page principale (`BoatsPage.jsx`)

```javascript
import React, { useEffect, useState } from "react";
import { boatsService } from "./boats.service";
import { showToast } from "@/shared/utils/toast";

export const BoatsPage = () => {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    setLoading(true);
    try {
      const response = await boatsService.getAll();
      setBoats(response.data.data);
    } catch (error) {
      showToast.error("Erreur lors du chargement des navires");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Navires</h1>
      {/* Contenu */}
    </div>
  );
};
```

#### 4. Créer le barrel export (`index.js`)

```javascript
export { BoatsPage } from "./pages/BoatsPage/BoatsPage";
```

#### 5. Ajouter la route dans `routeConfig.jsx`

```javascript
{
  path: "/boats",
  element: <BoatsPage />,
  roles: ["admin", "superadmin"],
  label: "Navires",
  icon: FiAnchor,
  section: "Gestion",
}
```

## 🔌 Integration des Services

### axiosInstance

Client HTTP pré-configuré avec:

- Base URL: `/api/v1`
- Credentials: Cookies httpOnly automatiques
- Intercepteurs: Gestion des erreurs 401

```javascript
import { axiosInstance } from "@/shared/services";

// Utilisation automatique du token depuis les cookies
const response = await axiosInstance.get("/users");
```

### AuthContext

State global pour l'authentification:

```javascript
import { useAuth } from "@/features/auth";

const { user, login, logout, isAuthenticated } = useAuth();
```

### Toast Notifications

```javascript
import { showToast } from "@/shared/utils/toast";

showToast.success("Succès!");
showToast.error("Erreur!");
showToast.info("Info");
```

## 🎨 Stylisation

### Tailwind CSS + Configuration Personnalisée

Couleurs personnalisées disponibles:

- `navy-sider` (navbarre sider)
- `navy-trigger` (hover navbarre)
- `brand-primary` (vert émeraude)

```jsx
<button className="bg-brand-primary text-white hover:shadow-lg">Action</button>
```

## 🔐 Authentification & Roles

### Rôles Disponibles

- `admin`: Accès dashboard + gestion
- `superadmin`: Accès complet
- `user`: Accès basique

### Protéger une Route

```javascript
{
  path: "/admin",
  element: <AdminPage />,
  roles: ["admin", "superadmin"], // Vérification automatique
}
```

## 🚀 Installation & Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage dev (HMR + Proxy API)
npm run dev

# Build production
npm run build

# Préview build
npm run preview
```

## 🛠️ Dépendances Principales

- **React 18** - Framework UI
- **React Router v6** - Routage SPA
- **Axios** - Client HTTP
- **Tailwind CSS 4** - Styling
- **React Icons** - Icônes
- **React Toastify** - Notifications
- **Zustand** - State management (optionnel)

## 📋 Checklist pour Nouveau Module

- [ ] Créer dossier `features/[module]`
- [ ] Créer structure pages/components/services
- [ ] Implémenter service API
- [ ] Créer page principale avec logique
- [ ] Créer barrel export `index.js`
- [ ] Ajouter route dans `routeConfig.jsx`
- [ ] Tester l'intégration
- [ ] Ajouter context si state complexe

## 🐛 Debugging

### Console DevTools

- Redux/Zustand DevTools pour state
- Network tab pour API calls
- Console pour erreurs JS

### Logs Axios

```javascript
// Dans axiosInstance.js - intercepteurs
request: (config) => {
  console.log("📤 Request:", config);
  return config;
},
response: (response) => {
  console.log("📥 Response:", response);
  return response;
},
```

## 📞 Support

Pour toute question sur l'architecture, consultez:

1. Ce README
2. Le README backend (logique API)
3. Code existant des modules similaires

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-07-18
