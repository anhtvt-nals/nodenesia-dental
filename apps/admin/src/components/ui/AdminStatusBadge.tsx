import type { ReactNode } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { statusText, tr } from '../../i18n';

export type BookingStatusType =
  | 'pending'
  | 'confirmed'
  | 'arrived'
  | 'in_chair'
  | 'completed'
  | 'cancelled'
  | 'no_show';

const statusConfig: Record<
  BookingStatusType,
  { className: string; icon: ReactNode }
> = {
  pending: { className: 'admin-badge--pending', icon: <ClockCircleOutlined aria-hidden="true" /> },
  confirmed: { className: 'admin-badge--confirmed', icon: <CheckCircleOutlined aria-hidden="true" /> },
  arrived: { className: 'admin-badge--arrived', icon: <UserOutlined aria-hidden="true" /> },
  in_chair: { className: 'admin-badge--in-chair', icon: <MedicineBoxOutlined aria-hidden="true" /> },
  completed: { className: 'admin-badge--completed', icon: <CheckCircleOutlined aria-hidden="true" /> },
  cancelled: { className: 'admin-badge--cancelled', icon: <StopOutlined aria-hidden="true" /> },
  no_show: { className: 'admin-badge--no-show', icon: <CloseCircleOutlined aria-hidden="true" /> },
};

export function AdminStatusBadge({
  status,
  overdueLabel,
}: {
  status: BookingStatusType | string;
  overdueLabel?: string;
}) {
  const cfg = statusConfig[status as BookingStatusType] ?? {
    className: 'admin-badge--cancelled',
    icon: <ExclamationCircleOutlined aria-hidden="true" />,
  };

  return (
    <span className="admin-badge-group">
      <span className={`admin-badge ${cfg.className}`}>
        {cfg.icon}
        <span>{statusText(status)}</span>
      </span>
      {overdueLabel && (
        <span className="admin-badge admin-badge--danger">
          <ExclamationCircleOutlined aria-hidden="true" />
          <span>{overdueLabel}</span>
        </span>
      )}
    </span>
  );
}

export function AdminAlertBadge({ label, title }: { label?: string; title?: string }) {
  return (
    <span className="admin-badge admin-badge--danger" title={title}>
      <ExclamationCircleOutlined aria-hidden="true" />
      <span>{label ?? tr('Peringatan Medis', 'Medical Alert')}</span>
    </span>
  );
}
