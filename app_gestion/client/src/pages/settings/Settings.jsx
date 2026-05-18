import { Card, Typography, Space, Table, Tag, Button, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/* Utilisateurs mock pour la démo */
const mockUsers = [
  { id: 1, nom: 'Admin Principal',  email: 'admin@maritime.mg',   role: 'admin',   actif: true },
  { id: 2, nom: 'Manager Ops',      email: 'ops@maritime.mg',     role: 'manager', actif: true },
  { id: 3, nom: 'Agent Commercial', email: 'agent@maritime.mg',   role: 'employe', actif: true },
  { id: 4, nom: 'Comptable',        email: 'compta@maritime.mg',  role: 'employe', actif: false },
]

const roleColor = { admin: 'red', manager: 'blue', employe: 'default' }
const roleLabel = { admin: 'Administrateur', manager: 'Manager', employe: 'Employé' }

const columns = [
  { title: 'Nom',    dataIndex: 'nom',   key: 'nom',   render: (v) => <Text strong>{v}</Text> },
  { title: 'Email',  dataIndex: 'email', key: 'email' },
  {
    title: 'Rôle', dataIndex: 'role', key: 'role',
    render: (v) => <Tag color={roleColor[v]}>{roleLabel[v]}</Tag>,
  },
  {
    title: 'Statut', dataIndex: 'actif', key: 'actif',
    render: (v) => <Tag color={v ? 'success' : 'default'}>{v ? 'Actif' : 'Désactivé'}</Tag>,
  },
  {
    title: 'Actions', key: 'actions',
    render: () => (
      <Space>
        <Button size="small">Modifier</Button>
        <Button size="small" danger>Désactiver</Button>
      </Space>
    ),
  },
]

export default function Settings() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>Paramètres & Accès</Title>

      {/* Gestion utilisateurs */}
      <Card
        title="Utilisateurs & Rôles"
        extra={<Button type="primary" icon={<PlusOutlined />} size="small">Nouvel utilisateur</Button>}
      >
        <Table
          dataSource={mockUsers}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Infos entreprise placeholder */}
      <Card title="Informations entreprise">
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '32px 0' }}>
          <span style={{ fontSize: 40 }}>🏢</span>
          <Text type="secondary">
            Nom, adresse, logo, coordonnées — à compléter après analyse terrain
          </Text>
          <Tag color="orange" style={{ marginTop: 12 }}>À configurer — Juin 2025</Tag>
        </Space>
      </Card>
    </Space>
  )
}
