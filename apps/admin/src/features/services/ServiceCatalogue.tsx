import { FormEvent, useState } from 'react';
import { createService, updateService, type ClinicService, type ServiceInput } from '../../api/admin-api';

type Props = { accessToken: string; services: ClinicService[]; onChanged: (services: ClinicService[]) => void; onError: (message: string) => void };

const initialService: ServiceInput = { slug: '', name: '', shortDesc: '', description: '', zone: 'gum', category: 'prevention', durationMinutes: 45, priceFrom: '0', priceTo: null, priceNote: null, isActive: true, sortOrder: 0 };

export function ServiceCatalogue({ accessToken, services, onChanged, onError }: Props) {
  const [form, setForm] = useState(initialService);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { const created = await createService(accessToken, form); onChanged([...services, created]); setForm(initialService); } catch (error) { onError((error as Error).message); }
  }

  async function toggle(service: ClinicService) {
    try { const updated = await updateService(accessToken, service.id, { isActive: !service.isActive }); onChanged(services.map((item) => item.id === service.id ? updated : item)); } catch (error) { onError((error as Error).message); }
  }

  return <section aria-labelledby="services-heading"><h2 id="services-heading">Dịch vụ</h2><table><thead><tr><th>Tên</th><th>Thời lượng</th><th>Giá từ</th><th>Hiển thị</th></tr></thead><tbody>{services.map((service) => <tr key={service.id}><td>{service.name}</td><td>{service.durationMinutes} phút</td><td>{service.priceFrom}</td><td><button type="button" onClick={() => void toggle(service)}>{service.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</button></td></tr>)}</tbody></table><h3>Thêm dịch vụ</h3><form onSubmit={submit}><label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} pattern="[a-z0-9-]+" required /></label><label>Tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Mô tả ngắn<input value={form.shortDesc} onChange={(event) => setForm({ ...form, shortDesc: event.target.value })} required /></label><label>Mô tả đầy đủ<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label><label>Thời lượng (phút)<input type="number" min="15" max="480" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} required /></label><label>Giá từ<input inputMode="decimal" pattern="\\d+(\\.\\d{1,2})?" value={form.priceFrom} onChange={(event) => setForm({ ...form, priceFrom: event.target.value })} required /></label><button>Thêm dịch vụ</button></form></section>;
}
