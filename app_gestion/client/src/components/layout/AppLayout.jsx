import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Avatar, Badge, Typography,
  Space, Dropdown, Button, theme,
} from 'antd'
import {
  DashboardOutlined,
  CompassOutlined,
  InboxOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CarOutlined,
} from '@ant-design/icons'

const { Sider, Header, Content, Footer } = Layout
const { Text } = Typography

/* ── Navigation items ─────────────────────────────────── */
const NAV_ITEMS = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Tableau de bord',
  },
  {
    key: 'grp-ops',
    label: 'Opérations',
    type: 'group',
    children: [
      { key: '/flotte',     icon: <CarOutlined />,      label: 'Flotte & Navires'   },
      { key: '/voyages',    icon: <CompassOutlined />,   label: 'Voyages & Escales'  },
      { key: '/cargaisons', icon: <InboxOutlined />,     label: 'Cargaisons & Fret'  },
    ],
  },
  {
    key: 'grp-com',
    label: 'Commercial & RH',
    type: 'group',
    children: [
      { key: '/clients',    icon: <TeamOutlined />,      label: 'Clients'            },
      { key: '/employes',   icon: <UserOutlined />,      label: 'RH & Employés'      },
      { key: '/documents',  icon: <FileTextOutlined />,  label: 'Documents'          },
    ],
  },
  {
    key: 'grp-adm',
    label: 'Administration',
    type: 'group',
    children: [
      { key: '/finances',   icon: <DollarOutlined />,    label: 'Finances'           },
      { key: '/rapports',   icon: <BarChartOutlined />,  label: 'Rapports & Stats'   },
      { key: '/parametres', icon: <SettingOutlined />,   label: 'Paramètres & Accès' },
    ],
  },
]

/* ── User dropdown ────────────────────────────────────── */
const userMenu = {
  items: [
    { key: 'profile', label: 'Mon profil' },
    { type: 'divider' },
    { key: 'logout', label: 'Déconnexion', danger: true },
  ],
}

/* ── Component ────────────────────────────────────────── */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        collapsedWidth={64}
      >
        {/* Logo */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 20px' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10,
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚓</span>
          {!collapsed && (
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
              Maritime Admin
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8, border: 'none' }}
        />
      </Sider>

      {/* ── Main ── */}
      <Layout>

        {/* Header */}
        <Header style={{
          background: '#fff',
          padding: '0 20px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, color: '#555' }}
          />

          <Space size={20}>
            <Badge count={3} size="small" offset={[-2, 2]}>
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#555' }} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: '#0F6E56', fontWeight: 600 }}>AD</Avatar>
                {!collapsed && <Text style={{ fontSize: 13 }}>Admin</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center', color: '#aaa', fontSize: 12, padding: '12px 24px' }}>
          Maritime Admin — Template v0.1 · Connecter le backend après analyse terrain
        </Footer>
      </Layout>
    </Layout>
  )
}
