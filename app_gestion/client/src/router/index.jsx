import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'

// Pages
import Dashboard  from '../pages/dashboard/Dashboard'
import Fleet      from '../pages/fleet/Fleet'
import Voyages    from '../pages/voyages/Voyages'
import Cargo      from '../pages/cargo/Cargo'
import Clients    from '../pages/clients/Clients'
import HR         from '../pages/hr/HR'
import Documents  from '../pages/documents/Documents'
import Finance    from '../pages/finance/Finance'
import Reports    from '../pages/reports/Reports'
import Settings   from '../pages/settings/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,            element: <Dashboard /> },
      { path: 'flotte',         element: <Fleet />     },
      { path: 'voyages',        element: <Voyages />   },
      { path: 'cargaisons',     element: <Cargo />     },
      { path: 'clients',        element: <Clients />   },
      { path: 'employes',       element: <HR />        },
      { path: 'documents',      element: <Documents /> },
      { path: 'finances',       element: <Finance />   },
      { path: 'rapports',       element: <Reports />   },
      { path: 'parametres',     element: <Settings />  },
    ],
  },
])
