import { DeleteOutlined, InfoCircleOutlined, PlusOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Drawer, Empty, Form, Input, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { createTimeOff, deleteTimeOff, type ClinicDoctor, type ServerPagination, type TimeOff } from '../../api/admin-api';
import { copy, formatDate, formatDateTime, tr, useAdminTranslation } from '../../i18n';
import { AdminPageHeader, AdminTable } from '../../components/ui';

type Props = {
  accessToken: string;
  doctors: ClinicDoctor[];
  timeOffs: TimeOff[];
  onSaved: (message: string) => void;
  onChanged: (timeOffs: TimeOff[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type FormValues = {
  doctorId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
};

const QUICK_REASONS = [
  { id: 'Cuti tahunan', label: 'Cuti tahunan' },
  { id: 'Sakit / Pemulihan medis', label: 'Sakit / Pemulihan medis' },
  { id: 'Urusan keluarga mendesak', label: 'Urusan keluarga' },
  { id: 'Pelatihan / Seminar medis', label: 'Pelatihan / Seminar medis' },
  { id: 'Izin mendadak', label: 'Izin mendadak' },
];

export function TimeOffForm({ accessToken, doctors, timeOffs, onSaved, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  async function submit(values: FormValues) {
    if (!values.startDate) {
      onError(tr('Tanggal mulai wajib diisi', 'Start date is required'));
      return;
    }
    const end = values.endDate || values.startDate;
    if (end < values.startDate) {
      onError(tr('Tanggal selesai tidak boleh lebih awal dari tanggal mulai', 'End date cannot be earlier than start date'));
      return;
    }

    setSaving(true);
    try {
      // Clinic timezone is Asia/Jakarta (+07:00)
      const startsAt = new Date(`${values.startDate}T00:00:00+07:00`).toISOString();
      const endsAt = new Date(`${end}T23:59:59.999+07:00`).toISOString();

      const timeOff = await createTimeOff(accessToken, {
        doctorId: values.doctorId || undefined,
        startsAt,
        endsAt,
        reason: values.reason?.trim() || undefined,
      });

      onChanged([...timeOffs, timeOff]);
      form.resetFields();
      setOpen(false);
      onSaved(tr('Jadwal libur berhasil disimpan.', 'Time off saved successfully.'));
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(timeOff: TimeOff) {
    try {
      await deleteTimeOff(accessToken, timeOff.id);
      onChanged(timeOffs.filter((item) => item.id !== timeOff.id));
      onSaved(tr('Jadwal libur berhasil dihapus.', 'Time off deleted successfully.'));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  // Filter timeOffs by doctor if requested
  const filteredTimeOffs = useMemo(() => {
    if (selectedDoctorFilter === 'all') return timeOffs;
    if (selectedDoctorFilter === 'clinic') return timeOffs.filter((t) => !t.doctorId);
    return timeOffs.filter((t) => t.doctorId === selectedDoctorFilter);
  }, [timeOffs, selectedDoctorFilter]);

  // Calculate duration in days between two ISO dates
  const formatDurationDays = (startsAt: string, endsAt: string) => {
    const s = new Date(startsAt).getTime();
    const e = new Date(endsAt).getTime();
    const diffDays = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)));
    return `${diffDays} ${tr('hari', 'days')}`;
  };

  const columns: ColumnsType<TimeOff> = [
    {
      title: tr('Dokter / Lingkup', 'Doctor / Scope'),
      render: (_, timeOff) => {
        if (!timeOff.doctor) {
          return <Tag className="admin-tag admin-tag--warning">{tr('Seluruh klinik', 'Entire clinic')}</Tag>;
        }
        return (
          <Space>
            <UserOutlined style={{ color: 'var(--brand-700)' }} />
            <strong>{timeOff.doctor.name}</strong>
          </Space>
        );
      },
    },
    {
      title: tr('Hari / Periode Libur', 'Leave Period'),
      render: (_, timeOff) => {
        const startStr = formatDate(timeOff.startsAt);
        const endStr = formatDate(timeOff.endsAt);
        const isSameDay = startStr === endStr;
        return (
          <Space orientation="vertical" size={2}>
            <span>{isSameDay ? startStr : `${startStr} — ${endStr}`}</span>
            <Tag className="admin-tag admin-tag--info">{formatDurationDays(timeOff.startsAt, timeOff.endsAt)}</Tag>
          </Space>
        );
      },
    },
    {
      title: tr('Alasan Libur', 'Reason'),
      dataIndex: 'reason',
      render: (value) => value ? <Tag className="admin-tag admin-tag--neutral">{value}</Tag> : <span style={{ color: 'var(--neutral-500)' }}>—</span>,
    },
    {
      title: tr('Tindakan', 'Actions'),
      width: 90,
      render: (_, timeOff) => (
        <Popconfirm
          title={tr('Hapus jadwal libur ini?', 'Delete this time off?')}
          okText={tr('Hapus', 'Delete')}
          cancelText={tr('Batal', 'Cancel')}
          onConfirm={() => void remove(timeOff)}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={tr('Hapus jadwal libur', 'Delete time off')}
            title={tr('Hapus jadwal libur', 'Delete time off')}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <section aria-label={tr('Jadwal libur', 'Time off')}>
      <AdminPageHeader
        title={tr('Jadwal Libur & Cuti', 'Time Off & Leave')}
        description={tr(
          'Atur cuti dokter atau hari libur klinik agar slot pemesanan otomatis ditutup.',
          'Configure doctor leave or clinic holidays to close booking slots automatically.',
        )}
        meta={`${filteredTimeOffs.length} ${tr('jadwal libur', 'entries')}`}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.setFieldsValue({
                startDate: todayStr,
                endDate: todayStr,
              });
              setOpen(true);
            }}
          >
            {tr('Daftarkan hari libur', 'Register time off')}
          </Button>
        }
      />

      <Alert
        className="schedule-note"
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message={tr(
          'Hari libur yang didaftarkan akan otomatis menutup slot booking dan mendisable tanggal tersebut pada formulir booking pasien, serta ditandai di kalender admin.',
          'Registered doctor time-offs automatically close booking slots, disable the date on patient booking calendars, and appear clearly in the admin calendar.'
        )}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">
        <Col xs={24} sm={12} md={8}>
          <Select
            style={{ width: '100%' }}
            value={selectedDoctorFilter}
            onChange={setSelectedDoctorFilter}
            options={[
              { value: 'all', label: tr('Semua Dokter & Klinik', 'All Doctors & Clinic') },
              { value: 'clinic', label: tr('Seluruh Klinik (Global)', 'Entire Clinic (Global)') },
              ...doctors.filter((d) => d.isActive).map((d) => ({ value: d.id, label: `${tr('Dokter', 'Doctor')}: ${d.name}` })),
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Typography.Text type="secondary">
            {tr('Total jadwal libur:', 'Total logs:')} <strong>{filteredTimeOffs.length}</strong>
          </Typography.Text>
        </Col>
      </Row>

      <AdminTable<TimeOff>
        rowKey="id"
        columns={columns}
        dataSource={filteredTimeOffs}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada jadwal libur', 'No time off yet')}
      />

      <Drawer
        className="timeoff-form-drawer"
        title={tr('Daftarkan Hari Libur Dokter', 'Register Doctor Time Off')}
        open={open}
        onClose={() => setOpen(false)}
        width={520}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>{copy.cancel}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {copy.save}
            </Button>
          </Space>
        }
      >
        <Form
          className="timeoff-form"
          form={form}
          layout="vertical"
          initialValues={{ startDate: todayStr, endDate: todayStr }}
          onFinish={(values) => void submit(values)}
        >
          <Form.Item
            name="doctorId"
            label={tr('Dokter', 'Doctor')}
            extra={tr('Kosongkan untuk libur seluruh klinik.', 'Leave empty for clinic-wide off day.')}
          >
            <Select
              allowClear
              placeholder={tr('Seluruh klinik', 'Entire clinic')}
              options={doctors.filter((doctor) => doctor.isActive).map((doctor) => ({
                value: doctor.id,
                label: doctor.name,
              }))}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label={tr('Tanggal Mulai', 'Start Date')}
                rules={[{ required: true, message: tr('Tanggal mulai wajib diisi', 'Start date is required') }]}
              >
                <Input
                  type="date"
                  onChange={(e) => {
                    const currentEnd = form.getFieldValue('endDate');
                    if (!currentEnd || currentEnd < e.target.value) {
                      form.setFieldsValue({ endDate: e.target.value });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label={tr('Tanggal Selesai', 'End Date')}
                rules={[{ required: true, message: tr('Tanggal selesai wajib diisi', 'End date is required') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              {tr('Saran alasan libur:', 'Quick reason templates:')}
            </Typography.Text>
            <Space wrap size={[6, 6]}>
              {QUICK_REASONS.map((r) => (
                <Tag
                  key={r.id}
                  style={{ cursor: 'pointer', padding: '2px 8px' }}
                  onClick={() => form.setFieldsValue({ reason: r.id })}
                >
                  {r.label}
                </Tag>
              ))}
            </Space>
          </div>

          <Form.Item
            name="reason"
            label={tr('Alasan Libur / Keterangan', 'Reason / Notes')}
            rules={[{ required: true, message: tr('Alasan libur wajib diisi', 'Reason is required') }]}
          >
            <Input.TextArea
              rows={4}
              placeholder={tr('Contoh: Cuti tahunan, urusan keluarga, sakit, dll.', 'e.g. Annual leave, family event, medical leave')}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  );
}
