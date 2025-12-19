import ProtocolForm from '@/components/train/build/protocols/ProtocolForm';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function NewProtocolPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BackToLink href="/train/build/protocols" pageName="Protocols" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-300">Create New Protocol</h1>
        <p className="mt-2 text-gray-600">Define a training protocol and assign workouts.</p>
      </div>
      <ProtocolForm />
    </div>
  );
}

