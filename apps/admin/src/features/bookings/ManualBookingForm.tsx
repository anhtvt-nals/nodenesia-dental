import {
  Button,
  Calendar,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { CalendarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  createManualBooking,
  listAvailableSlots,
  type AvailableSlot,
  type ClinicDoctor,
  type ClinicService,
} from '../../api/admin-api';
import { copy, tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  doctors: ClinicDoctor[];
  services: ClinicService[];
  onCreated: () => void;
  onError: (message: string) => void;
  initialParentBookingId?: string;
  initialPatient?: { name: string; phone: string };
  initialDoctorId?: string;
};

type BookingInput = {
  name: string;
  phone: string;
  doctorId: string;
  serviceId: string;
  time?: string;
  chairIndex?: number;
  complaint?: string;
  isWalkIn?: boolean;
};

export function ManualBookingForm({
  accessToken,
  doctors,
  services,
  onCreated,
  onError,
  initialParentBookingId,
  initialPatient,
  initialDoctorId,
}: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<BookingInput>();
  const doctorId = Form.useWatch('doctorId', form);
  const serviceId = Form.useWatch('serviceId', form);
  const isWalkIn = Form.useWatch('isWalkIn', form);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');

  // Handle pre-filled initial data (e.g. for Follow-up creation)
  useEffect(() => {
    if (open) {
      if (initialPatient) {
        form.setFieldsValue({
          name: initialPatient.name,
          phone: initialPatient.phone,
          doctorId: initialDoctorId,
        });
      }
    }
  }, [form, initialDoctorId, initialPatient, open]);

  useEffect(() => {
    if (isWalkIn) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      form.setFieldValue('time', timeStr);
      setSelectedTime(timeStr);
      setDate(dayjs().format('YYYY-MM-DD'));
      return;
    }

    form.setFieldValue('time', undefined);
    setSelectedTime('');
    setSlots([]);
    if (!open || !date || !doctorId || !serviceId) return;
    let active = true;
    setLoadingSlots(true);
    void listAvailableSlots(accessToken, { serviceId, doctorId, date })
      .then((nextSlots) => {
        if (active) setSlots(nextSlots);
      })
      .catch((error: Error) => {
        if (active) onError(error.message);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, date, doctorId, form, isWalkIn, onError, open, serviceId]);

  function close() {
    form.resetFields();
    setDate('');
    setSlots([]);
    setSelectedTime('');
    setOpen(false);
  }

  async function submit(values: BookingInput) {
    if (!values.isWalkIn && !date) {
      onError(tr('Pilih tanggal terlebih dahulu.', 'Select a date first.'));
      return;
    }
    setSaving(true);
    try {
      const appointmentTime = values.time || (values.isWalkIn ? dayjs().format('HH:mm') : '09:00');
      const targetDate = values.isWalkIn ? dayjs().format('YYYY-MM-DD') : date;

      await createManualBooking(accessToken, {
        name: values.name.trim(),
        phone: values.phone.trim(),
        doctorId: values.doctorId,
        serviceId: values.serviceId,
        chairIndex: values.chairIndex,
        complaint: values.complaint,
        isWalkIn: values.isWalkIn,
        parentBookingId: initialParentBookingId,
        startsAt: new Date(`${targetDate}T${appointmentTime}:00+07:00`).toISOString(),
      });
      close();
      onCreated();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const availableDoctors = doctors.filter(
    (doctor) => doctor.isActive && (!serviceId || doctor.services.some((service) => service.serviceId === serviceId)),
  );

  return (
    <>
      <Button type="primary" icon={<CalendarOutlined />} onClick={() => setOpen(true)}>
        {copy.makeAppointment}
      </Button>
      <Drawer
        className="manual-booking-drawer"
        title={
          <Space>
            <span>
              {initialParentBookingId
                ? tr('Buat Janji Kontrol (Follow-up)', 'Schedule Follow-up Appointment')
                : tr('Buat Janji Temu Resepsionis / Darurat', 'Reception Appointment & Walk-in')}
            </span>
            {initialParentBookingId && <Tag className="admin-tag admin-tag--brand">{tr('Kontrol', 'Follow-up')}</Tag>}
          </Space>
        }
        open={open}
        onClose={close}
        width={620}
        destroyOnHidden
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={close}>{copy.cancel}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {isWalkIn ? tr('Terima Pasien Sekarang', 'Admit Patient Now') : copy.save}
            </Button>
          </Space>
        }
      >
        <Form className="manual-booking-form" form={form} layout="vertical" onFinish={(values) => void submit(values)}>
          {/* Emergency / Walk-in Mode Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isWalkIn ? 'var(--semantic-danger-surface)' : 'var(--neutral-50)',
              border: `1px solid ${isWalkIn ? 'var(--semantic-danger-border)' : 'var(--neutral-200)'}`,
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              transition: 'background-color 180ms var(--ease-out), border-color 180ms var(--ease-out)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: isWalkIn ? 'var(--color-error)' : 'var(--color-text)', fontSize: 13 }}>
                <ThunderboltOutlined style={{ marginRight: 6 }} />
                {tr('Mode Penerimaan Darurat / Walk-in', 'Emergency Walk-in Mode')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                {tr(
                  'Lewati batas waktu pemesanan 60 menit dan langsung tempatkan di kursi perawatan yang kosong.',
                  'Bypasses lead time to admit an unscheduled patient immediately.',
                )}
              </div>
            </div>
            <Form.Item name="isWalkIn" valuePropName="checked" noStyle>
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label={tr('Nama lengkap pasien', 'Patient name')}
            rules={[{ required: true, message: tr('Nama pasien wajib diisi', 'Patient name is required') }]}
          >
            <Input autoFocus placeholder="Budi Santoso" />
          </Form.Item>
          <Form.Item
            name="phone"
            label={tr('WhatsApp / Nomor Telepon', 'WhatsApp / Contact Number')}
            rules={[
              {
                required: true,
                pattern: /^\+[1-9][0-9]{7,14}$/,
                message: tr(
                  'Gunakan nomor internasional, misalnya +628123456789',
                  'Use an international number, e.g. +628123456789',
                ),
              },
            ]}
          >
            <Input placeholder="+628123456789" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="serviceId"
                label={tr('Layanan / Tindakan', 'Service')}
                rules={[{ required: true, message: tr('Layanan wajib dipilih', 'Select a service') }]}
              >
                <Select
                  placeholder={tr('Pilih layanan', 'Select service')}
                  options={services
                    .filter((service) => service.isActive)
                    .map((service) => ({
                      value: service.id,
                      label: `${service.name} (${service.durationMinutes} mnt)`,
                    }))}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="chairIndex"
                label={tr('Kursi Perawatan', 'Dental Chair')}
                rules={isWalkIn ? [{ required: true, message: tr('Pilih kursi perawatan untuk pasien darurat', 'Select chair') }] : []}
              >
                <Select
                  allowClear
                  placeholder={tr('Pilih kursi', 'Select Chair')}
                  options={[
                    { value: 1, label: tr('Kursi 1', 'Chair 1') },
                    { value: 2, label: tr('Kursi 2', 'Chair 2') },
                    { value: 3, label: tr('Kursi 3', 'Chair 3') },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="doctorId"
            label={tr('Dokter Gigi', 'Doctor')}
            rules={[{ required: true, message: tr('Dokter wajib dipilih', 'Select a doctor') }]}
          >
            <Select
              disabled={!serviceId}
              placeholder={serviceId ? undefined : tr('Pilih layanan terlebih dahulu', 'Select a service first')}
              options={availableDoctors.map((doctor) => ({ value: doctor.id, label: doctor.name }))}
            />
          </Form.Item>

          {!isWalkIn && (
            <>
              <Form.Item label={tr('Tanggal Janji Temu', 'Date')} required>
                <div
                  className={`manual-booking-calendar${
                    !doctorId || !serviceId ? ' manual-booking-calendar--disabled' : ''
                  }`}
                >
                  {!doctorId || !serviceId ? (
                    <p>{tr('Pilih layanan dan dokter untuk membuka kalender.', 'Select a service and doctor to open the calendar.')}</p>
                  ) : (
                    <Calendar
                      fullscreen={false}
                      validRange={[dayjs().startOf('day'), dayjs().add(50, 'year').endOf('year')]}
                      disabledDate={(value) => value.endOf('day').valueOf() < Date.now()}
                      onSelect={(value) => setDate(value.format('YYYY-MM-DD'))}
                    />
                  )}
                </div>
              </Form.Item>

              <Form.Item
                name="time"
                label={tr('Jadwal Tersedia (Termasuk jeda sterilisasi 15 mnt)', 'Available time (Sterilization buffer included)')}
                rules={[{ required: true, message: tr('Pilih waktu yang tersedia', 'Select an available time') }]}
              >
                <div className="manual-booking-slots">
                  {!date || !doctorId || !serviceId ? (
                    <p>
                      {tr(
                        'Pilih layanan, dokter, lalu tanggal untuk melihat jam yang tersedia.',
                        'Select a service, doctor, then date to see available times.',
                      )}
                    </p>
                  ) : loadingSlots ? (
                    <Spin size="small" />
                  ) : slots.length ? (
                    slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        className={`manual-booking-slot${selectedTime === slot.start ? ' manual-booking-slot--selected' : ''}`}
                        onClick={() => {
                          form.setFieldValue('time', slot.start);
                          setSelectedTime(slot.start);
                        }}
                      >
                        {slot.start}
                      </button>
                    ))
                  ) : (
                    <p>{tr('Tidak ada jadwal kosong di tanggal ini (kursi atau dokter penuh).', 'No available slots (chairs or doctor full).')}</p>
                  )}
                </div>
              </Form.Item>
            </>
          )}

          <Form.Item name="complaint" label={tr('Keluhan / Catatan Klinis', 'Clinical Complaint / Notes')}>
            <Input.TextArea
              rows={2}
              placeholder={tr(
                'Contoh: Gigi 36 berlubang besar dan nyeri berdenyut, perlu perawatan darurat',
                'e.g. Tooth 36 acute pulpitis, requires urgent pulpotomy',
              )}
            />
          </Form.Item>

        </Form>
      </Drawer>
    </>
  );
}
