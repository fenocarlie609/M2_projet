import { Table, Badge, Card, Typography, Space, Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockVoyages } from '../../data/mock'

const { Title, Text } = Typography

const statutColor = {
  'En cours': 'processing',
  'Retard':   'error',
  'Planifié': 'warning',
  'Terminé':  'success',
}

const columns = [
  { title: 'N° Voyage',  dataIndex: 'id',         key: 'id',     render: (v) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
  { title: 'Navire',     dataIndex: 'navire',     key: 'navire', render: (v) => <Text strong>{v}</Text> },
  { title: 'Départ',     dataIndex: 'depart',     key: 'depart' },
  { title: 'Destination',dataIndex: 'destination',key: 'dest'   },
  { title: 'Date départ',dataIndex: 'dateDepart', key: 'datedep'},
  { title: 'ETA',        dataIndex: 'arriveePrevisionnelle', key: 'eta' },
  { title: 'Fret',       dataIndex: 'fret',       key: 'fret',  render: (v) => <Text type="secondary">{v}</Text> },
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

export default function Voyages() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>Voyages & Escales</Title>
        <Button type="primary" icon={<PlusOutlined />}>Nouveau voyage</Button>
      </Space>

      <Card>
        <Table
          dataSource={mockVoyages}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  )
}
