'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/shadcn/utils';

const tabs = [
  { label: 'Agent', href: '/' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Unanswered', href: '/unanswered' },
  { label: 'Voices', href: '/voices' },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-border border-b">
      <div className="mx-auto flex max-w-7xl gap-1 px-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'text-muted-foreground hover:text-foreground border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors',
                isActive && 'text-foreground border-primary'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
