import { Table, Tag, Card, Typography, Space, Button, Badge } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockNavires } from '../../data/mock'

const { Title, Text } = Typography

const statutColor = {
  'En mer':   'processing',
  'Au port':  'default',
  'Maintenance': 'warning',
}

const columns = [
  { title: 'Nom du navire', dataIndex: 'nom',               key: 'nom',    render: (v) => <Text strong>{v}</Text> },
  { title: 'Type',          dataIndex: 'type',              key: 'type' },
  { title: 'Capacité',      dataIndex: 'capaciteTonnes',    key: 'cap',    render: (v) => `${v} T`, },
  { title: 'N° IMO',        dataIndex: 'numeroIMO',         key: 'imo',    render: (v) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
  { title: 'Pavillon',      dataIndex: 'pavillon',          key: 'pavillon' },
  { title: 'Prochaine maint.', dataIndex: 'prochaineMaintenance', key: 'maint' },
  {
    title: 'Statut', dataIndex: 'statut', key: 'statut',
    render: (v) => <Badge status={statutColor[v]} text={v} />,
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

export default function Fleet() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>Flotte & Navires</Title>
        <Button type="primary" icon={<PlusOutlined />}>Ajouter un navire</Button>
      </Space>

      <Card>
        <Table
          dataSource={mockNavires}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  )
}
