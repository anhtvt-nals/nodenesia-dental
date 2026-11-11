import { Card, Col, Row } from 'antd';
import type { AuditLog, NotificationLog } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
import { AuditLogList } from '../audit-logs/AuditLogList';
import { NotificationLogList } from '../notifications/NotificationLogList';
import { ReportsPanel } from '../reports/ReportsPanel';

type Props = { accessToken: string; logs: NotificationLog[]; auditLogs: AuditLog[]; onResent: () => void; onError: (message: string) => void };

export function OperationsPanel({ accessToken, logs, auditLogs, onResent, onError }: Props) {
  useAdminTranslation();
  return <section className="operations-page" aria-label={tr('Operasional', 'Operations')}>
    <Row gutter={[20, 20]}>
      <Col xs={24} xl={14}><Card className="operations-card" title={<CardTitle title={tr('Notifikasi', 'Notifications')} description={tr('Pantau dan kirim ulang komunikasi pasien.', 'Monitor and resend patient communications.')} />}><NotificationLogList accessToken={accessToken} logs={logs} onResent={onResent} onError={onError} /></Card></Col>
      <Col xs={24} xl={10}><Card className="operations-card" title={<CardTitle title={tr('Aktivitas admin', 'Admin activity')} description={tr('Riwayat perubahan penting pada sistem.', 'History of important system changes.')} />}><AuditLogList logs={auditLogs} /></Card></Col>
      <Col xs={24}><Card className="operations-card operations-card--report" title={<CardTitle title={tr('Laporan janji temu', 'Appointment reports')} description={tr('Tinjau performa layanan dan ekspor data.', 'Review service performance and export data.')} />}><ReportsPanel accessToken={accessToken} onError={onError} /></Card></Col>
    </Row>
  </section>;
}

function CardTitle({ title, description }: { title: string; description: string }) {
  return <div className="operations-card__title"><span>{title}</span><small>{description}</small></div>;
}
