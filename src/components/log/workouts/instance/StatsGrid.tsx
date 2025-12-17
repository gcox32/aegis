import type { WorkoutInstance } from "@/types/train";

export default function StatsGrid({ instance }: { instance: WorkoutInstance }) {
    function formatNumber(num: number, digits: number) {
        return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    return (
        <div className="gap-4 grid grid-cols-2 md:grid-cols-4 mb-8">
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="text-muted-foreground text-sm">Duration</div>
                <div className="font-bold text-xl">{instance.duration ? `${instance.duration.value} ${instance.duration.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="text-muted-foreground text-sm">Volume</div>
                <div className="font-bold text-xl">{instance.volume ? `${formatNumber(instance.volume.value, 1)} ${instance.volume.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="text-muted-foreground text-sm">Avg Power</div>
                <div className="font-bold text-xl">{instance.averagePower ? `${formatNumber(instance.averagePower.value, 2)} ${instance.averagePower.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="text-muted-foreground text-sm">Work</div>
                <div className="font-bold text-xl">{instance.work ? `${formatNumber(instance.work.value, 1)} ${instance.work.unit}` : '-'}</div>
            </div>
        </div>
    );
}