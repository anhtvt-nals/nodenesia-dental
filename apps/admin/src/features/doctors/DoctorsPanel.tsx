import { useState } from 'react';
import type { ClinicDoctor, ClinicService, TimeOff } from '../../api/admin-api';
import { DoctorCreateForm } from './DoctorCreateForm';
import { DoctorList } from './DoctorList';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import { TimeOffForm } from './TimeOffForm';

type Props = { accessToken: string; doctors: ClinicDoctor[]; services: ClinicService[]; timeOffs: TimeOff[]; onReload: () => void; onChanged: (doctors: ClinicDoctor[]) => void; onTimeOffsChanged: (timeOffs: TimeOff[]) => void; onError: (message: string) => void };

export function DoctorsPanel({ accessToken, doctors, services, timeOffs, onReload, onChanged, onTimeOffsChanged, onError }: Props) {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = doctors.find((doctor) => doctor.id === selectedId);
  function replace(next: ClinicDoctor) { onChanged(doctors.map((doctor) => doctor.id === next.id ? next : doctor)); }
  return <section aria-labelledby="doctors-heading"><h2 id="doctors-heading">Bác sĩ và lịch làm việc</h2><DoctorList accessToken={accessToken} doctors={doctors} selectedId={selectedId} onSelect={setSelectedId} onChanged={replace} onError={onError} /><WorkingHoursEditor accessToken={accessToken} doctor={selected} onChanged={replace} onError={onError} /><TimeOffForm accessToken={accessToken} doctors={doctors} timeOffs={timeOffs} onChanged={onTimeOffsChanged} onSaved={onError} onError={onError} /><DoctorCreateForm accessToken={accessToken} services={services} onCreated={onReload} onError={onError} /></section>;
}
