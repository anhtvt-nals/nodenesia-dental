import { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import type { ClinicDoctor, ClinicService } from '../../api/admin-api';
import { DoctorCreateForm } from './DoctorCreateForm';
import { DoctorList } from './DoctorList';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import { tr, useAdminTranslation } from '../../i18n';
import { AdminHeaderActions } from '../../components/AdminHeaderActions';

type Props = { accessToken: string; doctors: ClinicDoctor[]; services: ClinicService[]; onReload: () => void; onChanged: (doctors: ClinicDoctor[]) => void; onError: (message: string) => void };

export function DoctorsPanel({ accessToken, doctors, services, onReload, onChanged, onError }: Props) {
  useAdminTranslation();
  const [hoursDoctorId, setHoursDoctorId] = useState<string>();
  const [editingDoctor, setEditingDoctor] = useState<ClinicDoctor>();
  const [isCreating, setIsCreating] = useState(false);
  const hoursDoctor = doctors.find((doctor) => doctor.id === hoursDoctorId);
  function replace(next: ClinicDoctor) { onChanged(doctors.map((doctor) => doctor.id === next.id ? next : doctor)); }
  return <section aria-labelledby="doctors-heading"><AdminHeaderActions><Button type="primary" onClick={() => setIsCreating(true)}>{tr('Tambah dokter', 'Add doctor')}</Button></AdminHeaderActions><Space className="section-heading"><Typography.Title level={2} id="doctors-heading">{tr('Dokter', 'Doctors')}</Typography.Title></Space><DoctorList accessToken={accessToken} doctors={doctors} onEdit={setEditingDoctor} onManageHours={setHoursDoctorId} onChanged={replace} onDeleted={onReload} onError={onError} /><WorkingHoursEditor accessToken={accessToken} doctor={hoursDoctor} onClose={() => setHoursDoctorId(undefined)} onChanged={replace} onError={onError} /><DoctorCreateForm accessToken={accessToken} services={services} doctor={editingDoctor} open={isCreating || Boolean(editingDoctor)} onClose={() => { setIsCreating(false); setEditingDoctor(undefined); }} onSaved={onReload} onError={onError} /></section>;
}
