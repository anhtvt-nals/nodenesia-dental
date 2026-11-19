import { App as AntdApp, Avatar, Button, Popconfirm, Space, Switch, Tag, Tooltip, Typography } from 'antd';
import { CalendarOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { deleteDoctor, updateDoctor, type ClinicDoctor, type ServerPagination } from '../../api/admin-api';
import { AdminTable } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  doctors: ClinicDoctor[];
  onEdit: (doctor: ClinicDoctor) => void;
  onManageHours: (id: string) => void;
  onChanged: (doctor: ClinicDoctor) => void;
  onDeleted: () => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

export function DoctorList({ accessToken, doctors, onEdit, onManageHours, onChanged, onDeleted, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();

  async function toggle(doctor: ClinicDoctor) {
    try {
      const saved = await updateDoctor(accessToken, doctor.id, { isActive: !doctor.isActive });
      onChanged({ ...saved, _count: doctor._count });
      message.success(
        saved.isActive
          ? tr(`${doctor.name} diaktifkan`, `${doctor.name} activated`)
          : tr(`${doctor.name} dinonaktifkan`, `${doctor.name} deactivated`),
      );
    } catch (error) {
      onError((error as Error).message);
    }
  }

  async function remove(doctor: ClinicDoctor) {
    try {
      await deleteDoctor(accessToken, doctor.id);
      message.success(tr('Dokter berhasil dihapus', 'Doctor deleted'));
      onDeleted();
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<ClinicDoctor> = [
    {
      title: tr('Dokter', 'Doctor'),
      dataIndex: 'name',
      render: (name: string, doctor) => (
        <Space size={12}>
          <Avatar
            size={44}
            shape="square"
            src={doctor.photoUrl || undefined}
            alt={name}
            style={{ flexShrink: 0, borderRadius: 10, objectFit: 'cover' }}
          >
            {String(name)
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{name}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {doctor.title ?? doctor.slug}
              {doctor.gender ? ` · ${doctor.gender === 'female' ? tr('Perempuan', 'Female') : tr('Laki-laki', 'Male')}` : ''}
              {doctor.sipNumber ? ` · SIP ${doctor.sipNumber}` : ''}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: tr('Keahlian', 'Specialty'),
      dataIndex: 'specialty',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: tr('Layanan', 'Services'),
      width: 120,
      render: (_, doctor) => (
        <Typography.Text type="secondary">
          {tr(`${doctor.services.length} layanan`, `${doctor.services.length} services`)}
        </Typography.Text>
      ),
    },
    {
      title: tr('Jadwal', 'Schedule'),
      width: 115,
      render: (_, doctor) =>
        doctor._count?.bookings ? (
          <Tag className="admin-tag admin-tag--info">{tr(`${doctor._count.bookings} janji`, `${doctor._count.bookings} bookings`)}</Tag>
        ) : (
          <Tag className="admin-tag admin-tag--neutral">{tr('Belum ada', 'None')}</Tag>
        ),
    },
    {
      title: tr('Status', 'Status'),
      width: 135,
      render: (_, doctor) => (
        <Space>
          <Switch
            checked={doctor.isActive}
            aria-label={tr(`Aktifkan ${doctor.name}`, `Toggle ${doctor.name}`)}
            onChange={() => void toggle(doctor)}
          />
          <Typography.Text style={{ fontSize: 13 }}>
            {doctor.isActive ? tr('Aktif', 'Active') : tr('Nonaktif', 'Inactive')}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 135,
      align: 'right',
      render: (_, doctor) => {
        const bookingCount = doctor._count?.bookings ?? 0;
        const deleteButton = (
          <Button
            type="text"
            danger
            disabled={bookingCount > 0}
            icon={<DeleteOutlined />}
            aria-label={tr(`Hapus dokter ${doctor.name}`, `Delete doctor ${doctor.name}`)}
            title={
              bookingCount
                ? tr('Dokter dengan janji temu tidak dapat dihapus', 'Doctors with bookings cannot be deleted')
                : tr('Hapus dokter', 'Delete doctor')
            }
          />
        );
        return (
          <Space size={2}>
            <Tooltip title={tr('Ubah profil dokter', 'Edit doctor')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={tr(`Ubah dokter ${doctor.name}`, `Edit doctor ${doctor.name}`)}
                onClick={() => onEdit(doctor)}
              />
            </Tooltip>
            <Tooltip title={tr('Atur jam praktik', 'Working hours')}>
              <Button
                type="text"
                icon={<CalendarOutlined />}
                aria-label={tr(`Atur jam praktik ${doctor.name}`, `Edit working hours for ${doctor.name}`)}
                onClick={() => onManageHours(doctor.id)}
              />
            </Tooltip>
            {bookingCount ? (
              <Tooltip title={tr('Tidak dapat dihapus karena masih memiliki janji temu', 'Cannot be deleted because bookings still exist')}>
                {deleteButton}
              </Tooltip>
            ) : (
              <Popconfirm
                title={tr('Hapus dokter ini?', 'Delete this doctor?')}
                description={tr('Data dokter dan jam praktiknya akan dihapus.', 'The doctor and their working hours will be deleted.')}
                okText={tr('Hapus', 'Delete')}
                cancelText={tr('Batal', 'Cancel')}
                okButtonProps={{ danger: true }}
                onConfirm={() => void remove(doctor)}
              >
                {deleteButton}
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <AdminTable<ClinicDoctor>
      rowKey="id"
      columns={columns}
      dataSource={doctors}
      pagination={pagination ? { ...pagination, showSizeChanger: false } : false}
      emptyTitle={tr('Belum ada dokter terdaftar', 'No doctors registered')}
      renderMobileCard={(doctor) => (
        <div className="admin-mobile-card">
          <div className="admin-mobile-card__top">
            <Space size={10}>
              <Avatar size={40} shape="square" src={doctor.photoUrl || undefined} alt={doctor.name}>
                {doctor.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <strong>{doctor.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{doctor.specialty ?? doctor.title ?? '—'}</div>
              </div>
            </Space>
            <Switch checked={doctor.isActive} onChange={() => void toggle(doctor)} />
          </div>
          <div className="admin-mobile-card__actions">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(doctor)}>
              {tr('Ubah', 'Edit')}
            </Button>
            <Button size="small" icon={<CalendarOutlined />} onClick={() => onManageHours(doctor.id)}>
              {tr('Jam Praktik', 'Hours')}
            </Button>
          </div>
        </div>
      )}
    />
  );
}
