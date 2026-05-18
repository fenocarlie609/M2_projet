import { Table, Tag, Card, Typography, Space, Button, Avatar } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { mockEmployes } from '../../data/mock'

const { Title, Text } = Typography

const statutColor = {
  'En mission': 'processing',
  'Au port':    'default',
  'Bureau':     'success',
  'Congé':      'warning',
}

const columns = [
  {
    title: 'Employé', key: 'employe',
    render: (_, r) => (
      <Space>
        <Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />
        <Text strong>{r.nom}</Text>
      </Space>
    ),
  },
  { title: 'Poste',       dataIndex: 'poste',       key: 'poste' },
  { title: 'Département', dataIndex: 'departement', key: 'dept'  },
  {
    title: 'Statut', dataIndex: 'statut', key: 'statut',
    render: (v) => <Tag color={statutColor[v] || 'default'}>{v}</Tag>,
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

export default function HR() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>RH & Employés</Title>
        <Button type="primary" icon={<PlusOutlined />}>Ajouter un employé</Button>
      </Space>

      <Card>
        <Table
          dataSource={mockEmployes}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  )
}
