import { FormEvent, useState } from 'react';
import { createDoctor, type ClinicService } from '../../api/admin-api';

type Props = { accessToken: string; services: ClinicService[]; onCreated: () => void; onError: (message: string) => void };

export function DoctorCreateForm({ accessToken, services, onCreated, onError }: Props) {
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { await createDoctor(accessToken, { slug: String(form.get('slug')), name: String(form.get('name')), title: String(form.get('title')) || null, specialty: String(form.get('specialty')) || null, serviceIds }); event.currentTarget.reset(); setServiceIds([]); onCreated(); } catch (error) { onError((error as Error).message); }
  }
  function toggleService(id: string) { setServiceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  return <form onSubmit={submit}><h3>Thêm bác sĩ</h3><label>Slug<input name="slug" pattern="[a-z0-9-]+" required /></label><label>Tên<input name="name" required /></label><label>Chức danh<input name="title" /></label><label>Chuyên môn<input name="specialty" /></label><fieldset><legend>Dịch vụ phụ trách</legend>{services.filter((service) => service.isActive).map((service) => <label key={service.id}><input type="checkbox" checked={serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />{service.name}</label>)}</fieldset><button>Thêm bác sĩ</button></form>;
}
