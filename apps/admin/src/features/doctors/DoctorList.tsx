import { updateDoctor, type ClinicDoctor } from '../../api/admin-api';

type Props = { accessToken: string; doctors: ClinicDoctor[]; selectedId?: string; onSelect: (id: string) => void; onChanged: (doctor: ClinicDoctor) => void; onError: (message: string) => void };

export function DoctorList({ accessToken, doctors, selectedId, onSelect, onChanged, onError }: Props) {
  async function toggle(doctor: ClinicDoctor) {
    try { onChanged(await updateDoctor(accessToken, doctor.id, { isActive: !doctor.isActive })); } catch (error) { onError((error as Error).message); }
  }

  return <table><thead><tr><th>Bác sĩ</th><th>Chuyên môn</th><th>Trạng thái</th></tr></thead><tbody>{doctors.map((doctor) => <tr key={doctor.id}><td><button type="button" className={doctor.id === selectedId ? 'selected' : ''} onClick={() => onSelect(doctor.id)}>{doctor.name}</button></td><td>{doctor.specialty ?? '—'}</td><td><button type="button" onClick={() => void toggle(doctor)}>{doctor.isActive ? 'Đang nhận lịch' : 'Tạm ẩn'}</button></td></tr>)}</tbody></table>;
}
