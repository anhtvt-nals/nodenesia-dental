import { Button, Calendar, Drawer, Form, Input, Select, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { createManualBooking, listAvailableSlots, type AvailableSlot, type ClinicDoctor, type ClinicService } from '../../api/admin-api';
import { copy, tr, useAdminTranslation } from '../../i18n';
import { AdminHeaderActions } from '../../components/AdminHeaderActions';

type Props = { accessToken: string; doctors: ClinicDoctor[]; services: ClinicService[]; onCreated: () => void; onError: (message: string) => void };
type BookingInput = { name: string; phone: string; doctorId: string; serviceId: string; time: string };

export function ManualBookingForm({ accessToken, doctors, services, onCreated, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<BookingInput>();
  const doctorId = Form.useWatch('doctorId', form);
  const serviceId = Form.useWatch('serviceId', form);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    form.setFieldValue('time', undefined);
    setSelectedTime('');
    setSlots([]);
    if (!open || !date || !doctorId || !serviceId) return;
    let active = true;
    setLoadingSlots(true);
    void listAvailableSlots(accessToken, { serviceId, doctorId, date }).then((nextSlots) => { if (active) setSlots(nextSlots); }).catch((error: Error) => { if (active) onError(error.message); }).finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [accessToken, date, doctorId, form, onError, open, serviceId]);

  function close() { form.resetFields(); setDate(''); setSlots([]); setSelectedTime(''); setOpen(false); }
  async function submit(values: BookingInput) {
    if (!date) { onError(tr('Pilih tanggal terlebih dahulu.', 'Select a date first.')); return; }
    setSaving(true);
    try { await createManualBooking(accessToken, { ...values, startsAt: new Date(`${date}T${values.time}:00+07:00`).toISOString() }); close(); onCreated(); } catch (error) { onError((error as Error).message); } finally { setSaving(false); }
  }
  const availableDoctors = doctors.filter((doctor) => doctor.isActive && (!serviceId || doctor.services.some((service) => service.serviceId === serviceId)));
  return <><AdminHeaderActions><Button type="primary" onClick={() => setOpen(true)}>{copy.makeAppointment}</Button></AdminHeaderActions>
    <Drawer className="manual-booking-drawer" title={tr('Buat janji temu manual', 'Create manual appointment')} open={open} onClose={close} width={560} destroyOnHidden footer={<Space><Button onClick={close}>{copy.cancel}</Button><Button type="primary" loading={saving} onClick={() => form.submit()}>{copy.save}</Button></Space>}>
      <Form className="manual-booking-form" form={form} layout="vertical" onFinish={(values) => void submit(values)}>
        <Form.Item name="name" label={tr('Nama pasien', 'Patient name')} rules={[{ required: true, message: tr('Nama pasien wajib diisi', 'Patient name is required') }]}><Input autoFocus /></Form.Item>
        <Form.Item name="phone" label="WhatsApp" rules={[{ required: true, pattern: /^\+[1-9][0-9]{7,14}$/, message: tr('Gunakan nomor internasional, misalnya +628123456789', 'Use an international number, e.g. +628123456789') }]}><Input placeholder="+628123456789" /></Form.Item>
        <Form.Item name="serviceId" label={tr('Layanan', 'Service')} rules={[{ required: true, message: tr('Layanan wajib dipilih', 'Select a service') }]}><Select options={services.filter((service) => service.isActive).map((service) => ({ value: service.id, label: service.name }))} /></Form.Item>
        <Form.Item name="doctorId" label={copy.doctors.slice(0, -1)} rules={[{ required: true, message: tr('Dokter wajib dipilih', 'Select a doctor') }]}><Select disabled={!serviceId} placeholder={serviceId ? undefined : tr('Pilih layanan terlebih dahulu', 'Select a service first')} options={availableDoctors.map((doctor) => ({ value: doctor.id, label: doctor.name }))} /></Form.Item>
        <Form.Item label={tr('Tanggal', 'Date')} required><div className={`manual-booking-calendar${!doctorId || !serviceId ? ' manual-booking-calendar--disabled' : ''}`}>{!doctorId || !serviceId ? <p>{tr('Pilih layanan dan dokter untuk membuka kalender.', 'Select a service and doctor to open the calendar.')}</p> : <Calendar fullscreen={false} validRange={[dayjs().startOf('day'), dayjs().add(50, 'year').endOf('year')]} disabledDate={(value) => value.endOf('day').valueOf() < Date.now()} onSelect={(value) => setDate(value.format('YYYY-MM-DD'))} />}</div></Form.Item>
        <Form.Item name="time" label={tr('Waktu tersedia', 'Available time')} rules={[{ required: true, message: tr('Pilih waktu yang tersedia', 'Select an available time') }]}>
          <div className="manual-booking-slots">{!date || !doctorId || !serviceId ? <p>{tr('Pilih layanan, dokter, lalu tanggal untuk melihat jam kosong.', 'Select a service, doctor, then date to see available times.')}</p> : loadingSlots ? <Spin size="small" /> : slots.length ? slots.map((slot) => <button key={slot.start} type="button" className={`manual-booking-slot${selectedTime === slot.start ? ' manual-booking-slot--selected' : ''}`} onClick={() => { form.setFieldValue('time', slot.start); setSelectedTime(slot.start); }}>{slot.start}</button>) : <p>{tr('Tidak ada slot kosong pada tanggal ini.', 'No available slots on this date.')}</p>}</div>
        </Form.Item>
      </Form>
    </Drawer>
  </>;
}
