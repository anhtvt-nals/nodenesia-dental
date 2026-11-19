import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../i18n';
import { Doctor, BookingSlot, DoctorTimeOff } from '../../types';
import { formatDateSummary } from '../../lib/utils';

export interface WhitebloomBookingProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  doctors: Doctor[];
  clinicTimeOffs?: DoctorTimeOff[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  slots: BookingSlot[];
  loadingSlots: boolean;
  onContinue: () => void;
  onBack?: () => void;
  serviceName?: string;
}

function isDateOverlapping(dateStr: string, startsAt: string, endsAt: string): boolean {
  if (!dateStr || !startsAt || !endsAt) return false;
  // dateStr format: YYYY-MM-DD in clinic timezone (+07:00)
  const dayStart = new Date(`${dateStr}T00:00:00+07:00`).getTime();
  const dayEnd = new Date(`${dateStr}T23:59:59.999+07:00`).getTime();
  const toStart = new Date(startsAt).getTime();
  const toEnd = new Date(endsAt).getTime();
  return toStart <= dayEnd && toEnd >= dayStart;
}

export const WhitebloomBookingModal: React.FC<WhitebloomBookingProps> = ({
  isOpen = true,
  onClose,
  embedded = false,
  doctors,
  clinicTimeOffs = [],
  selectedDate,
  onSelectDate,
  selectedDoctorId,
  onSelectDoctor,
  selectedTime,
  onSelectTime,
  slots,
  loadingSlots,
  onContinue,
  onBack,
  serviceName,
}) => {
  const { lang } = useI18n();

  // Calendar view state: Year & Month
  const initialDateObj = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDateObj.getMonth()); // 0-indexed
  const [doctorGenderFilter, setDoctorGenderFilter] = useState<'all' | 'female' | 'male'>('all');

  // Keep calendar view in sync when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  if (!isOpen && !embedded) return null;

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthName = lang === 'en' ? monthNamesEn[viewMonth] : monthNamesId[viewMonth];

  // Navigate calendar month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days grid (Mon - Sun)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  const daysGrid: Array<{ dayNum: number; dateStr: string; isPast: boolean; isSunday: boolean } | null> = [];
  for (let i = 0; i < startingDay; i++) {
    daysGrid.push(null);
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let d = 1; d <= totalDays; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    const dateObj = new Date(viewYear, viewMonth, d);
    const isSunday = dateObj.getDay() === 0;
    const isPast = dateStr < todayStr;

    daysGrid.push({
      dayNum: d,
      dateStr,
      isPast,
      isSunday,
    });
  }

  // Selected date formatted for title
  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();
  const selectedDayNum = selectedDateObj.getDate();
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const formattedSelectedHeader = lang === 'en'
    ? `${monthNamesEn[selectedDateObj.getMonth()]} ${getOrdinal(selectedDayNum)}`
    : `${selectedDayNum} ${monthNamesId[selectedDateObj.getMonth()]}`;

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const cardContent = (
    <div className={`relative w-full bg-surface text-secondary rounded-3xl border border-border overflow-hidden ${
      embedded ? 'p-6 sm:p-8 shadow-soft' : 'my-auto max-w-[940px] shadow-floating p-6 sm:p-9'
    }`}>
      {/* Close Button (modal mode only) */}
      {!embedded && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'en' ? 'Close dialog' : 'Tutup dialog'}
          className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-secondary hover:bg-bg-alt transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Header Prompt */}
      <div className="text-center mb-8 pr-4 pl-4">
        <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-1.5">
          {lang === 'en' ? 'STEP 02 / DOCTOR & SCHEDULE' : 'LANGKAH 02 / DOKTER & JADWAL'}
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-secondary tracking-tight">
          {lang === 'en' ? 'Select a convenient date and doctor' : 'Pilih tanggal kunjungan dan dokter spesialis'}
        </h2>
        {serviceName && (
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            {lang === 'en' ? 'Selected Treatment: ' : 'Layanan Dipilih: '}
            <strong className="text-primary font-bold">{serviceName}</strong>
          </p>
        )}
      </div>

      {/* 2-Column Split: Calendar (Left) & Doctor/Slots (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-7 lg:gap-9 items-start">
        {/* Left Column: Calendar Picker with Legend */}
        <div className="bg-bg-alt/70 p-5 sm:p-6 rounded-2xl border border-border">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-3.5 mb-4 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span>{lang === 'en' ? 'Closed' : 'Tutup'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-surface border border-border" />
              <span>{lang === 'en' ? 'Available' : 'Tersedia'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-primary font-bold">{lang === 'en' ? 'Selected' : 'Dipilih'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-700 font-semibold">{lang === 'en' ? 'Doctor Off' : 'Dokter Libur'}</span>
            </div>
          </div>

          {/* Calendar Month & Controls */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-base sm:text-lg text-secondary">
              {monthName} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border/60 text-text-muted transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border/60 text-text-muted transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-text-muted mb-2">
            <span>{lang === 'en' ? 'Mo' : 'Sn'}</span>
            <span>{lang === 'en' ? 'Tu' : 'Sl'}</span>
            <span>{lang === 'en' ? 'We' : 'Rb'}</span>
            <span>{lang === 'en' ? 'Th' : 'Km'}</span>
            <span>{lang === 'en' ? 'Fr' : 'Jm'}</span>
            <span>{lang === 'en' ? 'Sa' : 'Sb'}</span>
            <span>{lang === 'en' ? 'Su' : 'Mg'}</span>
          </div>

          {/* Days Grid - Uniform track heights so dates 9-15 never clip or overlap */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center auto-rows-[38px] sm:auto-rows-[42px] overflow-visible">
            {daysGrid.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="w-full h-full" />;
              }

              const isSelected = selectedDate === cell.dateStr;

              // Check clinic-wide time off
              const clinicOff = clinicTimeOffs.find((to) => !to.doctorId && isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt));

              // Check doctor-specific time off
              let isDoctorOff = false;
              let offReason = '';

              if (selectedDoctorId && selectedDoctorId !== 'any') {
                const currentDoc = doctors.find((d) => d.id === selectedDoctorId);
                const docOff = currentDoc?.timeOffs?.find((to) => isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt));
                if (clinicOff || docOff) {
                  isDoctorOff = true;
                  offReason = docOff?.reason || clinicOff?.reason || (lang === 'en' ? 'Doctor is on leave' : 'Dokter sedang libur / cuti');
                }
              } else {
                // If 'any' doctor or none selected, date is off if entire clinic is off OR every doctor is off on this date
                const allDocsOff =
                  doctors.length > 0 &&
                  doctors.every((d) => (d.timeOffs || []).some((to) => isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt)));
                if (clinicOff || allDocsOff) {
                  isDoctorOff = true;
                  offReason = clinicOff?.reason || (allDocsOff ? (lang === 'en' ? 'All doctors are on leave' : 'Semua dokter sedang libur') : '');
                }
              }

              const isDisabled = cell.isPast || cell.isSunday || isDoctorOff;

              let btnStyles = 'bg-surface text-secondary hover:bg-primary/10 border border-border cursor-pointer shadow-xs';
              if (isDoctorOff) {
                btnStyles = 'bg-amber-500/10 text-amber-800/60 border-amber-300/40 cursor-not-allowed';
              } else if (isDisabled) {
                btnStyles = 'bg-transparent text-text-muted/40 cursor-not-allowed opacity-40';
              } else if (isSelected) {
                btnStyles = 'bg-primary text-white font-bold border-primary shadow-xs ring-2 ring-primary/20 scale-[1.04]';
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isDisabled}
                  title={isDoctorOff ? `${lang === 'en' ? 'Doctor on leave: ' : 'Dokter libur: '}${offReason}` : undefined}
                  onClick={() => onSelectDate(cell.dateStr)}
                  className={`w-full h-full rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center min-h-[38px] sm:min-h-[42px] ${btnStyles} ${
                    !isDisabled ? 'active:scale-95' : ''
                  }`}
                >
                  <span>{cell.dayNum}</span>
                  {isDoctorOff && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date Header + Doctor Cards with inline time chips */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary">
                {formatDateSummary(selectedDate, lang === 'en') || formattedSelectedHeader}
              </h3>
              <span className="text-xs font-semibold text-text-muted">
                {doctors.length} {lang === 'en' ? 'Specialists on Duty' : 'Dokter Praktek'}
              </span>
            </div>

            {/* Optional doctor gender filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-alt border border-border/80 text-xs">
              <span className="text-[11px] font-semibold text-text-muted px-1.5">
                {lang === 'en' ? 'Doctor:' : 'Dokter:'}
              </span>
              {[
                { id: 'all', label: lang === 'en' ? 'All' : 'Semua' },
                { id: 'female', label: lang === 'en' ? 'Female' : 'Perempuan' },
                { id: 'male', label: lang === 'en' ? 'Male' : 'Laki-laki' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDoctorGenderFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer min-h-[32px] ${
                    doctorGenderFilter === f.id
                      ? 'bg-secondary text-white shadow-2xs'
                      : 'text-text-muted hover:text-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors list - Stacked fully without nested scroll */}
          <div className="space-y-4">
            {doctors
              .filter((doc) => doctorGenderFilter === 'all' || doc.gender === doctorGenderFilter)
              .map((doc) => {
              const isDocSelected = selectedDoctorId === doc.id;
              const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
              const fallbackImg =
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=200&h=200&q=80';

              const docOffToday =
                (doc.timeOffs || []).find((to) => isDateOverlapping(selectedDate, to.startsAt, to.endsAt)) ||
                clinicTimeOffs.find((to) => !to.doctorId && isDateOverlapping(selectedDate, to.startsAt, to.endsAt));

              const docSlots = slots.filter(
                (s) => s.doctorId === doc.id || !s.doctorId
              );

              return (
                <div
                  key={doc.id}
                  onClick={() => !docOffToday && onSelectDoctor(doc.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    docOffToday
                      ? 'bg-amber-50/50 border-amber-200/80 opacity-80 cursor-not-allowed'
                      : isDocSelected
                      ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs cursor-pointer'
                      : 'bg-surface border-border hover:border-primary/40 hover:bg-bg-alt/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border bg-bg-alt relative">
                      <img
                        src={doc.photoUrl || fallbackImg}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-bold text-base sm:text-lg text-secondary truncate">
                          {doc.name}
                        </h4>
                        {docOffToday && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            🏖️ {lang === 'en' ? 'On Leave' : 'Sedang Libur'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-accent font-semibold truncate">
                        {specialty} {doc.experienceYears ? `· ${doc.experienceYears} th` : ''}
                      </p>
                      {doc.sipNumber && (
                        <p className="text-[11px] font-mono text-text-muted mt-0.5">
                          {doc.sipNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time Slot Chips */}
                  <div className="pt-2.5 border-t border-border/60">
                    {docOffToday ? (
                      <div className="py-2.5 px-3 rounded-xl bg-amber-100/60 border border-amber-200 text-xs text-amber-900 flex flex-col gap-0.5">
                        <span className="font-semibold flex items-center gap-1">
                          🏖️ {lang === 'en' ? 'Doctor is on leave on this date' : 'Dokter sedang libur / cuti pada tanggal ini'}
                        </span>
                        {docOffToday.reason && (
                          <span className="text-amber-800 text-[11px]">
                            {lang === 'en' ? 'Reason: ' : 'Alasan: '}{docOffToday.reason}
                          </span>
                        )}
                      </div>
                    ) : loadingSlots ? (
                      <div className="py-2 text-xs text-text-muted italic flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                        <span>{lang === 'en' ? 'Checking time slots…' : 'Memeriksa slot jam…'}</span>
                      </div>
                    ) : docSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {docSlots.map((slot) => {
                          const isSlotActive =
                            isDocSelected && selectedTime === slot.time;

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDoctor(doc.id);
                                onSelectTime(slot.time);
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold tabular-nums transition-all cursor-pointer min-h-[42px] min-w-[64px] active:scale-95 flex items-center justify-center ${
                                isSlotActive
                                  ? 'bg-primary text-white shadow-xs ring-2 ring-primary/30'
                                  : 'bg-bg-alt text-secondary border border-border hover:bg-primary hover:text-white'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">
                        {lang === 'en'
                          ? 'No slots available for this date'
                          : 'Tidak ada slot waktu di tanggal ini'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Summary & Continue CTA */}
      <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary rounded-xl text-xs sm:text-sm px-4 py-2.5 cursor-pointer inline-flex items-center gap-1.5 min-h-[44px] active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
            </button>
          )}

          <div className="text-xs sm:text-sm text-secondary">
            {selectedDate && (
              <span className="font-semibold text-secondary">
                {formatDateSummary(selectedDate, lang === 'en')}
              </span>
            )}
            {selectedTime && (
              <span className="font-bold text-primary ml-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                {selectedTime} WIB
              </span>
            )}
            {currentDoctor && (
              <span className="text-text-muted ml-2">
                — {currentDoctor.name}
              </span>
            )}
            {!selectedTime && (
              <span className="text-xs text-text-muted ml-2 italic">
                {lang === 'en' ? '(Select a time slot)' : '(Pilih salah satu slot jam)'}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedTime}
          onClick={onContinue}
          className={`btn-primary rounded-xl px-8 py-3.5 text-sm font-semibold transition-all cursor-pointer w-full sm:w-auto justify-center min-h-[48px] active:scale-[0.98] ${
            !selectedTime ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          {lang === 'en' ? 'Continue' : 'Lanjutkan ke Data Pasien'}
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return cardContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {cardContent}
    </div>
  );
};
