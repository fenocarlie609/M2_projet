import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function Documents() {
  return (
    <PagePlaceholder
      title="Documents"
      icon="📄"
      description="Gestion des connaissements (BL), certificats de navigabilité, manifestes douaniers et documents réglementaires."
      modules={['Connaissement (BL)', 'Certificat de navigabilité', 'Manifeste douane', 'Lettre de fret aérien', 'Archivage']}
    />
  )
}
