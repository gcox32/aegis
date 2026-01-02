import { Activity, Camera, Dumbbell, Goal, Timer, PieChart, Moon } from 'lucide-react';

export const logViews = [
    {
        name: 'Body stats',
        href: '/log/stats',
        icon: Activity,
        description: 'Track physical measurements.',
        active: true,
    },
    {
        name: 'Workouts',
        href: '/log/workouts',
        icon: Dumbbell,
        description: 'Review your workouts.',
        active: true,
    },
    {
        name: 'Performance',
        href: '/log/performance',
        icon: Timer,
        description: `Confirm you're getting better.`,
        active: true,
    },
    {
        name: 'Macros',
        href: '/log/macros',
        icon: PieChart,
        description: 'Gauge your adherence.',
        active: true,
    },
    {
        name: 'Sleep',
        href: '/log/sleep',
        icon: Moon,
        description: 'Check your sleep.',
        active: true,
    },
    {
        name: 'Progress photos',
        href: '/log/photos',
        icon: Camera,
        description: 'Coming soon.',
        active: false,
    },

]