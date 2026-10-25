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

  // Generate calendar days grid
  // Days of week: Mo, Tu, We, Th, Fr, Sa, Su (ISO week starting Monday = 1)
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

  // Selected date formatted for title e.g. "October 4th" or "4 Oktober"
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
    <div className={`relative w-full bg-white text-[#1B2623] rounded-[24px] sm:rounded-[28px] border border-[#CBD6D0]/70 overflow-hidden ${
      embedded ? 'p-6 sm:p-9 shadow-sm' : 'my-auto max-w-[940px] shadow-2xl p-6 sm:p-9'
    }`}>
      {/* Close Button (modal mode only) */}
      {!embedded && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'en' ? 'Close dialog' : 'Tutup dialog'}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-[#51605B] hover:text-[#12392F] hover:bg-black/5 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Modal/Header Title matching booking.png */}
      <div className="text-center mb-8 pr-6 pl-6">
        <h2 className="font-heading text-2xl sm:text-[1.85rem] font-bold text-[#12392F] tracking-tight">
          {lang === 'en' ? 'Select a convenient date and doctor' : 'Pilih jadwal tanggal dan dokter yang sesuai'}
        </h2>
        {serviceName && (
          <p className="text-xs sm:text-sm text-[#51605B] mt-1.5">
            {lang === 'en' ? 'Service: ' : 'Layanan: '}
            <strong className="text-[#12392F]">{serviceName}</strong>
          </p>
        )}
      </div>

      {/* 2-Column Split: Calendar (Left) & Doctor/Slots (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-7 lg:gap-9 items-start">
        {/* Left Column: Calendar Picker with Legend */}
        <div className="bg-[#F8FAF9] p-5 sm:p-6 rounded-[22px] border border-[#CBD6D0]/60">
          {/* Status Legend matching booking.png */}
          <div className="flex items-center gap-4 mb-5 text-xs text-[#51605B]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <span>{lang === 'en' ? 'Occupied' : 'Tutup / Penuh'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#DDEAE3] border border-[#CBD6D0]" />
              <span>{lang === 'en' ? 'Available' : 'Tersedia'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#12392F]" />
              <span>{lang === 'en' ? 'Allocated' : 'Dipilih'}</span>
            </div>
          </div>

          {/* Calendar Month & Controls */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-base sm:text-lg text-[#12392F]">
              {monthName} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#51605B] transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#51605B] transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of week header (Mo Tu We Th Fr Sa Su) */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#51605B] mb-2.5">
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

              let btnStyles = 'bg-white text-[#1B2623] hover:bg-[#DDEAE3] border border-[#CBD6D0]/70 cursor-pointer shadow-2xs';
              if (isDisabled) {
                btnStyles = 'bg-transparent text-[#9CA3AF] cursor-not-allowed opacity-40';
              } else if (isSelected) {
                btnStyles = 'bg-[#12392F] text-white font-bold border-[#12392F] shadow-sm';
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectDate(cell.dateStr)}
                  className={`aspect-square rounded-full text-xs sm:text-sm transition-all flex items-center justify-center ${btnStyles}`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date Header + Doctor Cards with inline time chips */}
        <div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#12392F] mb-4">
            {formattedSelectedHeader}
          </h3>

          {/* Doctors list */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {doctors.map((doc) => {
              const isDocSelected = selectedDoctorId === doc.id;
              const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
              const fallbackImg =
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=200&h=200&q=80';

              // Available slot times for this doctor
              const docSlots = slots.filter(
                (s) => s.doctorId === doc.id || !s.doctorId
              );

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoctor(doc.id)}
                  className={`p-4 sm:p-5 rounded-[20px] border transition-all cursor-pointer ${
                    isDocSelected
                      ? 'bg-[#EFF5F2] border-[#12392F]/50 ring-1 ring-[#12392F]/20 shadow-xs'
                      : 'bg-[#F8FAF9] border-[#CBD6D0]/60 hover:bg-[#F0F5F2]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 border border-[#CBD6D0] bg-white">
                      <img
                        src={doc.photoUrl || fallbackImg}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-bold text-base sm:text-lg text-[#12392F] truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-[#51605B] truncate mt-0.5">
                        {doc.experienceYears
                          ? `${lang === 'en' ? 'Experience' : 'Pengalaman'}: ${doc.experienceYears} ${lang === 'en' ? 'years' : 'tahun'}`
                          : ''}
                      </p>
                      <p className="text-xs text-[#51605B] truncate">
                        {specialty}
                      </p>
                    </div>
                  </div>

                  {/* Time Slot Chips matching booking.png */}
                  <div className="pt-2.5 border-t border-[#CBD6D0]/40">
                    {loadingSlots ? (
                      <div className="py-2 text-xs text-[#51605B] italic flex items-center gap-2">
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
                              className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold tabular-nums transition-all cursor-pointer ${
                                isSlotActive
                                  ? 'bg-[#12392F] text-white shadow-xs ring-1 ring-[#12392F]'
                                  : 'bg-white text-[#12392F] border border-[#CBD6D0] hover:bg-[#12392F] hover:text-white'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9CA3AF]">
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

      {/* Modal/Card Footer Summary & Continue CTA matching booking.png */}
      <div className="mt-8 pt-5 border-t border-[#CBD6D0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border border-[#CBD6D0] text-[#51605B] hover:text-[#12392F] hover:bg-black/5 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
            </button>
          )}

          <div className="text-sm text-[#1B2623] truncate">
            {selectedDate && (
              <span className="font-semibold text-[#12392F]">
                {formattedSelectedHeader}
              </span>
            )}
            {selectedTime && (
              <span className="font-bold text-[#12392F] ml-1.5 px-2.5 py-0.5 rounded-md bg-[#EAF3EF] border border-[#CBD6D0]/40">
                ({selectedTime} WIB)
              </span>
            )}
            {currentDoctor && (
              <span className="text-[#51605B] ml-2 truncate">
                — {currentDoctor.name}
              </span>
            )}
            {!selectedTime && (
              <span className="text-xs text-[#9CA3AF] ml-2 italic">
                {lang === 'en' ? '(Select a time slot)' : '(Pilih salah satu slot jam)'}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedTime}
          onClick={onContinue}
          className={`px-9 py-3 rounded-full text-base font-semibold transition-all cursor-pointer ${
            selectedTime
              ? 'bg-[#12392F] text-white hover:bg-[#1E5245] shadow-sm'
              : 'bg-[#CBD6D0]/60 text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          {lang === 'en' ? 'Continue' : 'Lanjutkan'}
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
