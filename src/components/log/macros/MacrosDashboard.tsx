'use client';

import TabLayout, { Tab } from "@/components/ui/TabLayout";

export default function MacrosDashboard() {
    const tabs: Tab[] = [
        {
            id: 'adherence',
            label: 'Adherence',
            content: (
                <div>
                    <h2>Adherence</h2>
                </div>
            ),
        },
        {
            id: 'tracking',
            label: 'Tracking',
            content: (
                <div>
                    <h2>Tracking</h2>
                </div>
            ),
        },
    ];

    return <TabLayout tabs={tabs} defaultTab="adherence" />;
}