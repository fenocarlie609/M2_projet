import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function Cargo() {
  return (
    <PagePlaceholder
      title="Cargaisons & Fret"
      icon="📦"
      description="Gestion des cargaisons, manifestes de fret, types de marchandises et suivi de chargement par voyage."
      modules={['Manifeste', 'Types de fret', 'Poids & volumes', 'Chargement / déchargement', 'Réservations']}
    />
  )
}
