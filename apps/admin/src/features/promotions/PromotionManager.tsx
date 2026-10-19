import { FormEvent, useState } from 'react';
import { createPromotion, updatePromotion, type Promotion } from '../../api/admin-api';

type Props = { accessToken: string; promotions: Promotion[]; onChanged: (promotions: Promotion[]) => void; onError: (message: string) => void };

const empty = { title: '', description: '', startsAt: '', endsAt: '' };

export function PromotionManager({ accessToken, promotions, onChanged, onError }: Props) {
  const [form, setForm] = useState(empty);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const promotion = await createPromotion(accessToken, { ...form, serviceId: null, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), isPublished: false });
      onChanged([...promotions, promotion]);
      setForm(empty);
    } catch (error) { onError((error as Error).message); }
  }

  async function toggle(promotion: Promotion) {
    try {
      const updated = await updatePromotion(accessToken, promotion.id, { isPublished: !promotion.isPublished });
      onChanged(promotions.map((item) => item.id === promotion.id ? updated : item));
    } catch (error) { onError((error as Error).message); }
  }

  return <section aria-labelledby="promotions-heading"><h2 id="promotions-heading">Khuyến mãi</h2><table><thead><tr><th>Tiêu đề</th><th>Thời hạn</th><th>Public</th></tr></thead><tbody>{promotions.map((promotion) => <tr key={promotion.id}><td>{promotion.title}</td><td>{new Date(promotion.startsAt).toLocaleDateString()} – {new Date(promotion.endsAt).toLocaleDateString()}</td><td><button type="button" onClick={() => void toggle(promotion)}>{promotion.isPublished ? 'Đang hiển thị' : 'Bản nháp'}</button></td></tr>)}</tbody></table><form onSubmit={submit}><h3>Thêm khuyến mãi</h3><label>Tiêu đề<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label><label>Nội dung<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label><label>Bắt đầu<input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required /></label><label>Kết thúc<input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} required /></label><button>Tạo bản nháp</button></form></section>;
}
