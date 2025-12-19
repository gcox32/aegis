import { notFound } from 'next/navigation';
import { getProtocolById, getPhases } from '@/lib/db/crud/train';
import ProtocolForm from '@/components/train/build/protocols/ProtocolForm';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProtocolPage({ params }: PageProps) {
  const { id } = await params;
  const protocol = await getProtocolById(id);

  if (!protocol) {
    notFound();
  }

  // Fetch phases for this protocol
  const phases = await getPhases(id);

  return (
    <PageLayout
      breadcrumbHref="/train/build/protocols"
      breadcrumbText="Protocols"
      title="Edit Protocol"
    >
      <ProtocolForm 
        initialData={protocol} 
        initialPhases={phases}
        isEditing />
    </PageLayout>
  );
}

