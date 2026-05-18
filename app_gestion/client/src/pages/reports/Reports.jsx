import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function Reports() {
  return (
    <PagePlaceholder
      title="Rapports & Statistiques"
      icon="📊"
      description="Tableaux de bord analytiques, rapports d'activité mensuelle, export Excel/PDF et indicateurs de performance."
      modules={['Rapport mensuel', 'Stats par navire', 'Stats clients', 'Export PDF', 'Export Excel']}
    />
  )
}
