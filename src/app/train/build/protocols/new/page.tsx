import ProtocolForm from '@/components/train/build/protocols/ProtocolForm';
import PageLayout from '@/components/layout/PageLayout';

export default function NewProtocolPage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build/protocols"
      breadcrumbText="Protocols"
      title="Create New Protocol"
      subtitle="Define a training protocol and assign workouts."
    >
      <ProtocolForm />
    </PageLayout>
  );
}
