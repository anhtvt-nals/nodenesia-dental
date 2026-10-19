import type { AuditLog } from '../../api/admin-api';

export function AuditLogList({ logs }: { logs: AuditLog[] }) {
  return <section aria-labelledby="audit-heading"><h2 id="audit-heading">Audit log</h2>{logs.length === 0 ? <p>Chưa có thay đổi được ghi nhận.</p> : <table><thead><tr><th>Thời điểm</th><th>Người dùng</th><th>Thao tác</th><th>Đối tượng</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString()}</td><td>{log.user?.name ?? 'Hệ thống'}</td><td>{log.action}</td><td>{log.entity} {log.entityId ?? ''}</td></tr>)}</tbody></table>}</section>;
}
