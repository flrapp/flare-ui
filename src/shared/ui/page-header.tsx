import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BackLink {
  href: string;
  label: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backLink?: BackLink;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backLink, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {backLink && (
            <Link
              to={backLink.href}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLink.label}
            </Link>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
