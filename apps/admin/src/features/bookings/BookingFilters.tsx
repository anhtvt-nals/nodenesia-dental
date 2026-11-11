import { Button, Select, Space, Typography } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ClinicDoctor } from '../../api/admin-api';
import { statusText, tr, useAdminTranslation } from '../../i18n';
type Props = { doctors: ClinicDoctor[]; onChange: (filter: { doctorId?: string; status?: string }) => void };
export function BookingFilters({ doctors, onChange }: Props) {
  useAdminTranslation();
  const [filter, setFilter] = useState<{ doctorId?: string; status?: string }>({});
  function change(next: Partial<typeof filter>) { const value = { ...filter, ...next }; setFilter(value); onChange(value); }
  function reset() { setFilter({}); onChange({}); }
  return <div className="filter-toolbar"><Space className="filter-toolbar__fields" wrap><Typography.Text className="filter-toolbar__label"><FilterOutlined /> {tr('Filter', 'Filter')}</Typography.Text><Select aria-label={tr('Filter dokter', 'Filter doctors')} placeholder={tr('Semua dokter', 'All doctors')} value={filter.doctorId} allowClear style={{ minWidth: 210 }} options={doctors.map((doctor) => ({ value: doctor.id, label: doctor.name }))} onChange={(doctorId) => change({ doctorId })} /><Select aria-label={tr('Filter status', 'Filter status')} placeholder={tr('Semua status', 'All statuses')} value={filter.status} allowClear style={{ minWidth: 190 }} options={['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((value) => ({ value, label: statusText(value) }))} onChange={(status) => change({ status })} /></Space>{(filter.doctorId || filter.status) && <Button type="text" icon={<ReloadOutlined />} onClick={reset}>{tr('Reset', 'Reset')}</Button>}</div>;
}
