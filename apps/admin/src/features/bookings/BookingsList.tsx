import type { Booking } from '../../api/admin-api';

type Props = { bookings: Booking[]; onCancel: (code: string) => void; onStatus: (code: string, status: 'confirmed' | 'completed' | 'no_show') => void };

export function BookingsList({ bookings, onCancel, onStatus }: Props) {
  return <section><h2>Lịch hẹn</h2>{bookings.length === 0 ? <p>Chưa có lịch hẹn.</p> : <table><thead><tr><th>Giờ</th><th>Bệnh nhân</th><th>Dịch vụ</th><th>Bác sĩ</th><th>Trạng thái</th><th /></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.code}><td>{new Date(booking.startsAt).toLocaleString()}</td><td>{booking.patient.name}<br />{booking.patient.phone}</td><td>{booking.service}</td><td>{booking.doctor}</td><td>{booking.status}</td><td>{booking.status === 'pending' && <button type="button" onClick={() => onStatus(booking.code, 'confirmed')}>Xác nhận</button>}{['pending', 'confirmed'].includes(booking.status) && <button type="button" onClick={() => onStatus(booking.code, 'no_show')}>Vắng mặt</button>}{booking.status === 'confirmed' && <button type="button" onClick={() => onStatus(booking.code, 'completed')}>Hoàn tất</button>}{['pending', 'confirmed'].includes(booking.status) && <button type="button" onClick={() => onCancel(booking.code)}>Hủy</button>}</td></tr>)}</tbody></table>}</section>;
}
