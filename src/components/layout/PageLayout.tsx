import React from 'react';
import BackToLink from '@/components/layout/navigation/BackToLink';

interface PageLayoutProps {
  breadcrumbHref?: string;
  breadcrumbText?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageLayout({ 
  breadcrumbHref, 
  breadcrumbText, 
  title, 
  subtitle,
  children,
}: PageLayoutProps) {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl pb-16">
      {breadcrumbHref && breadcrumbText && (
        <BackToLink href={breadcrumbHref} pageName={breadcrumbText} />
      )}
      
      {title && <h2 className="font-bold text-2xl my-2">{title}</h2>}

      {subtitle && <p className="text-muted-foreground text-sm mb-4">{subtitle}</p>}

      {children}
    </div>
  );
}
