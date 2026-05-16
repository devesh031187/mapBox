import { useAuthStore } from '@/store/authStore';
import { USER_ROLE_LABELS } from '@/types/enums';
import { Card } from '@/components/ui/Card';

interface Kpi {
  label: string;
  value: string;
  hint: string;
}

const KPI_PLACEHOLDERS: Kpi[] = [
  { label: 'Open Requisitions', value: '—', hint: 'Awaiting action' },
  { label: 'Pending Approvals', value: '—', hint: 'In your inbox' },
  { label: 'Low Stock Items', value: '—', hint: 'Below par level' },
  { label: 'Active Vendors', value: '—', hint: 'Approved suppliers' },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back{user ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {user
            ? `Signed in as ${USER_ROLE_LABELS[user.role]}. Your role-specific dashboard will appear here.`
            : 'Loading your workspace.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_PLACEHOLDERS.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
          </Card>
        ))}
      </div>

      <Card
        title="Coming soon"
        subtitle="Role-specific KPIs, charts and activity feed"
      >
        <p className="text-sm text-slate-600">
          Detailed analytics, reorder lists, approval queues and spend
          tracking will be delivered in later phases per the technical
          specification.
        </p>
      </Card>
    </div>
  );
}
