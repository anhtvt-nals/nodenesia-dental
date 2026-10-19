import { resendNotification, type NotificationLog } from '../../api/admin-api';

type Props = { accessToken: string; logs: NotificationLog[]; onResent: () => void; onError: (message: string) => void };

export function NotificationLogList({ accessToken, logs, onResent, onError }: Props) {
  async function resend(id: string) { try { await resendNotification(accessToken, id); onResent(); } catch (error) { onError((error as Error).message); } }
  return <section aria-labelledby="notifications-heading"><h2 id="notifications-heading">Notification log</h2>{logs.length === 0 ? <p>Chưa có notification.</p> : <table><thead><tr><th>Lịch hẹn</th><th>Loại</th><th>Trạng thái</th><th>Lỗi</th><th /></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.booking.code}<br />{log.booking.patient.name}</td><td>{log.type}</td><td>{log.status}</td><td>{log.error ?? '—'}</td><td><button type="button" onClick={() => void resend(log.id)}>Gửi lại</button></td></tr>)}</tbody></table>}</section>;
}
