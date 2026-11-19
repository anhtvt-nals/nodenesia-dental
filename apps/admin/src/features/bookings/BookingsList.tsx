import {
  App as AntdApp,
  Button,
  Dropdown,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EditOutlined,
  FieldTimeOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMemo, useState, type ReactNode } from 'react';
import {
  createManualBooking,
  extendBookingTime,
  updateClinicalNotes,
  type Booking,
  type ClinicDoctor,
  type ClinicService,
  type ServerPagination,
} from '../../api/admin-api';
import {
  AdminPageHeader,
  AdminStatusBadge,
  AdminTable,
} from '../../components/ui';
import {
  formatDayGroup,
  formatLateDuration,
  formatPhone,
  formatTimeOnly,
  isPendingPhone,
  tr,
  useAdminTranslation,
} from '../../i18n';
import type { BookingClientFilter } from './BookingFilters';

type Props = {
  bookings: Booking[];
  onCancel: (code: string) => void;
  onStatus: (code: string, status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show') => void;
  title?: string;
  action?: ReactNode;
  accessToken?: string;
  onReload?: () => void;
  doctors?: ClinicDoctor[];
  services?: ClinicService[];
  clientFilter?: BookingClientFilter;
  filterToolbar?: ReactNode;
  hideHeader?: boolean;
  pagination?: ServerPagination;
};

function getLateMinutes(record: Booking): number {
  if (record.status !== 'confirmed') return 0;
  const diff = Math.floor((Date.now() - new Date(record.startsAt).getTime()) / 60_000);
  return diff > 15 ? diff : 0;
}

export function BookingsList({
  bookings,
  onCancel,
  onStatus,
  title,
  action,
  accessToken,
  onReload,
  clientFilter,
  filterToolbar,
  hideHeader,
  pagination,
}: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();

  const [extendingBooking, setExtendingBooking] = useState<Booking | null>(null);
  const [extendingMinutes, setExtendingMinutes] = useState<number>(15);
  const [extendingLoading, setExtendingLoading] = useState(false);

  const [notesBooking, setNotesBooking] = useState<Booking | null>(null);
  const [notesText, setNotesText] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  const [followUpBooking, setFollowUpBooking] = useState<Booking | null>(null);
  const [followUpDays, setFollowUpDays] = useState<number>(7);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    const filtered = !clientFilter
      ? bookings
      : bookings.filter((b) => {
          const q = clientFilter.search?.trim().toLowerCase();
          if (q) {
            const matchName = b.patient.name.toLowerCase().includes(q);
            const matchPhone = b.patient.phone.toLowerCase().includes(q);
            const matchCode = b.code.toLowerCase().includes(q);
            if (!matchName && !matchPhone && !matchCode) return false;
          }
          if (clientFilter.dateFrom) {
            const d = dayjs(b.startsAt).format('YYYY-MM-DD');
            if (d < clientFilter.dateFrom) return false;
          }
          if (clientFilter.dateTo) {
            const d = dayjs(b.startsAt).format('YYYY-MM-DD');
            if (d > clientFilter.dateTo) return false;
          }
          return true;
        });

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? a.startsAt).getTime();
      const bTime = new Date(b.createdAt ?? b.startsAt).getTime();
      return bTime - aTime;
    });
  }, [bookings, clientFilter]);

  const handleExtend = async () => {
    if (!extendingBooking || !accessToken) return;
    setExtendingLoading(true);
    try {
      await extendBookingTime(accessToken, extendingBooking.code, extendingMinutes);
      message.success(tr(`Waktu perawatan diperpanjang +${extendingMinutes} mnt`, `Extended by +${extendingMinutes} min`));
      setExtendingBooking(null);
      onReload?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setExtendingLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesBooking || !accessToken) return;
    setNotesLoading(true);
    try {
      await updateClinicalNotes(accessToken, notesBooking.code, notesText);
      message.success(tr('Catatan klinis disimpan', 'Clinical notes saved'));
      setNotesBooking(null);
      onReload?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!followUpBooking || !accessToken) return;
    setFollowUpLoading(true);
    try {
      const targetDate = dayjs(followUpBooking.startsAt).add(followUpDays, 'day');
      const timeStr = dayjs(followUpBooking.startsAt).format('HH:mm');
      await createManualBooking(accessToken, {
        name: followUpBooking.patient.name,
        phone: followUpBooking.patient.phone,
        doctorId: followUpBooking.doctorId || '',
        serviceId: followUpBooking.serviceId || '',
        chairIndex: followUpBooking.chairIndex || undefined,
        parentBookingId: followUpBooking.code,
        complaint: tr(
          `Kontrol berkala setelah ${followUpDays} hari (dari kode ${followUpBooking.code})`,
          `Scheduled follow-up after ${followUpDays} days (from ${followUpBooking.code})`,
        ),
        startsAt: `${targetDate.format('YYYY-MM-DD')}T${timeStr}:00+07:00`,
      });
      message.success(tr('Jadwal kontrol berhasil dibuat', 'Follow-up appointment created'));
      setFollowUpBooking(null);
      onReload?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setFollowUpLoading(false);
    }
  };

  function renderPrimaryAction(record: Booking) {
    if (record.status === 'pending') {
      return (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onStatus(record.code, 'confirmed')}
        >
          {tr('Konfirmasi', 'Confirm')}
        </Button>
      );
    }
    if (record.status === 'confirmed') {
      return (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onStatus(record.code, 'arrived')}
        >
          {tr('Check-in', 'Check-in')}
        </Button>
      );
    }
    if (record.status === 'arrived') {
      return (
        <Button
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => onStatus(record.code, 'in_chair')}
        >
          {tr('Mulai', 'Start')}
        </Button>
      );
    }
    if (record.status === 'in_chair') {
      return (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onStatus(record.code, 'completed')}
        >
          {tr('Selesai', 'Complete')}
        </Button>
      );
    }
    if (record.status === 'completed' && accessToken) {
      return (
        <Button
          size="small"
          icon={<CalendarOutlined />}
          onClick={() => {
            setFollowUpBooking(record);
            setFollowUpDays(7);
          }}
        >
          {tr('Kontrol', 'Follow-up')}
        </Button>
      );
    }
    return null;
  }

  function buildOverflowItems(record: Booking): MenuProps['items'] {
    const items: MenuProps['items'] = [];

    if (record.status === 'in_chair' && accessToken) {
      items.push({
        key: 'extend',
        icon: <FieldTimeOutlined />,
        label: tr('Perpanjang waktu (+15/+30/+45 mnt)', 'Extend time'),
        onClick: () => {
          setExtendingBooking(record);
          setExtendingMinutes(15);
        },
      });
    }

    if ((record.status === 'in_chair' || record.status === 'completed') && accessToken) {
      items.push({
        key: 'notes',
        icon: <EditOutlined />,
        label: tr('Catatan klinis dokter', 'Clinical notes'),
        onClick: () => {
          setNotesBooking(record);
          setNotesText(record.notes || '');
        },
      });
    }

    if (record.status === 'confirmed') {
      items.push({
        key: 'no_show',
        icon: <StopOutlined />,
        label: tr('Tandai Tidak Hadir', 'Mark No-show'),
        onClick: () => onStatus(record.code, 'no_show'),
      });
    }

    if (record.status !== 'completed' && record.status !== 'cancelled' && record.status !== 'no_show') {
      if (items.length > 0) items.push({ type: 'divider' });
      items.push({
        key: 'cancel',
        icon: <CloseOutlined />,
        danger: true,
        label: tr('Batalkan janji temu', 'Cancel appointment'),
        onClick: () => setCancelTarget(record),
      });
    }

    return items;
  }

  const columns: ColumnsType<Booking> = [
    {
      title: tr('Jadwal & Kode', 'Schedule & Code'),
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 155,
      sorter: (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      render: (_value: string, record) => {
        return (
          <div className="booking-schedule-cell">
            <div className="booking-schedule-cell__top">
              <strong>{formatTimeOnly(record.startsAt)}</strong>
              <span className="booking-schedule-cell__day">{formatDayGroup(record.startsAt)}</span>
            </div>
            <div className="booking-schedule-cell__meta">
              <Typography.Text type="secondary" code style={{ fontSize: 11 }}>
                {record.code}
              </Typography.Text>
              {record.chairIndex ? (
                <Tag style={{ margin: 0, fontSize: 11 }}>
                  {tr(`Kursi ${record.chairIndex}`, `Chair ${record.chairIndex}`)}
                </Tag>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      title: tr('Pasien', 'Patient'),
      key: 'patient',
      render: (_, record) => {
        const pendingPhone = isPendingPhone(record.patient.phone);
        const notePreview = record.complaint || record.notes || '';
        return (
          <div className="booking-patient-cell">
            <div className="booking-patient-cell__head">
              <strong>{record.patient.name}</strong>
              {record.patientType === 'new' && (
                <Tooltip title={tr('Pasien baru', 'New patient')}>
                  <span className="booking-new-dot" aria-label={tr('Pasien baru', 'New patient')}>
                    {tr('Baru', 'New')}
                  </span>
                </Tooltip>
              )}
              {(record.patient.noShowCount ?? 0) > 0 && (
                <Tooltip title={tr(`Riwayat tidak hadir ${record.patient.noShowCount} kali`, `${record.patient.noShowCount} previous no-shows`)}>
                  <Tag className="admin-tag admin-tag--danger" style={{ fontSize: 11 }}>
                    {record.patient.noShowCount}× {tr('Absen', 'No-show')}
                  </Tag>
                </Tooltip>
              )}
            </div>
            <div className={`booking-patient-cell__phone${pendingPhone ? ' is-pending' : ''}`}>
              {formatPhone(record.patient.phone)}
            </div>
            {notePreview && (
              <Tooltip title={notePreview}>
                <div className="booking-patient-cell__note">{notePreview}</div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: tr('Dokter & Layanan', 'Doctor & Service'),
      key: 'doctorService',
      width: 210,
      render: (_, record) => (
        <div className="booking-service-cell">
          <div className="booking-service-cell__doctor">{record.doctor}</div>
          <div className="booking-service-cell__service">
            <span>{record.service}</span>
            {record.serviceDuration ? <span> · {record.serviceDuration} {tr('mnt', 'min')}</span> : null}
          </div>
          {record.parentBookingId && (
            <Tag className="admin-tag admin-tag--brand" style={{ marginTop: 2, fontSize: 11 }}>
              {tr('Kontrol', 'Follow-up')}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: tr('Status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 175,
      render: (status: Booking['status'], record) => {
        const lateMinutes = getLateMinutes(record);
        return (
          <AdminStatusBadge
            status={status}
            overdueLabel={lateMinutes > 0 ? formatLateDuration(lateMinutes) : undefined}
          />
        );
      },
    },
    {
      title: tr('Aksi', 'Actions'),
      key: 'actions',
      width: 165,
      align: 'right',
      render: (_, record) => {
        const primary = renderPrimaryAction(record);
        const overflowItems = buildOverflowItems(record);
        return (
          <Space size={6} className="booking-actions-cell">
            {primary}
            {overflowItems && overflowItems.length > 0 && (
              <Dropdown menu={{ items: overflowItems }} trigger={['click']} placement="bottomRight">
                <Button
                  size="small"
                  icon={<MoreOutlined />}
                  aria-label={tr(`Aksi lainnya untuk ${record.patient.name}`, `More actions for ${record.patient.name}`)}
                />
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  const renderMobileCard = (record: Booking) => {
    const lateMinutes = getLateMinutes(record);
    const pendingPhone = isPendingPhone(record.patient.phone);
    const primary = renderPrimaryAction(record);
    const overflowItems = buildOverflowItems(record);

    return (
      <div className={`admin-mobile-card${lateMinutes > 0 ? ' is-overdue' : ''}`}>
        <div className="admin-mobile-card__top">
          <div>
            <strong>{record.patient.name}</strong>
            <div className={`booking-patient-cell__phone${pendingPhone ? ' is-pending' : ''}`}>
              {formatPhone(record.patient.phone)}
            </div>
          </div>
          <AdminStatusBadge
            status={record.status}
            overdueLabel={lateMinutes > 0 ? formatLateDuration(lateMinutes) : undefined}
          />
        </div>
        <div className="admin-mobile-card__meta">
          <span>
            <ClockCircleOutlined /> {formatDayGroup(record.startsAt)}, {formatTimeOnly(record.startsAt)}
          </span>
          <span>{record.doctor} · {record.service}</span>
        </div>
        <div className="admin-mobile-card__actions">
          {primary}
          {overflowItems && overflowItems.length > 0 && (
            <Dropdown menu={{ items: overflowItems }} trigger={['click']} placement="bottomRight">
              <Button
                size="small"
                icon={<MoreOutlined />}
                aria-label={tr(`Aksi lainnya untuk ${record.patient.name}`, `More actions for ${record.patient.name}`)}
              >
                {tr('Lainnya', 'More')}
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    );
  };

  return (
    <section aria-label={title || tr('Daftar Janji Temu', 'Appointments List')}>
      {!hideHeader && (
        <AdminPageHeader
          title={title || tr('Daftar Janji Temu', 'Appointments')}
          description={tr(
            'Kelola konfirmasi, kedatangan pasien, dan antrean kursi perawatan.',
            'Manage confirmations, patient check-ins, and dental chair queue.',
          )}
          meta={`${pagination?.total ?? filteredBookings.length} ${tr('janji temu', 'appointments')}`}
          showTimezone
          actions={action}
        />
      )}

      {filterToolbar}

      <AdminTable<Booking>
        rowKey="code"
        columns={columns}
        dataSource={filteredBookings}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        rowClassName={(record) => (getLateMinutes(record) > 0 ? 'admin-table-row--overdue' : '')}
        renderMobileCard={renderMobileCard}
        emptyTitle={tr('Tidak ada janji temu', 'No appointments found')}
        emptyDescription={tr(
          'Belum ada janji temu yang sesuai dengan filter atau jadwal saat ini.',
          'No appointments match the current filter or schedule.',
        )}
      />

      {/* Cancel confirmation dialog */}
      <Modal
        open={Boolean(cancelTarget)}
        title={tr('Batalkan Janji Temu?', 'Cancel Appointment?')}
        okText={tr('Ya, Batalkan', 'Yes, Cancel')}
        cancelText={tr('Kembali', 'Back')}
        okButtonProps={{ danger: true }}
        onCancel={() => setCancelTarget(null)}
        onOk={() => {
          if (cancelTarget) {
            onCancel(cancelTarget.code);
            setCancelTarget(null);
          }
        }}
      >
        <p>
          {tr(
            `Anda yakin ingin membatalkan janji temu atas nama ${cancelTarget?.patient.name ?? ''} (${cancelTarget?.code ?? ''})? Tindakan ini tidak dapat dibatalkan.`,
            `Are you sure you want to cancel the appointment for ${cancelTarget?.patient.name ?? ''} (${cancelTarget?.code ?? ''})? This action cannot be undone.`,
          )}
        </p>
      </Modal>

      {/* Extend Chair Time Modal */}
      <Modal
        open={Boolean(extendingBooking)}
        title={
          <Space>
            <FieldTimeOutlined />
            <span>{tr(`Perpanjang Waktu Perawatan (${extendingBooking?.code ?? ''})`, `Extend Treatment Time (${extendingBooking?.code ?? ''})`)}</span>
          </Space>
        }
        onCancel={() => setExtendingBooking(null)}
        onOk={() => void handleExtend()}
        confirmLoading={extendingLoading}
        okText={tr('Simpan Perpanjangan', 'Confirm Extension')}
        cancelText={tr('Tutup', 'Close')}
      >
        <p style={{ marginBottom: 16 }}>
          {tr(
            'Prosedur memerlukan waktu tambahan? Sistem akan memperpanjang durasi pemakaian kursi dan menyesuaikan jadwal sterilisasi.',
            'Need extra time for the procedure? Chair occupancy and sterilization turnover will be updated automatically.',
          )}
        </p>
        <Radio.Group
          value={extendingMinutes}
          onChange={(e) => setExtendingMinutes(e.target.value)}
          buttonStyle="solid"
          style={{ width: '100%', display: 'flex', gap: 8 }}
        >
          <Radio.Button value={15} style={{ flex: 1, textAlign: 'center' }}>
            +15 {tr('menit', 'min')}
          </Radio.Button>
          <Radio.Button value={30} style={{ flex: 1, textAlign: 'center' }}>
            +30 {tr('menit', 'min')}
          </Radio.Button>
          <Radio.Button value={45} style={{ flex: 1, textAlign: 'center' }}>
            +45 {tr('menit', 'min')}
          </Radio.Button>
        </Radio.Group>
      </Modal>

      {/* Clinical Notes Modal */}
      <Modal
        open={Boolean(notesBooking)}
        title={
          <Space>
            <EditOutlined />
            <span>{tr(`Catatan Klinis Dokter (${notesBooking?.code ?? ''})`, `Clinical Notes (${notesBooking?.code ?? ''})`)}</span>
          </Space>
        }
        onCancel={() => setNotesBooking(null)}
        onOk={() => void handleSaveNotes()}
        confirmLoading={notesLoading}
        okText={tr('Simpan Catatan', 'Save Notes')}
        cancelText={tr('Tutup', 'Close')}
      >
        <p style={{ marginBottom: 8 }}>
          {tr(
            'Catat hasil pemeriksaan, resep, atau instruksi perawatan pasca-tindakan untuk pasien ini:',
            'Record diagnosis, prescribed medication, or post-treatment care instructions:',
          )}
        </p>
        <Input.TextArea
          rows={4}
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder={tr(
            'Contoh: Gigi 46 sudah dilakukan perawatan saluran akar sementara, hindari makanan keras 2 hari, kontrol 7 hari lagi.',
            'e.g. Tooth 46 root canal medicated, avoid hard food for 2 days, follow up in 7 days.',
          )}
        />
      </Modal>

      {/* Follow-up Protocol Modal */}
      <Modal
        open={Boolean(followUpBooking)}
        title={
          <Space>
            <CalendarOutlined />
            <span>{tr('Jadwalkan Kontrol Berkala (Follow-up)', 'Schedule Follow-up Appointment')}</span>
          </Space>
        }
        onCancel={() => setFollowUpBooking(null)}
        onOk={() => void handleCreateFollowUp()}
        confirmLoading={followUpLoading}
        okText={tr('Buat Jadwal Kontrol', 'Schedule Follow-up')}
        cancelText={tr('Lewati', 'Skip')}
      >
        <p style={{ marginBottom: 16 }}>
          {tr('Perawatan pasien', 'Treatment for patient')}{' '}
          <strong>{followUpBooking?.patient.name}</strong>{' '}
          {tr('telah selesai. Pilih jadwal kontrol berikutnya:', 'is complete. Select the recommended follow-up interval:')}
        </p>
        <Radio.Group
          value={followUpDays}
          onChange={(e) => setFollowUpDays(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <Radio value={7}>
            <strong>{tr('7 hari lagi', 'In 7 days')}</strong> ({dayjs(followUpBooking?.startsAt).add(7, 'day').format('DD/MM/YYYY')}): {tr('Angkat jahitan / Evaluasi jaringan gusi', 'Suture removal / Gum evaluation')}
          </Radio>
          <Radio value={14}>
            <strong>{tr('14 hari lagi', 'In 14 days')}</strong> ({dayjs(followUpBooking?.startsAt).add(14, 'day').format('DD/MM/YYYY')}): {tr('Tambal permanen / Uji mahkota gigi', 'Permanent filling / Crown try-in')}
          </Radio>
          <Radio value={30}>
            <strong>{tr('30 hari lagi', 'In 30 days')}</strong> ({dayjs(followUpBooking?.startsAt).add(30, 'day').format('DD/MM/YYYY')}): {tr('Kontrol behel / Penyesuaian kawat', 'Orthodontic check / Wire adjustment')}
          </Radio>
          <Radio value={180}>
            <strong>{tr('6 bulan lagi', 'In 6 months')}</strong> ({dayjs(followUpBooking?.startsAt).add(180, 'day').format('DD/MM/YYYY')}): {tr('Pemeriksaan rutin & pembersihan karang gigi', 'Routine dental check-up & scaling')}
          </Radio>
        </Radio.Group>
      </Modal>
    </section>
  );
}
