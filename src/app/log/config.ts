import { Activity, Camera, Dumbbell, Goal, Timer, PieChart } from 'lucide-react';

export const logViews = [
    {
        name: 'Body stats',
        href: '/log/stats',
        icon: Activity,
        description: 'Weight, body fat, and tape measurements.',
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
        active: false,
    },
    {
        name: 'Macros',
        href: '/log/fuel',
        icon: PieChart,
        description: 'Coming soon.',
        active: false,
    },
    {
        name: 'Progress photos',
        href: '/log/photos',
        icon: Camera,
        description: 'Coming soon.',
        active: false,
    },

]