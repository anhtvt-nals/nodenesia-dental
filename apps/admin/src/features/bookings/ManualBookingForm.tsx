import { FormEvent } from 'react';
import { createManualBooking, type ClinicDoctor, type ClinicService } from '../../api/admin-api';

type Props = { accessToken: string; doctors: ClinicDoctor[]; services: ClinicService[]; onCreated: () => void; onError: (message: string) => void };

export function ManualBookingForm({ accessToken, doctors, services, onCreated, onError }: Props) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { await createManualBooking(accessToken, { name: String(form.get('name')), phone: String(form.get('phone')), doctorId: String(form.get('doctorId')), serviceId: String(form.get('serviceId')), startsAt: new Date(String(form.get('startsAt'))).toISOString() }); event.currentTarget.reset(); onCreated(); } catch (error) { onError((error as Error).message); }
  }
  return <form onSubmit={submit}><h3>Tạo lịch thủ công</h3><label>Tên bệnh nhân<input name="name" required /></label><label>WhatsApp<input name="phone" type="tel" pattern="\+[1-9][0-9]{7,14}" placeholder="+628123456789" required /></label><label>Dịch vụ<select name="serviceId" required>{services.filter((service) => service.isActive).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Bác sĩ<select name="doctorId" required>{doctors.filter((doctor) => doctor.isActive).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label><label>Thời gian<input name="startsAt" type="datetime-local" required /></label><button>Tạo lịch</button></form>;
}
