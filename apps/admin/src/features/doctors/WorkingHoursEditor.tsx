import { FormEvent, useEffect, useState } from 'react';
import { replaceWorkingHours, type ClinicDoctor, type WorkingHourInput } from '../../api/admin-api';

type Props = { accessToken: string; doctor?: ClinicDoctor; onChanged: (doctor: ClinicDoctor) => void; onError: (message: string) => void };
const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const toClock = (value: string) => value.slice(11, 16);

export function WorkingHoursEditor({ accessToken, doctor, onChanged, onError }: Props) {
  const [hours, setHours] = useState<WorkingHourInput[]>([]);
  useEffect(() => setHours(doctor ? doctor.workingHours.map((hour) => ({ weekday: hour.weekday, start: toClock(hour.startTime), end: toClock(hour.endTime) })) : []), [doctor]);
  if (!doctor) return <p>Chọn bác sĩ để sửa giờ làm việc.</p>;
  const doctorId = doctor.id;
  function add() { setHours([...hours, { weekday: 1, start: '09:00', end: '17:00' }]); }
  function update(index: number, field: keyof WorkingHourInput, value: string | number) { setHours(hours.map((hour, current) => current === index ? { ...hour, [field]: value } : hour)); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); try { onChanged(await replaceWorkingHours(accessToken, doctorId, hours)); } catch (error) { onError((error as Error).message); } }
  return <form onSubmit={submit}><h3>Giờ làm: {doctor.name}</h3>{hours.map((hour, index) => <div className="shift" key={`${hour.weekday}-${index}`}><select aria-label="Ngày" value={hour.weekday} onChange={(event) => update(index, 'weekday', Number(event.target.value))}>{days.map((day, weekday) => <option value={weekday} key={day}>{day}</option>)}</select><input aria-label="Bắt đầu" type="time" value={hour.start} onChange={(event) => update(index, 'start', event.target.value)} required /><input aria-label="Kết thúc" type="time" value={hour.end} onChange={(event) => update(index, 'end', event.target.value)} required /><button type="button" onClick={() => setHours(hours.filter((_, current) => current !== index))}>Xóa</button></div>)}<button type="button" onClick={add}>Thêm ca</button><button>Lưu giờ làm</button></form>;
}
