import { FormEvent, useState } from 'react';
import { createFaq, updateFaq, type AdminFaq } from '../../api/admin-api';

type Props = { accessToken: string; faqs: AdminFaq[]; onChanged: (faqs: AdminFaq[]) => void; onError: (message: string) => void };

export function FaqManager({ accessToken, faqs, onChanged, onError }: Props) {
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const faq = await createFaq(accessToken, { question: String(form.get('question')), answer: String(form.get('answer')) }); onChanged([...faqs, faq]); event.currentTarget.reset(); } catch (error) { onError((error as Error).message); } }
  async function toggle(faq: AdminFaq) { try { const updated = await updateFaq(accessToken, faq.id, { isPublished: !faq.isPublished }); onChanged(faqs.map((item) => item.id === faq.id ? updated : item)); } catch (error) { onError((error as Error).message); } }
  return <section aria-labelledby="faqs-heading"><h2 id="faqs-heading">FAQ</h2><table><thead><tr><th>Câu hỏi</th><th>Public</th></tr></thead><tbody>{faqs.map((faq) => <tr key={faq.id}><td>{faq.question}</td><td><button type="button" onClick={() => void toggle(faq)}>{faq.isPublished ? 'Đang hiển thị' : 'Bản nháp'}</button></td></tr>)}</tbody></table><form onSubmit={submit}><h3>Thêm câu hỏi</h3><label>Câu hỏi<input name="question" required /></label><label>Trả lời<textarea name="answer" required /></label><button>Thêm FAQ</button></form></section>;
}
