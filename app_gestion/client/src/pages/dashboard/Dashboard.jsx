import { Row, Col, Card, Table, Badge, Tag, Alert, Typography, Statistic, Space } from 'antd'
import {
  ArrowUpOutlined, WarningOutlined,
  CarOutlined, CompassOutlined, InboxOutlined, DollarOutlined,
} from '@ant-design/icons'
import { mockStats, mockVoyages, mockAlerts } from '../../data/mock'

const { Title, Text } = Typography

/* ── Couleur par statut voyage ── */
const statutColor = {
  'En cours':  'processing',
  'Retard':    'error',
  'Planifié':  'warning',
  'Terminé':   'success',
}

/* ── Colonnes tableau voyages ── */
const columns = [
  { title: 'N°',         dataIndex: 'id',         key: 'id',         width: 120, render: (v) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
  { title: 'Navire',     dataIndex: 'navire',      key: 'navire',     render: (v) => <Text strong>{v}</Text> },
  { title: 'Trajet',     key: 'trajet',            render: (_, r) => <Text>{r.depart} → {r.destination}</Text> },
  { title: 'Arrivée',    dataIndex: 'arriveePrevisionnelle', key: 'arrivee' },
  { title: 'Fret',       dataIndex: 'fret',        key: 'fret',       render: (v) => <Text type="secondary">{v}</Text> },
  {
    title: 'Statut', dataIndex: 'statut', key: 'statut',
    render: (v) => <Badge status={statutColor[v]} text={v} />,
  },
]

export default function Dashboard() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      <Title level={4} style={{ margin: 0 }}>Tableau de bord</Title>

      {/* KPI Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Navires en mer"
              value={mockStats.naviresEnMer}
              suffix={`/ ${mockStats.naviresTotal}`}
              prefix={<CarOutlined style={{ color: '#0F6E56' }} />}
              valueStyle={{ color: '#0F6E56' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {mockStats.naviresTotal - mockStats.naviresEnMer} au port
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Voyages en cours"
              value={mockStats.voyagesEnCours}
              prefix={<CompassOutlined style={{ color: '#0F6E56' }} />}
              valueStyle={{ color: '#0F6E56' }}
            />
            <Text type="danger" style={{ fontSize: 12 }}>
              <WarningOutlined /> {mockStats.voyagesEnRetard} en retard
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tonnage ce mois"
              value={mockStats.tonnageMois}
              suffix="T"
              prefix={<InboxOutlined style={{ color: '#0F6E56' }} />}
              valueStyle={{ color: '#0F6E56' }}
            />
            <Text type="success" style={{ fontSize: 12 }}>
              <ArrowUpOutlined /> +8% vs mois dernier
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CA du mois"
              value={mockStats.caMois / 1000000}
              precision={1}
              suffix="M Ar"
              prefix={<DollarOutlined style={{ color: '#0F6E56' }} />}
              valueStyle={{ color: '#0F6E56' }}
            />
            <Text type="success" style={{ fontSize: 12 }}>
              <ArrowUpOutlined /> +12% vs objectif
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Voyages + Alertes */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Voyages récents" extra={<Tag color="blue">{mockVoyages.length} voyages</Tag>}>
            <Table
              dataSource={mockVoyages}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>

            {/* Alertes */}
            <Card
              title={
                <Space>
                  Alertes
                  <Badge count={mockAlerts.length} style={{ background: '#ff4d4f' }} />
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {mockAlerts.map((a) => (
                  <Alert
                    key={a.id}
                    type={a.type}
                    message={a.titre}
                    description={a.detail}
                    showIcon
                  />
                ))}
              </Space>
            </Card>

            {/* Indicateurs opérationnels */}
            <Card title="Indicateurs clés">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Text type="secondary">Ponctualité</Text>
                  <Text strong style={{ color: '#52c41a' }}>{mockStats.ponctualite}%</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Taux de remplissage</Text>
                  <Text strong>{mockStats.tauxRemplissage}%</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Clients actifs</Text>
                  <Text strong>{mockStats.clientsActifs}</Text>
                </Row>
              </Space>
            </Card>

          </Space>
        </Col>
      </Row>

    </Space>
  )
}
