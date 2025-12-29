'use client';

import TabLayout, { Tab } from "@/components/ui/TabLayout";

export default function MacrosDashboard() {
    const tabs: Tab[] = [
        {
            id: 'targets',
            label: 'Targets',
            content: (
                <div>
                    <h2>Targets</h2>
                </div>
            ),
        },
        {
            id: 'history',
            label: 'History',
            content: (
                <div>
                    <h2>History</h2>
                </div>
            ),
        },
    ];

    return <TabLayout tabs={tabs} defaultTab="targets" />;
}