import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { NAV_ITEMS } from '@/utils/permissions';

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  const title = match?.label ?? 'Module';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          This module is part of a later delivery phase.
        </p>
      </div>
      <Card title="Coming soon">
        <p className="text-sm text-slate-600">
          The {title} module will be implemented in an upcoming phase per
          the technical specification. Navigation and access control are
          already wired up.
        </p>
      </Card>
    </div>
  );
}
