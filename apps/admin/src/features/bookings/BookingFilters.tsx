import { DatePicker, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { ClinicDoctor } from '../../api/admin-api';
import { AdminFilterBar, type ActiveFilterChip } from '../../components/ui';
import { statusText, tr, useAdminTranslation } from '../../i18n';

export type BookingClientFilter = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

type ServerFilter = { doctorId?: string; status?: string };

type Props = {
  doctors: ClinicDoctor[];
  onChange: (filter: ServerFilter) => void;
  onClientChange?: (filter: BookingClientFilter) => void;
};

const ALL_STATUSES = ['pending', 'confirmed', 'arrived', 'in_chair', 'completed', 'cancelled', 'no_show'] as const;

function readInitialFilters(): ServerFilter & BookingClientFilter {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    doctorId: params.get('doctor') || undefined,
    status: params.get('status') || undefined,
    search: params.get('q') || undefined,
    dateFrom: params.get('from') || undefined,
    dateTo: params.get('to') || undefined,
  };
}

function syncFiltersToUrl(filter: ServerFilter & BookingClientFilter) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const setOrDelete = (key: string, val?: string) => {
    if (val) url.searchParams.set(key, val);
    else url.searchParams.delete(key);
  };
  setOrDelete('doctor', filter.doctorId);
  setOrDelete('status', filter.status);
  setOrDelete('q', filter.search);
  setOrDelete('from', filter.dateFrom);
  setOrDelete('to', filter.dateTo);
  window.history.replaceState(window.history.state, '', url.toString());
}

export function BookingFilters({ doctors, onChange, onClientChange }: Props) {
  useAdminTranslation();
  const [filter, setFilter] = useState<ServerFilter & BookingClientFilter>(() => readInitialFilters());

  useEffect(() => {
    if (filter.doctorId || filter.status) {
      onChange({ doctorId: filter.doctorId, status: filter.status });
    }
    if (filter.search || filter.dateFrom || filter.dateTo) {
      onClientChange?.({ search: filter.search, dateFrom: filter.dateFrom, dateTo: filter.dateTo });
    }
    // Sync initial URL filters once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(next: Partial<ServerFilter & BookingClientFilter>) {
    const merged = { ...filter, ...next };
    setFilter(merged);
    syncFiltersToUrl(merged);
    if ('doctorId' in next || 'status' in next) {
      onChange({ doctorId: merged.doctorId, status: merged.status });
    }
    if ('search' in next || 'dateFrom' in next || 'dateTo' in next) {
      onClientChange?.({ search: merged.search, dateFrom: merged.dateFrom, dateTo: merged.dateTo });
    }
  }

  function resetAll() {
    setFilter({});
    syncFiltersToUrl({});
    onChange({});
    onClientChange?.({});
  }

  const activeTags = useMemo<ActiveFilterChip[]>(() => {
    const tags: ActiveFilterChip[] = [];
    if (filter.search) {
      tags.push({
        key: 'search',
        label: `${tr('Cari', 'Search')}: "${filter.search}"`,
        onRemove: () => update({ search: undefined }),
      });
    }
    if (filter.doctorId) {
      const docName = doctors.find((d) => d.id === filter.doctorId)?.name ?? filter.doctorId;
      tags.push({
        key: 'doctor',
        label: `${tr('Dokter', 'Doctor')}: ${docName}`,
        onRemove: () => update({ doctorId: undefined }),
      });
    }
    if (filter.status) {
      tags.push({
        key: 'status',
        label: `${tr('Status', 'Status')}: ${statusText(filter.status)}`,
        onRemove: () => update({ status: undefined }),
      });
    }
    if (filter.dateFrom || filter.dateTo) {
      tags.push({
        key: 'date',
        label: `${tr('Tanggal', 'Date')}: ${filter.dateFrom ?? '...'} – ${filter.dateTo ?? '...'}`,
        onRemove: () => update({ dateFrom: undefined, dateTo: undefined }),
      });
    }
    return tags;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, filter]);

  const dateRangeValue: [Dayjs, Dayjs] | null =
    filter.dateFrom && filter.dateTo ? [dayjs(filter.dateFrom), dayjs(filter.dateTo)] : null;

  const statusBadgeClass = (value: (typeof ALL_STATUSES)[number]) =>
    `admin-badge--${value.replace('_', '-')}`;

  return (
    <>
      <AdminFilterBar
        searchValue={filter.search ?? ''}
        onSearchChange={(val) => update({ search: val || undefined })}
        searchPlaceholder={tr('Cari nama pasien, no. HP, atau kode...', 'Search patient name, phone, or code...')}
        activeChips={activeTags}
        onResetAll={resetAll}
        filters={
          <>
            <Select
              aria-label={tr('Filter dokter', 'Filter doctors')}
              placeholder={tr('Semua dokter', 'All doctors')}
              value={filter.doctorId}
              allowClear
              style={{ minWidth: 190 }}
              options={doctors.map((doctor) => ({ value: doctor.id, label: doctor.name }))}
              onChange={(doctorId) => update({ doctorId })}
            />
            <DatePicker.RangePicker
              aria-label={tr('Filter rentang tanggal', 'Filter date range')}
              placeholder={[tr('Dari tanggal', 'From date'), tr('Sampai tanggal', 'To date')]}
              value={dateRangeValue}
              format="DD MMM YYYY"
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  update({ dateFrom: undefined, dateTo: undefined });
                } else {
                  update({
                    dateFrom: dates[0].format('YYYY-MM-DD'),
                    dateTo: dates[1].format('YYYY-MM-DD'),
                  });
                }
              }}
            />
          </>
        }
      />

      <div
        className="admin-status-filter-bar"
        role="group"
        aria-label={tr('Filter cepat status janji temu', 'Quick appointment status filter')}
      >
        <button
          type="button"
          className={`admin-badge admin-status-pill admin-status-pill--all${!filter.status ? ' is-active' : ''}`}
          aria-pressed={!filter.status}
          onClick={() => update({ status: undefined })}
        >
          {tr('Semua Status', 'All Statuses')}
        </button>
        {ALL_STATUSES.map((value) => {
          const active = filter.status === value;
          return (
            <button
              key={value}
              type="button"
              className={`admin-badge admin-status-pill ${statusBadgeClass(value)}${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => update({ status: active ? undefined : value })}
            >
              {statusText(value)}
            </button>
          );
        })}
      </div>
    </>
  );
}
