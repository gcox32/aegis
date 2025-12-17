import { Dumbbell, ForkKnife, Home, User, NotebookPen } from "lucide-react";

export const navItems = [
    { name: 'Today', href: '/', icon: Home, className: 'rounded-l-4xl' },
    { name: 'Train', href: '/train', icon: Dumbbell, className: '' },
    { name: 'Fuel', href: '/fuel', icon: ForkKnife, className: '' },
    { name: 'Log', href: '/log', icon: NotebookPen, className: '' },
    { name: 'Me', href: '/me', icon: User, className: 'rounded-r-4xl' },
  ];