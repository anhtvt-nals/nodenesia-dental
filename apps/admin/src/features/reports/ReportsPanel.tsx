import { FormEvent, useState } from 'react';
import { bookingReport, downloadBookingsCsv, type BookingReport } from '../../api/admin-api';

type Props = { accessToken: string; onError: (message: string) => void };
const today = new Date().toISOString().slice(0, 10);

export function ReportsPanel({ accessToken, onError }: Props) {
  const [from, setFrom] = useState(today.slice(0, 8) + '01');
  const [to, setTo] = useState(today);
  const [report, setReport] = useState<BookingReport>();
  async function load(event: FormEvent<HTMLFormElement>) { event.preventDefault(); try { setReport(await bookingReport(accessToken, from, to)); } catch (error) { onError((error as Error).message); } }
  async function exportCsv() { try { await downloadBookingsCsv(accessToken, from, to); } catch (error) { onError((error as Error).message); } }
  return <section aria-labelledby="reports-heading"><h2 id="reports-heading">Báo cáo booking</h2><form onSubmit={load}><label>Từ ngày<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /></label><label>Đến ngày (không gồm)<input type="date" value={to} onChange={(event) => setTo(event.target.value)} required /></label><button>Tải báo cáo</button><button type="button" onClick={() => void exportCsv()}>Xuất CSV</button></form>{report && <div><p>{report.total} booking · {report.noShows} no-show ({Math.round(report.noShowRate * 100)}%)</p><h3>Theo dịch vụ</h3><ul>{Object.entries(report.byService).map(([name, count]) => <li key={name}>{name}: {count}</li>)}</ul><h3>Theo nguồn</h3><ul>{Object.entries(report.bySource).map(([name, count]) => <li key={name}>{name}: {count}</li>)}</ul></div>}</section>;
}
