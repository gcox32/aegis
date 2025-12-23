
import PageLayout from '@/components/layout/PageLayout';

export default function TrainingMethodsPage() {
  return (
    <PageLayout
      breadcrumbHref="/methods"
      breadcrumbText="Methods"
      title="Training Methods"
      subtitle="Quantifying performance through physics and data."
    >
      <div className="md:max-w-4xl md:mx-auto pb-12">
        <section className="px-4 md:px-6 py-6 space-y-8">
          
          {/* Volume */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Volume</h2>
            <p className="text-muted-foreground leading-relaxed">
              Training volume is a primary driver of hypertrophy and a key metric for monitoring workload. We calculate volume simply as:
            </p>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm text-brand-primary">
              Volume = Sets × Reps × Load
            </div>
            <p className="text-muted-foreground text-sm">
              Note: For bodyweight exercises, we can optionally include bodyweight in this calculation to better reflect total systemic load.
            </p>
          </div>

          {/* Work & Power */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Work & Power</h2>
            <p className="text-muted-foreground leading-relaxed">
              To move beyond simple volume, we apply basic physics to estimate the actual mechanical work performed and the power output of your sessions.
            </p>
            
            <h3 className="text-lg font-medium text-white pt-2">Work</h3>
            <p className="text-muted-foreground leading-relaxed">
              Work is force applied over a distance. By assigning a distance component to exercises (e.g., the range of motion of a squat or bench press), we can estimate work:
            </p>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm text-brand-primary">
              Work (Joules) = Force (Newtons) × Distance (Meters) × Reps
            </div>

            <h3 className="text-lg font-medium text-white pt-2">Power</h3>
            <p className="text-muted-foreground leading-relaxed">
              Power is the rate at which work is performed. This gives us insight into the intensity and density of a session.
            </p>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm text-brand-primary">
              Power (Watts) = Work (Joules) / Time (Seconds)
            </div>
          </div>

          {/* Projected 1RM */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Projected 1RM</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the Epley formula to estimate your one-repetition maximum (1RM) based on submaximal sets. This allows us to track strength gains without testing a true max every session.
            </p>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm text-brand-primary">
              1RM = Load × (1 + (Reps / 30))
            </div>
            <p className="text-muted-foreground text-sm">
              This formula is most accurate for rep ranges between 1 and 10.
            </p>
          </div>

        </section>
      </div>
    </PageLayout>
  );
}

