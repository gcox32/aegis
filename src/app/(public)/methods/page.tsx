
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

export default function MethodsPage() {
  return (
    <PageLayout
      breadcrumbHref="/"
      breadcrumbText="Home"
      title="Methods"
      subtitle="The philosophy and the math behind the app."
    >
      <div className="md:max-w-4xl md:mx-auto pb-12">
        <section className="px-4 md:px-6 py-6 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Our Ethos</h2>
            <p className="text-muted-foreground leading-relaxed">
              This app is not a rigid protocol in itself, but a comprehensive toolset for building your own Protocols and Workouts. It is designed to meticulously track the components of your physical goals—whether they be strength, hypertrophy, or conditioning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our focus is on better tracking and higher-quality feedback. By quantifying volume, work capacity, and estimated power output, we provide a clear, data-driven picture of your adaptation over time, allowing you to truly gauge your progress beyond simple aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/methods/training"
              className="group block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-primary/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors mb-2">
                Training Methods
              </h3>
              <p className="text-sm text-zinc-400">
                Deep dive into how we calculate volume, work, power, and project 1-rep maximums to quantify your effort.
              </p>
            </Link>

            <Link 
              href="/methods/body-comp"
              className="group block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-primary/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors mb-2">
                Body Composition
              </h3>
              <p className="text-sm text-zinc-400">
                Understand our approach to estimating body fat percentage using tape measurements and other non-invasive metrics.
              </p>
            </Link>
          </div>

        </section>
      </div>
    </PageLayout>
  );
}

