import { EditOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Form, Input, Modal, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { listPatients, updatePatientNotes, type Patient, type ServerPagination } from '../../api/admin-api';
import { AdminFilterBar, AdminPageHeader, AdminTable } from '../../components/ui';
import { formatPhone, isPendingPhone, tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  patients: Patient[];
  onChanged: (patients: Patient[], total?: number) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
  onSearchQuery?: (query: string) => void;
};

export function PatientList({ accessToken, patients, onChanged, onError, pagination, onSearchQuery }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [editing, setEditing] = useState<Patient>();
  const [notes, setNotes] = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  async function search(nextQuery?: string) {
    const q = (nextQuery ?? query).trim();
    if (onSearchQuery) {
      onSearchQuery(q);
      return;
    }
    try {
      const res = await listPatients(accessToken, q, { page: 1, pageSize: pagination?.pageSize ?? 20 });
      onChanged(res.items, res.total);
    } catch (error) {
      onError((error as Error).message);
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updatePatientNotes(accessToken, editing.id, notes.trim() || null);
      onChanged(patients.map((item) => (item.id === editing.id ? updated : item)));
      message.success(tr('Catatan pasien disimpan', 'Patient notes saved'));
      setEditing(undefined);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnsType<Patient> = [
    {
      title: tr('Pasien', 'Patient'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, patient) => {
        const pending = isPendingPhone(patient.phoneE164);
        return (
          <div className="booking-patient-cell">
            <strong>{name}</strong>
            <div className={`booking-patient-cell__phone${pending ? ' is-pending' : ''}`}>
              {formatPhone(patient.phoneE164)}
            </div>
          </div>
        );
      },
    },
    {
      title: tr('Janji Temu', 'Appointments'),
      dataIndex: ['_count', 'bookings'],
      key: 'bookings',
      width: 130,
      sorter: (a, b) => (a._count?.bookings ?? 0) - (b._count?.bookings ?? 0),
      render: (count: number) => <Typography.Text strong>{count ?? 0}</Typography.Text>,
    },
    {
      title: tr('Catatan Internal', 'Internal Notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (value: string | null) => value || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: tr('Aksi', 'Actions'),
      key: 'actions',
      width: 90,
      align: 'right',
      render: (_, patient) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          aria-label={tr(`Ubah catatan internal untuk ${patient.name}`, `Edit internal notes for ${patient.name}`)}
          title={tr('Ubah catatan internal', 'Edit internal notes')}
          onClick={() => {
            setEditing(patient);
            setNotes(patient.notes ?? '');
          }}
        />
      ),
    },
  ];

  return (
    <section aria-labelledby="patients-heading">
      <AdminPageHeader
        title={tr('Daftar Pasien', 'Patients')}
        description={tr('Kelola data pasien dan catatan klinis internal.', 'Manage patient directory and internal clinical notes.')}
        meta={`${patients.length} ${tr('pasien', 'patients')}`}
      />

      <AdminFilterBar
        searchValue={query}
        onSearchChange={(val) => {
          setQuery(val);
          if (!val) void search('');
        }}
        searchPlaceholder={tr('Cari nama atau no. telepon...', 'Search name or phone...')}
        rightSlot={
          <Button type="primary" onClick={() => void search()}>
            {tr('Cari', 'Search')}
          </Button>
        }
        activeChips={
          query.trim()
            ? [
                {
                  key: 'q',
                  label: `${tr('Cari', 'Search')}: "${query.trim()}"`,
                  onRemove: () => {
                    setQuery('');
                    void search('');
                  },
                },
              ]
            : []
        }
        onResetAll={() => {
          setQuery('');
          void search('');
        }}
      />

      <AdminTable<Patient>
        rowKey="id"
        columns={columns}
        dataSource={patients}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada data pasien', 'No patient data yet')}
        emptyDescription={tr('Data pasien akan muncul otomatis saat janji temu dibuat.', 'Patient records appear automatically when appointments are booked.')}
        renderMobileCard={(patient) => (
          <div className="admin-mobile-card">
            <div className="admin-mobile-card__top">
              <div>
                <strong>{patient.name}</strong>
                <div className={`booking-patient-cell__phone${isPendingPhone(patient.phoneE164) ? ' is-pending' : ''}`}>
                  {formatPhone(patient.phoneE164)}
                </div>
              </div>
              <Button
                size="small"
                icon={<EditOutlined />}
                aria-label={tr(`Ubah catatan internal untuk ${patient.name}`, `Edit internal notes for ${patient.name}`)}
                onClick={() => {
                  setEditing(patient);
                  setNotes(patient.notes ?? '');
                }}
              >
                {tr('Catatan', 'Notes')}
              </Button>
            </div>
            <div className="admin-mobile-card__meta">
              <span>{tr('Total kunjungan', 'Total visits')}: {patient._count?.bookings ?? 0}</span>
              {patient.notes && <span>{patient.notes}</span>}
            </div>
          </div>
        )}
      />

      <Modal
        title={`${tr('Catatan Pasien', 'Patient Notes')}: ${editing?.name ?? ''}`}
        open={Boolean(editing)}
        onOk={() => void save()}
        onCancel={() => setEditing(undefined)}
        okText={tr('Simpan perubahan', 'Save changes')}
        cancelText={tr('Batal', 'Cancel')}
        confirmLoading={saving}
      >
        <Form layout="vertical">
          <Form.Item label={tr('Catatan internal', 'Internal notes')}>
            <Input.TextArea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
