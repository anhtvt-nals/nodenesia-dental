import { useState } from 'react';
import type { ClinicDoctor } from '../../api/admin-api';

type Props = { doctors: ClinicDoctor[]; onChange: (filter: { doctorId?: string; status?: string }) => void };

export function BookingFilters({ doctors, onChange }: Props) {
  const [filter, setFilter] = useState<{ doctorId?: string; status?: string }>({});
  function change(next: Partial<typeof filter>) { const value = { ...filter, ...next }; setFilter(value); onChange(value); }
  return <div><label>Bác sĩ<select onChange={(event) => change({ doctorId: event.target.value || undefined })}><option value="">Tất cả</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label><label>Trạng thái<select onChange={(event) => change({ status: event.target.value || undefined })}><option value="">Tất cả</option>{['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>;
}
