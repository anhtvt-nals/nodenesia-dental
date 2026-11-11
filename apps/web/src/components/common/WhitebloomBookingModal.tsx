import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Doctor, BookingSlot } from '../../types';

export interface WhitebloomBookingProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  doctors: Doctor[];
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

export const WhitebloomBookingModal: React.FC<WhitebloomBookingProps> = ({
  isOpen = true,
  onClose,
  embedded = false,
  doctors,
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
          {lang === 'en' ? 'STEP 02 & 03 / SCHEDULE & SPECIALIST' : 'LANGKAH 02 & 03 / JADWAL & DOKTER'}
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
          <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
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

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {daysGrid.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const isSelected = selectedDate === cell.dateStr;
              const isDisabled = cell.isPast || cell.isSunday;

              let btnStyles = 'bg-surface text-secondary hover:bg-primary/10 border border-border cursor-pointer shadow-xs';
              if (isDisabled) {
                btnStyles = 'bg-transparent text-text-muted/40 cursor-not-allowed opacity-40';
              } else if (isSelected) {
                btnStyles = 'bg-primary text-white font-bold border-primary shadow-xs ring-2 ring-primary/20 scale-[1.04]';
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectDate(cell.dateStr)}
                  className={`aspect-square rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center ${btnStyles}`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date Header + Doctor Cards with inline time chips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary">
              {formattedSelectedHeader}
            </h3>
            <span className="text-xs font-semibold text-text-muted">
              {doctors.length} {lang === 'en' ? 'Specialists' : 'Dokter Praktek'}
            </span>
          </div>

          {/* Doctors list */}
          <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
            {doctors.map((doc) => {
              const isDocSelected = selectedDoctorId === doc.id;
              const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
              const fallbackImg =
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=200&h=200&q=80';

              const docSlots = slots.filter(
                (s) => s.doctorId === doc.id || !s.doctorId
              );

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoctor(doc.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isDocSelected
                      ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs'
                      : 'bg-surface border-border hover:border-primary/40 hover:bg-bg-alt/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border bg-bg-alt">
                      <img
                        src={doc.photoUrl || fallbackImg}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-bold text-base sm:text-lg text-secondary truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-accent font-semibold truncate">
                        {specialty} {doc.experienceYears ? `· ${doc.experienceYears} th` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Time Slot Chips */}
                  <div className="pt-2.5 border-t border-border/60">
                    {loadingSlots ? (
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
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tabular-nums transition-all cursor-pointer ${
                                isSlotActive
                                  ? 'bg-primary text-white shadow-xs ring-1 ring-primary'
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
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary rounded-xl text-xs sm:text-sm px-4 py-2 cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
            </button>
          )}

          <div className="text-sm text-secondary truncate">
            {selectedDate && (
              <span className="font-semibold text-secondary">
                {formattedSelectedHeader}
              </span>
            )}
            {selectedTime && (
              <span className="font-bold text-primary ml-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                {selectedTime} WIB
              </span>
            )}
            {currentDoctor && (
              <span className="text-text-muted ml-2 truncate">
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
          className={`btn-primary rounded-xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer ${
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
