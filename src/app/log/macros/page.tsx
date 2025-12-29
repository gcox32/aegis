
import PageLayout from "@/components/layout/PageLayout";
import MacrosDashboard from "@/components/log/macros/MacrosDashboard";

export default function MacrosPage() {

    return (
        <PageLayout
            breadcrumbHref="/log"
            breadcrumbText="Logs"
            title="Macros"
            subtitle="Track your macros"
        >
            <MacrosDashboard />
        </PageLayout>
    );
}