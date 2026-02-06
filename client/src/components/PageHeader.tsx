import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-lg">
          {description}
        </p>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
