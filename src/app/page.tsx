import TodaySessions from "@/components/today/TodaySessions";
import PageLayout from '@/components/layout/PageLayout';

export default function Today() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <PageLayout
      title="Today"
      subtitle={dateString}    >
        {/* Today's Sessions */}
        <section className="px-4 md:px-6 py-6">
          <TodaySessions />
        </section>
    </PageLayout>
  );
}
