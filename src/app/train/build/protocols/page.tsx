import ProtocolList from '@/components/train/build/protocols/ProtocolList';
import PageLayout from '@/components/layout/PageLayout';

export default function ProtocolsPage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build"
      breadcrumbText="Build"
      title="Protocols"
    >
      <ProtocolList />
    </PageLayout>
  );
}
