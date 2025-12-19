import ProtocolList from '@/components/train/build/protocols/ProtocolList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function ProtocolsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <BackToLink href="/train/build" pageName="Build" />
      <h2 className="font-bold text-2xl my-4">Protocols</h2>
      <ProtocolList />
    </div>
  );
}
