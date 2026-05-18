import { Table, Tag, Card, Typography, Space, Button, Avatar } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { mockClients } from '../../data/mock'

const { Title, Text } = Typography

const columns = [
  {
    title: 'Client', key: 'client',
    render: (_, r) => (
      <Space>
        <Avatar icon={<UserOutlined />} style={{ background: '#0F6E56' }} />
        <div>
          <Text strong>{r.nom}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.contact}</Text>
        </div>
      </Space>
    ),
  },
  { title: 'Email',     dataIndex: 'email',      key: 'email' },
  { title: 'Téléphone', dataIndex: 'telephone',  key: 'tel'   },
  { title: 'Ville',     dataIndex: 'ville',      key: 'ville' },
  { title: 'Voyages',   dataIndex: 'voyagesTotal',key: 'voyages', render: (v) => <Tag>{v} voyages</Tag> },
  {
    title: 'Statut', dataIndex: 'actif', key: 'actif',
    render: (v) => <Tag color={v ? 'success' : 'default'}>{v ? 'Actif' : 'Inactif'}</Tag>,
  },
  {
    title: 'Actions', key: 'actions',
    render: () => (
      <Space>
        <Button size="small">Voir</Button>
        <Button size="small">Modifier</Button>
      </Space>
    ),
  },
]

export default function Clients() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>Clients</Title>
        <Button type="primary" icon={<PlusOutlined />}>Nouveau client</Button>
      </Space>

      <Card>
        <Table
          dataSource={mockClients}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  )
}
