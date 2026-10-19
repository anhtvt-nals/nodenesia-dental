import { FormEvent, useState } from 'react';
import { listPatients, updatePatientNotes, type Patient } from '../../api/admin-api';

type Props = { accessToken: string; patients: Patient[]; onChanged: (patients: Patient[]) => void; onError: (message: string) => void };

export function PatientList({ accessToken, patients, onChanged, onError }: Props) {
  const [editingId, setEditingId] = useState<string>();
  const [notes, setNotes] = useState('');
  const [query, setQuery] = useState('');
  function edit(patient: Patient) { setEditingId(patient.id); setNotes(patient.notes ?? ''); }
  async function save(patient: Patient) {
    try {
      const updated = await updatePatientNotes(accessToken, patient.id, notes.trim() || null);
      onChanged(patients.map((item) => item.id === patient.id ? updated : item));
      setEditingId(undefined);
    } catch (error) { onError((error as Error).message); }
  }
  async function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); try { onChanged(await listPatients(accessToken, query.trim())); } catch (error) { onError((error as Error).message); } }
  return <section aria-labelledby="patients-heading"><h2 id="patients-heading">Bệnh nhân</h2><form onSubmit={search}><label>Tìm tên hoặc điện thoại<input value={query} onChange={(event) => setQuery(event.target.value)} /></label><button>Tìm</button></form><table><thead><tr><th>Tên</th><th>Điện thoại</th><th>Lịch hẹn</th><th>Ghi chú nội bộ</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td>{patient.name}</td><td>{patient.phoneE164}</td><td>{patient._count.bookings}</td><td>{editingId === patient.id ? <><textarea aria-label={`Ghi chú ${patient.name}`} value={notes} onChange={(event) => setNotes(event.target.value)} /><button type="button" onClick={() => void save(patient)}>Lưu</button></> : <button type="button" onClick={() => edit(patient)}>{patient.notes || 'Thêm ghi chú'}</button>}</td></tr>)}</tbody></table></section>;
}
