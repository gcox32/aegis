import ProtocolList from '@/components/train/build/protocols/ProtocolList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function ProtocolsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <BackToLink href="/train/build" pageName="Build" />
      <ProtocolList />
    </div>
  );
}
