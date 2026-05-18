import { Card, Typography, Space, Tag } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * Placeholder générique pour les modules en attente d'analyse terrain.
 * Remplacer par le vrai composant une fois les besoins connus.
 */
export default function PagePlaceholder({ title, icon, description, modules = [] }) {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>{title}</Title>

      <Card>
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '48px 0' }}>
          <span style={{ fontSize: 48 }}>{icon}</span>
          <Title level={5} style={{ margin: '16px 0 8px' }}>{title}</Title>
          <Text type="secondary" style={{ textAlign: 'center', maxWidth: 400 }}>
            {description}
          </Text>

          {modules.length > 0 && (
            <Space wrap style={{ marginTop: 24, justifyContent: 'center' }}>
              {modules.map((m) => (
                <Tag key={m} icon={<ClockCircleOutlined />} color="default">{m}</Tag>
              ))}
            </Space>
          )}

          <Tag color="orange" style={{ marginTop: 24 }}>
            À construire après analyse terrain — Juin 2025
          </Tag>
        </Space>
      </Card>
    </Space>
  )
}
