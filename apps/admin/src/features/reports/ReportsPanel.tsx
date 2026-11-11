import { Button, Descriptions, Form, Input, Space, Statistic, Typography } from 'antd';
import { useState } from 'react';
import { bookingReport, downloadBookingsCsv, type BookingReport } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { accessToken: string; onError: (message: string) => void };
const today = new Date().toISOString().slice(0, 10);
export function ReportsPanel({ accessToken, onError }: Props) {
  useAdminTranslation();
  const [from, setFrom] = useState(today.slice(0, 8) + '01'); const [to, setTo] = useState(today); const [report, setReport] = useState<BookingReport>(); const [loading, setLoading] = useState(false);
  async function load() { setLoading(true); try { setReport(await bookingReport(accessToken, from, to)); } catch (error) { onError((error as Error).message); } finally { setLoading(false); } }
  async function exportCsv() { try { await downloadBookingsCsv(accessToken, from, to); } catch (error) { onError((error as Error).message); } }
  return <section aria-labelledby="reports-heading"><Typography.Title level={2} id="reports-heading">{tr('Laporan janji temu', 'Appointment report')}</Typography.Title><Form layout="inline"><Form.Item label={tr('Dari', 'From')}><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></Form.Item><Form.Item label={tr('Sampai', 'To')}><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></Form.Item><Space><Button type="primary" loading={loading} onClick={() => void load()}>{tr('Muat laporan', 'Load report')}</Button><Button onClick={() => void exportCsv()}>{tr('Ekspor CSV', 'Export CSV')}</Button></Space></Form>{report && <><Space size="large" className="report-stats"><Statistic title={tr('Total janji temu', 'Total appointments')} value={report.total} /><Statistic title={tr('Tidak hadir', 'No show')} value={report.noShows} suffix={`(${Math.round(report.noShowRate * 100)}%)`} /></Space><Descriptions title={tr('Menurut layanan', 'By service')} column={1} items={Object.entries(report.byService).map(([label, value]) => ({ key: label, label, children: value }))} /><Descriptions title={tr('Menurut sumber', 'By source')} column={1} items={Object.entries(report.bySource).map(([label, value]) => ({ key: label, label, children: value }))} /></>}</section>;
}
