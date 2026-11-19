import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import luxonPlugin from '@fullcalendar/luxon3';
import { ReloadOutlined } from '@ant-design/icons';
import { eventClass, loadCalendarEvents } from './calendar-events';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import type { EventClickArg, EventContentArg, EventSourceFunc } from '@fullcalendar/core';
import { Alert, Button, Card, Dropdown, Modal, Popconfirm, Space, Spin, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteTimeOff, extendBookingTime, updateBookingStatus, type Booking, type TimeOff } from '../../api/admin-api';
import { currentLocale, timeZone, formatDateTime, formatPhone, statusText, tr, useAdminTranslation } from '../../i18n';
import { AdminPageHeader } from '../../components/ui';

type Props = { accessToken: string };

export function CalendarPanel({ accessToken }: Props) {
  useAdminTranslation();
  const [selected, setSelected] = useState<Booking>();
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOff>();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const calendar = useRef<FullCalendar>(null);
  const token = useRef(accessToken);
  token.current = accessToken;
  const busy = useRef(false);
  const mounted = useRef(true);
  const fetchSequence = useRef(0);

  const events = useCallback<EventSourceFunc>((range, success, failure) => {
    const sequence = ++fetchSequence.current;
    setError('');
    void loadCalendarEvents(token.current, range.start, range.end)
      .then((data) => {
        if (!mounted.current) return;
        success(data);
      })
      .catch((cause: unknown) => {
        if (!mounted.current) return;
        const error = cause instanceof Error ? cause : new Error(String(cause));
        if (sequence === fetchSequence.current) setError(error.message);
        failure(error);
      });
  }, []);

  const reload = useCallback(() => {
    if (!busy.current) calendar.current?.getApi().refetchEvents();
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleStatusChange(
    status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show',
    options?: { chairIndex?: number },
  ) {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      await updateBookingStatus(token.current, selected.code, status, options);
      setSelected(undefined);
      reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleExtend(minutes: number) {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      await extendBookingTime(token.current, selected.code, minutes);
      setSelected(undefined);
      reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteTimeOff(id: string) {
    setUpdating(true);
    try {
      await deleteTimeOff(token.current, id);
      setSelectedTimeOff(undefined);
      reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  const onEventClick = ({ event }: EventClickArg) => {
    if (event.extendedProps.type === 'time_off') {
      setSelectedTimeOff(event.extendedProps.timeOff as TimeOff);
    } else {
      setSelected(event.extendedProps.booking as Booking);
    }
  };

  const renderEvent = ({ event, timeText }: EventContentArg) => {
    if (event.extendedProps.type === 'time_off') {
      const timeOff = event.extendedProps.timeOff as TimeOff;
      const doctorName = timeOff.doctor?.name ?? tr('Seluruh klinik', 'Entire clinic');
      return (
        <Tooltip
          title={
            <div className="calendar-event-tooltip">
              <strong>🏖️ {tr('Jadwal Libur Dokter', 'Doctor Time Off')}</strong>
              <span>{tr('Dokter', 'Doctor')}: {doctorName}</span>
              <span>
                {tr('Waktu', 'Time')}: {formatDateTime(timeOff.startsAt)} – {formatDateTime(timeOff.endsAt)}
              </span>
              <span>{tr('Alasan', 'Reason')}: {timeOff.reason ?? '—'}</span>
            </div>
          }
        >
          <div className="calendar-event-hover-area">
            <div className="calendar-event-content calendar-event-content--time-off">
              <time>{timeText}</time>
              <strong>🏖️ {doctorName}</strong>
              <span>{timeOff.reason || tr('Libur / Cuti', 'On leave')}</span>
            </div>
          </div>
        </Tooltip>
      );
    }

    const booking = event.extendedProps.booking as Booking;
    return (
      <Tooltip
        title={
          <div className="calendar-event-tooltip">
            <strong>{booking.patient.name}</strong>
            <span>
              {formatDateTime(booking.startsAt)} –{' '}
              {new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).format(new Date(booking.endsAt))}
            </span>
            <span>{tr('Dokter', 'Doctor')}: {booking.doctor}</span>
            <span>{tr('Layanan', 'Service')}: {booking.service}</span>
            {booking.chairIndex && (
              <span>
                {tr('Kursi', 'Chair')}: 💺 {booking.chairIndex}
              </span>
            )}
            <span>{tr('Telepon', 'Phone')}: {formatPhone(booking.patient.phone)}</span>
            <span>{tr('Status', 'Status')}: {statusText(booking.status)}</span>
            <span>{tr('Kode', 'Code')}: {booking.code}</span>
          </div>
        }
      >
        <div className="calendar-event-hover-area">
          <div className="calendar-event-content">
            <time>{timeText}</time>
            <strong>
              {booking.chairIndex ? `[K${booking.chairIndex}] ` : ''}
              {booking.patient.name} / {booking.doctor}
            </strong>
          </div>
        </div>
      </Tooltip>
    );
  };


  return (
    <section className="calendar-page" aria-label={tr('Kalender janji temu', 'Appointment calendar')}>
      <AdminPageHeader
        title={tr('Kalender Janji Temu', 'Appointment Calendar')}
        description={tr(
          'Pantau jadwal dokter, ketersediaan kursi perawatan, dan hari libur.',
          'Track doctor schedules, chair availability, and clinic time-offs.',
        )}
        meta={loading ? tr('Memuat…', 'Loading…') : `${count} ${tr('jadwal', 'events')}`}
        showTimezone
        actions={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={reload}>
            {tr('Muat ulang', 'Refresh')}
          </Button>
        }
      />
      {error && <Alert className="mb-4" type="error" showIcon message={error} />}
      <Card className="calendar-card">
        {!loading && !error && count === 0 && (
          <Alert
            className="calendar-empty-note"
            type="info"
            showIcon
            message={tr(
              'Belum ada janji temu pada periode ini. Pilih minggu lain untuk melihat jadwal berikutnya.',
              'No appointments in this period. Choose another week to see upcoming bookings.',
            )}
          />
        )}
        <div className="calendar-legend" aria-label={tr('Status janji temu', 'Appointment status')}>
          {(['pending', 'confirmed', 'arrived', 'in_chair', 'completed', 'cancelled', 'no_show'] as const).map(
            (status) => (
              <span key={status} className={`calendar-legend__item calendar-legend__item--${eventClass[status]}`}>
                <i />
                {statusText(status)}
              </span>
            ),
          )}
          <span className="calendar-legend__item calendar-legend__item--time-off">
            <i />
            {tr('Libur / Cuti', 'Time off')}
          </span>
        </div>
        <Spin spinning={loading} tip={tr('Memuat jadwal kalender…', 'Loading calendar schedule…')}>
          <FullCalendar
            ref={calendar}
            plugins={[timeGridPlugin, interactionPlugin, luxonPlugin]}
            timeZone={timeZone}
            locales={[idLocale]}
            locale={currentLocale()}
            initialView="timeGridWeek"
            firstDay={1}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
            buttonText={{ today: tr('Hari ini', 'Today'), week: tr('Minggu', 'Week'), day: tr('Hari', 'Day') }}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            scrollTime="08:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            height={720}
            expandRows
            nowIndicator
            eventMinHeight={28}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            loading={(next) => {
              busy.current = next;
              setLoading(next);
            }}
            events={events}
            eventsSet={(next) => setCount(next.length)}
            eventClick={onEventClick}
            eventContent={renderEvent}
          />
        </Spin>
      </Card>
      <Modal
        className="calendar-booking-modal"
        title={tr('Detail janji temu klinis', 'Clinical appointment details')}
        open={Boolean(selected)}
        onCancel={() => {
          if (!updating) setSelected(undefined);
        }}
        footer={
          <Space wrap>
            <Button disabled={updating} onClick={() => setSelected(undefined)}>
              {tr('Tutup', 'Close')}
            </Button>
            {selected?.status === 'pending' && (
              <Button
                type="primary"
                loading={updating}
                onClick={() => void handleStatusChange('confirmed')}
              >
                {tr('Konfirmasi Janji Temu', 'Confirm')}
              </Button>
            )}
            {selected?.status === 'confirmed' && (
              <Button
                style={{ borderColor: 'var(--brand-100)', color: 'var(--brand-700)', background: 'var(--brand-50)' }}
                loading={updating}
                onClick={() => void handleStatusChange('arrived')}
              >
                {tr('Pasien Sudah Hadir (Check-in)', 'Patient Arrived')}
              </Button>
            )}
            {selected?.status === 'arrived' && (
              <Dropdown
                menu={{
                  items: [
                    { key: '1', label: tr('Mulai di Kursi 1', 'Start in Chair 1'), onClick: () => void handleStatusChange('in_chair', { chairIndex: 1 }) },
                    { key: '2', label: tr('Mulai di Kursi 2', 'Start in Chair 2'), onClick: () => void handleStatusChange('in_chair', { chairIndex: 2 }) },
                    { key: '3', label: tr('Mulai di Kursi 3', 'Start in Chair 3'), onClick: () => void handleStatusChange('in_chair', { chairIndex: 3 }) },
                  ],
                }}
              >
                <Button type="primary" loading={updating}>
                  {tr('Naik Kursi Perawatan ▾', 'Move to Chair ▾')}
                </Button>
              </Dropdown>
            )}
            {selected?.status === 'in_chair' && (
              <>
                <Dropdown
                  menu={{
                    items: [
                      { key: '15', label: tr('+15 Menit', '+15 Mins'), onClick: () => void handleExtend(15) },
                      { key: '30', label: tr('+30 Menit', '+30 Mins'), onClick: () => void handleExtend(30) },
                      { key: '45', label: tr('+45 Menit', '+45 Mins'), onClick: () => void handleExtend(45) },
                    ],
                  }}
                >
                  <Button loading={updating}>
                    {tr('Tambah Waktu ▾', 'Extend Time ▾')}
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  loading={updating}
                  onClick={() => void handleStatusChange('completed')}
                >
                  {tr('Tindakan Selesai', 'Complete Treatment')}
                </Button>
              </>
            )}
          </Space>
        }
      >
        {selected && (
          <div className="calendar-booking-detail" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected.status === 'confirmed' && Date.now() - new Date(selected.startsAt).getTime() > 15 * 60 * 1000 && (
              <Alert
                type="warning"
                showIcon
                message={
                  <span>
                    <strong>{tr('Peringatan Keterlambatan: ', 'Late Arrival Warning: ')}</strong>
                    {tr(
                      `Pasien terlambat ${Math.floor((Date.now() - new Date(selected.startsAt).getTime()) / 60000)} menit melebihi batas waktu toleransi 15 menit.`,
                      `Patient is ${Math.floor((Date.now() - new Date(selected.startsAt).getTime()) / 60000)} minutes past the 15-minute grace period.`,
                    )}
                  </span>
                }
              />
            )}
            <div>
              <span>{tr('Waktu', 'Time')}</span>
              <strong>{formatDateTime(selected.startsAt)}</strong>
            </div>
            <div>
              <span>{tr('Pasien', 'Patient')}</span>
              <strong>{selected.patient.name}</strong>
              <small>{formatPhone(selected.patient.phone)}</small>
            </div>
            <div>
              <span>{tr('Dokter', 'Doctor')}</span>
              <strong>{selected.doctor}</strong>
            </div>
            <div>
              <span>{tr('Layanan', 'Service')}</span>
              <strong>{selected.service}</strong>
              {selected.requiresConsultation && (
                <Tag className="admin-tag admin-tag--warning" style={{ marginLeft: 8 }}>
                  {tr('Wajib Konsultasi Awal', 'Triage Required')}
                </Tag>
              )}
            </div>
            {selected.chairIndex && (
              <div>
                <span>{tr('Kursi Gigi', 'Dental Chair')}</span>
                <Tag className="admin-tag admin-tag--info">{tr(`Kursi ${selected.chairIndex}`, `Chair ${selected.chairIndex}`)}</Tag>
              </div>
            )}
            {selected.complaint && (
              <div>
                <span>{tr('Keluhan Klinis', 'Clinical Complaint')}</span>
                <em>&ldquo;{selected.complaint}&rdquo;</em>
              </div>
            )}
            <div>
              <span>{tr('Status', 'Status')}</span>
              <Tag className={`calendar-status calendar-status--${eventClass[selected.status] ?? 'pending'}`}>
                {statusText(selected.status)}
              </Tag>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={tr('Jadwal Libur Dokter', 'Doctor Time Off')}
        open={Boolean(selectedTimeOff)}
        onCancel={() => setSelectedTimeOff(undefined)}
        footer={
          selectedTimeOff ? (
            <Space>
              <Popconfirm
                title={tr('Hapus jadwal libur ini?', 'Delete this time off?')}
                okText={tr('Hapus', 'Delete')}
                cancelText={tr('Batal', 'Cancel')}
                onConfirm={() => void handleDeleteTimeOff(selectedTimeOff.id)}
              >
                <Button danger loading={updating}>
                  {tr('Hapus Jadwal Libur', 'Delete Time Off')}
                </Button>
              </Popconfirm>
              <Button onClick={() => setSelectedTimeOff(undefined)}>
                {tr('Tutup', 'Close')}
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedTimeOff && (
          <div className="calendar-booking-detail">
            <div>
              <span>{tr('Dokter', 'Doctor')}</span>
              <strong>{selectedTimeOff.doctor?.name ?? tr('Seluruh klinik', 'Entire clinic')}</strong>
            </div>
            <div>
              <span>{tr('Waktu Mulai', 'Start Time')}</span>
              <strong>{formatDateTime(selectedTimeOff.startsAt)}</strong>
            </div>
            <div>
              <span>{tr('Waktu Selesai', 'End Time')}</span>
              <strong>{formatDateTime(selectedTimeOff.endsAt)}</strong>
            </div>
            <div>
              <span>{tr('Alasan Libur', 'Reason')}</span>
              <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                {selectedTimeOff.reason || tr('Tidak ada keterangan alasan.', 'No reason provided.')}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
