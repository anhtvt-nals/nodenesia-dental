import { useState } from 'react';
import { Button } from 'antd';
import type { ClinicDoctor, ClinicService, ServerPagination } from '../../api/admin-api';
import { DoctorCreateForm } from './DoctorCreateForm';
import { DoctorList } from './DoctorList';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import { tr, useAdminTranslation } from '../../i18n';
import { AdminPageHeader } from '../../components/ui';

type Props = { accessToken: string; doctors: ClinicDoctor[]; services: ClinicService[]; onReload: () => void; onChanged: (doctors: ClinicDoctor[]) => void; onError: (message: string) => void; pagination?: ServerPagination };

export function DoctorsPanel({ accessToken, doctors, services, onReload, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const [hoursDoctorId, setHoursDoctorId] = useState<string>();
  const [editingDoctor, setEditingDoctor] = useState<ClinicDoctor>();
  const [isCreating, setIsCreating] = useState(false);
  const hoursDoctor = doctors.find((doctor) => doctor.id === hoursDoctorId);
  function replace(next: ClinicDoctor) { onChanged(doctors.map((doctor) => doctor.id === next.id ? next : doctor)); }
  return (
    <section aria-labelledby="doctors-heading">
      <AdminPageHeader
        title={tr('Dokter Gigi', 'Doctors')}
        description={tr('Kelola profil dokter, layanan yang ditangani, dan jadwal praktik.', 'Manage doctor profiles, assigned services, and working hours.')}
        meta={`${pagination?.total ?? doctors.length} ${tr('dokter', 'doctors')}`}
        actions={<Button type="primary" onClick={() => setIsCreating(true)}>{tr('Tambah dokter', 'Add doctor')}</Button>}
      />
      <DoctorList accessToken={accessToken} doctors={doctors} onEdit={setEditingDoctor} onManageHours={setHoursDoctorId} onChanged={replace} onDeleted={onReload} onError={onError} pagination={pagination} />
      <WorkingHoursEditor accessToken={accessToken} doctor={hoursDoctor} onClose={() => setHoursDoctorId(undefined)} onChanged={replace} onError={onError} />
      <DoctorCreateForm accessToken={accessToken} services={services} doctor={editingDoctor} open={isCreating || Boolean(editingDoctor)} onClose={() => { setIsCreating(false); setEditingDoctor(undefined); }} onSaved={onReload} onError={onError} />
    </section>
  );
}
