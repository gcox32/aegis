import { notFound } from 'next/navigation';
import { getUserMealInstances } from '@/lib/db/crud/fuel';
import { getCurrentUserId } from '@/lib/db/auth';
import MealInstanceForm from '@/components/fuel/MealInstanceForm';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
  params: Promise<{ instanceId: string }>;
}

export default async function EditMealInstancePage({ params }: PageProps) {
  const { instanceId } = await params;
  const userId = await getCurrentUserId();
  
  const instances = await getUserMealInstances(userId, {});
  const instance = instances.find(i => i.id === instanceId);

  if (!instance) {
    notFound();
  }

  return (
    <PageLayout
      breadcrumbHref="/fuel"
      breadcrumbText="Fuel"
      title="Edit Meal Instance"
    >
      <MealInstanceForm initialData={instance} />
    </PageLayout>
  );
}

