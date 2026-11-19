import { BarChartOutlined, BellOutlined, HistoryOutlined } from '@ant-design/icons';
import { Card, Tabs, type TabsProps } from 'antd';
import type { AuditLog, NotificationLog, ServerPagination } from '../../api/admin-api';
import { AdminPageHeader } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';
import { AuditLogList } from '../audit-logs/AuditLogList';
import { NotificationLogList } from '../notifications/NotificationLogList';
import { ReportsPanel } from '../reports/ReportsPanel';

type Props = {
  accessToken: string;
  logs: NotificationLog[];
  auditLogs: AuditLog[];
  onResent: () => void;
  onError: (message: string) => void;
  notificationsPagination?: ServerPagination;
  auditPagination?: ServerPagination;
};

export function OperationsPanel({ accessToken, logs, auditLogs, onResent, onError, notificationsPagination, auditPagination }: Props) {
  useAdminTranslation();
  const tabs: TabsProps['items'] = [
    {
      key: 'notifications',
      label: <TabLabel icon={<BellOutlined />} label={tr('Notifikasi', 'Notifications')} count={notificationsPagination?.total ?? logs.length} />,
      children: (
        <OperationsCard
          title={tr('Notifikasi', 'Notifications')}
          description={tr('Pantau status dan kirim ulang komunikasi pasien.', 'Monitor delivery status and resend patient communications.')}
        >
          <NotificationLogList accessToken={accessToken} logs={logs} onResent={onResent} onError={onError} pagination={notificationsPagination} />
        </OperationsCard>
      ),
    },
    {
      key: 'audit',
      label: <TabLabel icon={<HistoryOutlined />} label={tr('Aktivitas', 'Activity')} count={auditPagination?.total ?? auditLogs.length} />,
      children: (
        <OperationsCard
          title={tr('Aktivitas admin', 'Admin activity')}
          description={tr('Tinjau riwayat perubahan penting pada sistem.', 'Review the history of important system changes.')}
        >
          <AuditLogList logs={auditLogs} pagination={auditPagination} />
        </OperationsCard>
      ),
    },
    {
      key: 'reports',
      label: <TabLabel icon={<BarChartOutlined />} label={tr('Laporan', 'Reports')} />,
      children: (
        <OperationsCard
          title={tr('Laporan janji temu', 'Appointment reports')}
          description={tr('Tinjau performa layanan dan ekspor data.', 'Review service performance and export data.')}
          report
        >
          <ReportsPanel accessToken={accessToken} onError={onError} />
        </OperationsCard>
      ),
    },
  ];

  return (
    <section className="operations-page" aria-label={tr('Operasional', 'Operations')}>
      <AdminPageHeader
        title={tr('Operasional & Laporan', 'Operations & Reports')}
        description={tr(
          'Pantau notifikasi WhatsApp, riwayat aktivitas admin, dan ringkasan performa janji temu.',
          'Monitor WhatsApp notifications, admin activity logs, and appointment reports.',
        )}
        showTimezone
      />
      <div className="operations-workspace">
        <Tabs defaultActiveKey="notifications" items={tabs} />
      </div>
    </section>
  );
}

function TabLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <span className="operations-tab-label">
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className="operations-tab-count">{count}</span>}
    </span>
  );
}

function OperationsCard({ title, description, report = false, children }: { title: string; description: string; report?: boolean; children: React.ReactNode }) {
  return (
    <Card className={`operations-card${report ? ' operations-card--report' : ''}`} title={<CardTitle title={title} description={description} />}>
      {children}
    </Card>
  );
}

function CardTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="operations-card__title">
      <span>{title}</span>
      <small>{description}</small>
    </div>
  );
}
