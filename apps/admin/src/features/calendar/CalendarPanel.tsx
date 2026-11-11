import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import luxonPlugin from '@fullcalendar/luxon3';
import { ReloadOutlined } from '@ant-design/icons';
import { eventClass, loadCalendarEvents } from './calendar-events';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import type { EventClickArg, EventContentArg, EventSourceFunc } from '@fullcalendar/core';
import { Alert, Button, Card, Modal, Space, Spin, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { updateBookingStatus, type Booking } from '../../api/admin-api';
import { currentLocale, timeZone, formatDateTime, formatPhone, statusText, tr, useAdminTranslation } from '../../i18n';

type Props = { accessToken: string };

export function CalendarPanel({ accessToken }: Props) {
  useAdminTranslation();
  const [selected, setSelected] = useState<Booking>();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
    void loadCalendarEvents(token.current, range.start, range.end).then((data) => {
      if (!mounted.current) return;
      success(data);
    }).catch((cause: unknown) => {
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
    const refreshVisible = () => { if (document.visibilityState === 'visible') reload(); };
    const interval = setInterval(refreshVisible, 30_000);
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => { mounted.current = false; clearInterval(interval); window.removeEventListener('focus', refreshVisible); document.removeEventListener('visibilitychange', refreshVisible); };
  }, [reload]);
  async function confirm() {
    if (!selected || confirming) return;
    setConfirming(true);
    try { await updateBookingStatus(token.current, selected.code, 'confirmed'); setSelected(undefined); reload(); }
    catch (cause) { setError((cause as Error).message); }
    finally { setConfirming(false); }
  }
  const onEventClick = ({ event }: EventClickArg) => setSelected(event.extendedProps.booking as Booking);
  const renderEvent = ({ event, timeText }: EventContentArg) => {
    const booking = event.extendedProps.booking as Booking;
    return <Tooltip title={<div className="calendar-event-tooltip"><strong>{booking.patient.name}</strong><span>{formatDateTime(booking.startsAt)} – {new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(booking.endsAt))}</span><span>{tr('Dokter', 'Doctor')}: {booking.doctor}</span><span>{tr('Layanan', 'Service')}: {booking.service}</span><span>{tr('Telepon', 'Phone')}: {formatPhone(booking.patient.phone)}</span><span>{tr('Status', 'Status')}: {statusText(booking.status)}</span><span>{tr('Kode', 'Code')}: {booking.code}</span></div>}><div className="calendar-event-hover-area"><div className="calendar-event-content"><time>{timeText}</time><strong>{booking.patient.name} / {booking.doctor}</strong></div></div></Tooltip>;
  };

  return <section className="calendar-page" aria-label={tr('Kalender janji temu', 'Appointment calendar')}>
    {error && <Alert className="mb-4" type="error" showIcon message={error} />}
    <Card className="calendar-card">
      <div className="calendar-sync-bar"><span role="status">{loading ? <Space><Spin size="small" />{tr('Memuat jadwal…', 'Loading appointments…')}</Space> : tr(`${count} janji temu dalam periode ini · WIB (UTC+7)`, `${count} appointments in this period · WIB (UTC+7)`)}</span><Button icon={<ReloadOutlined />} loading={loading} onClick={reload}>{tr('Muat ulang', 'Refresh')}</Button></div>
      {!loading && !error && count === 0 && <Alert className="calendar-empty-note" type="info" showIcon message={tr('Belum ada janji temu pada periode ini. Pilih minggu lain untuk melihat jadwal berikutnya.', 'No appointments in this period. Choose another week to see upcoming bookings.')} />}
      <div className="calendar-legend" aria-label={tr('Status janji temu', 'Appointment status')}>
        {(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map((status) => <span key={status} className={`calendar-legend__item calendar-legend__item--${eventClass[status]}`}><i />{statusText(status)}</span>)}
      </div>
      <FullCalendar ref={calendar} plugins={[timeGridPlugin, interactionPlugin, luxonPlugin]} timeZone={timeZone} locales={[idLocale]} locale={currentLocale()} initialView="timeGridWeek" firstDay={1} headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }} buttonText={{ today: tr('Hari ini', 'Today') }} allDaySlot={false} slotMinTime="07:00:00" slotMaxTime="19:00:00" scrollTime="07:00:00" slotDuration="00:30:00" slotLabelInterval="01:00" height={720} expandRows nowIndicator eventMinHeight={28} eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }} loading={(next) => { busy.current = next; setLoading(next); }} events={events} eventsSet={(next) => setCount(next.length)} eventClick={onEventClick} eventContent={renderEvent} />
    </Card>
    <Modal className="calendar-booking-modal" title={tr('Detail janji temu', 'Appointment details')} open={Boolean(selected)} onCancel={() => { if (!confirming) setSelected(undefined); }} footer={selected?.status === 'pending' ? <Space><Button disabled={confirming} onClick={() => setSelected(undefined)}>{tr('Tutup', 'Close')}</Button><Button type="primary" loading={confirming} onClick={() => void confirm()}>{tr('Konfirmasi janji temu', 'Confirm appointment')}</Button></Space> : <Button onClick={() => setSelected(undefined)}>{tr('Tutup', 'Close')}</Button>}>
      {selected && <div className="calendar-booking-detail"><div><span>{tr('Waktu', 'Time')}</span><strong>{formatDateTime(selected.startsAt)}</strong></div><div><span>{tr('Pasien', 'Patient')}</span><strong>{selected.patient.name}</strong><small>{formatPhone(selected.patient.phone)}</small></div><div><span>{tr('Dokter', 'Doctor')}</span><strong>{selected.doctor}</strong></div><div><span>{tr('Layanan', 'Service')}</span><strong>{selected.service}</strong></div><div><span>{tr('Status', 'Status')}</span><Tag className={`calendar-status calendar-status--${eventClass[selected.status] ?? 'pending'}`}>{statusText(selected.status)}</Tag></div></div>}
    </Modal>
  </section>;
}
