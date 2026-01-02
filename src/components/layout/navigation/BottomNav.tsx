'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './config';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="right-2 bottom-2 left-2 z-20 fixed animate-slide-in-bottom">
      {/* Glass container with enhanced styling */}
      <div className="relative bg-black/10 shadow-2xl shadow-black/40 backdrop-blur-2xl border border-white/10 rounded-4xl ring-1 ring-white/5 ring-inset">
        {/* Subtle top highlight */}
        <div className="top-0 absolute inset-x-0 bg-linear-to-r from-transparent via-white/20 to-transparent rounded-full h-px" />

        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative cursor-pointer flex flex-col items-center justify-center flex-1 h-full
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${item.className}
                  ${isActive
                    ? 'text-brand-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                  group
                `}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="bg-brand-primary/10 blur-xl rounded-full w-12 h-12" />
                  </div>
                )}

                {/* Icon with scale animation */}
                <span className={`
                  relative mb-1 text-2xl
                  transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  group-hover:scale-110 group-active:scale-95
                  ${isActive ? 'scale-110' : ''}
                `}>
                  <item.icon className="w-6 h-6" />
                </span>

                {/* Label */}
                <span className={`
                  hidden md:block font-medium text-xs
                  transition-opacity duration-200
                  ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
                `}>
                  {item.name}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <div className="bottom-2 absolute bg-brand-primary shadow-brand-primary/50 shadow-sm rounded-full w-1 h-1" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

