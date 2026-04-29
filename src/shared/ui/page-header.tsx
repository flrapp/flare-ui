import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-2">
          {backTo && (
            <Link
              to={backTo}
              className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
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
