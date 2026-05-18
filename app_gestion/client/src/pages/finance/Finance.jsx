import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function Finance() {
  return (
    <PagePlaceholder
      title="Finances"
      icon="💰"
      description="Facturation clients, suivi des paiements, dépenses opérationnelles (carburant, port, maintenance) et trésorerie."
      modules={['Factures', 'Paiements reçus', 'Dépenses', 'Frais portuaires', 'Trésorerie']}
    />
  )
}
