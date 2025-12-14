import React from 'react';
import ProtocolForm from '@/components/train/build/protocols/ProtocolForm';

export default function NewProtocolPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-300">Create New Protocol</h1>
        <p className="mt-2 text-gray-600">Define a training protocol and assign workouts.</p>
      </div>
      <ProtocolForm />
    </div>
  );
}

