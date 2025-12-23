
import PageLayout from '@/components/layout/PageLayout';

export default function BodyCompMethodsPage() {
  return (
    <PageLayout
      breadcrumbHref="/methods"
      breadcrumbText="Methods"
      title="Body Composition"
      subtitle="Estimating metrics through non-invasive measurements."
    >
      <div className="md:max-w-4xl md:mx-auto pb-12">
        <section className="px-4 md:px-6 py-6 space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Body Fat Estimation</h2>
            <p className="text-muted-foreground leading-relaxed">
              While DEXA scans and hydrostatic weighing are the gold standards, they are not practical for frequent tracking. We utilize the <strong>U.S. Navy Body Fat Formula</strong>, which estimates body fat percentage using simple tape measurements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This method balances accessibility with reasonable accuracy for tracking trends over time.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Required Measurements</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><strong className="text-white">Height:</strong> Measured without shoes.</li>
              <li><strong className="text-white">Neck:</strong> Circumference just below the larynx (Adam's apple).</li>
              <li><strong className="text-white">Waist (Men):</strong> Circumference at the navel.</li>
              <li><strong className="text-white">Waist (Women):</strong> Circumference at the narrowest point.</li>
              <li><strong className="text-white">Hips (Women):</strong> Circumference at the widest point.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">The Formula</h3>
            <p className="text-muted-foreground text-sm">
              The calculations involve logarithmic equations derived from large population samples.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-1">For Men:</h4>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs md:text-sm text-brand-primary overflow-x-auto">
                  %BF = 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-1">For Women:</h4>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs md:text-sm text-brand-primary overflow-x-auto">
                  %BF = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm italic mt-4">
              *All measurements in the formulas above are typically calculated in centimeters.
            </p>
          </div>

        </section>
      </div>
    </PageLayout>
  );
}

