import { FormEvent, useState } from 'react';
import { createTestimonial, updateTestimonial, type Testimonial } from '../../api/admin-api';

type Props = { accessToken: string; testimonials: Testimonial[]; onChanged: (testimonials: Testimonial[]) => void; onError: (message: string) => void };

const empty = { name: '', text: '', rating: 5, source: 'Google', sortOrder: 0 };

export function TestimonialManager({ accessToken, testimonials, onChanged, onError }: Props) {
  const [form, setForm] = useState(empty);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const testimonial = await createTestimonial(accessToken, { ...form, isPublished: false });
      onChanged([...testimonials, testimonial]);
      setForm(empty);
    } catch (error) { onError((error as Error).message); }
  }

  async function toggle(testimonial: Testimonial) {
    try {
      const updated = await updateTestimonial(accessToken, testimonial.id, { isPublished: !testimonial.isPublished });
      onChanged(testimonials.map((item) => item.id === testimonial.id ? updated : item));
    } catch (error) { onError((error as Error).message); }
  }

  return <section aria-labelledby="testimonials-heading"><h2 id="testimonials-heading">Đánh giá khách hàng</h2><table><thead><tr><th>Khách hàng</th><th>Điểm</th><th>Public</th></tr></thead><tbody>{testimonials.map((testimonial) => <tr key={testimonial.id}><td>{testimonial.name}</td><td>{testimonial.rating}/5</td><td><button type="button" onClick={() => void toggle(testimonial)}>{testimonial.isPublished ? 'Đang hiển thị' : 'Bản nháp'}</button></td></tr>)}</tbody></table><form onSubmit={submit}><h3>Thêm đánh giá</h3><label>Tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Nội dung<textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required /></label><label>Điểm<input type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} required /></label><label>Nguồn<input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} required /></label><button>Tạo bản nháp</button></form></section>;
}
