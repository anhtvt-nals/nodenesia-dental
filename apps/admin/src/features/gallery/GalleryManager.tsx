import { FormEvent, useState } from 'react';
import { createGalleryItem, updateGalleryItem, type GalleryItem } from '../../api/admin-api';

type Props = { accessToken: string; items: GalleryItem[]; onChanged: (items: GalleryItem[]) => void; onError: (message: string) => void };
const empty: { type: 'before_after' | 'photo'; beforeUrl: string; afterUrl: string; caption: string; consentConfirmed: boolean; sortOrder: number } = { type: 'photo', beforeUrl: '', afterUrl: '', caption: '', consentConfirmed: false, sortOrder: 0 };

export function GalleryManager({ accessToken, items, onChanged, onError }: Props) {
  const [form, setForm] = useState(empty);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const item = await createGalleryItem(accessToken, { ...form, beforeUrl: form.beforeUrl || null, afterUrl: form.afterUrl || null, caption: form.caption || null, serviceId: null, isPublished: false });
      onChanged([...items, item]);
      setForm(empty);
    } catch (error) { onError((error as Error).message); }
  }
  async function toggle(item: GalleryItem) {
    try {
      const updated = await updateGalleryItem(accessToken, item.id, { isPublished: !item.isPublished });
      onChanged(items.map((current) => current.id === item.id ? updated : current));
    } catch (error) { onError((error as Error).message); }
  }
  return <section aria-labelledby="gallery-heading"><h2 id="gallery-heading">Ảnh điều trị</h2><table><thead><tr><th>Ảnh</th><th>Consent</th><th>Public</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.caption ?? item.type}</td><td>{item.consentConfirmed ? 'Đã xác nhận' : 'Chưa có'}</td><td><button type="button" disabled={!item.consentConfirmed} onClick={() => void toggle(item)}>{item.isPublished ? 'Đang hiển thị' : 'Bản nháp'}</button></td></tr>)}</tbody></table><form onSubmit={submit}><h3>Thêm ảnh bằng URL</h3><label>Loại<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as 'photo' | 'before_after' })}><option value="photo">Ảnh sau điều trị</option><option value="before_after">Trước / sau</option></select></label>{form.type === 'before_after' && <label>URL ảnh trước<input type="url" value={form.beforeUrl} onChange={(event) => setForm({ ...form, beforeUrl: event.target.value })} required /></label>}<label>URL ảnh sau<input type="url" value={form.afterUrl} onChange={(event) => setForm({ ...form, afterUrl: event.target.value })} required /></label><label>Chú thích<input value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} /></label><label><input type="checkbox" checked={form.consentConfirmed} onChange={(event) => setForm({ ...form, consentConfirmed: event.target.checked })} required /> Đã có đồng ý bằng văn bản của bệnh nhân</label><button>Tạo bản nháp</button></form></section>;
}
