import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Drawer, Form, Input, Select, Space, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createUser, updateUserActive, type AdminUser, type ServerPagination } from '../../api/admin-api';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  users: AdminUser[];
  onChanged: (users: AdminUser[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type UserInput = { email: string; name: string; role: 'owner' | 'staff'; password: string };

export function UserManager({ accessToken, users, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<UserInput>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(values: UserInput) {
    setSaving(true);
    try {
      const user = await createUser(accessToken, values);
      onChanged([user, ...users]);
      message.success(tr('Akun staf ditambahkan', 'Staff account added'));
      form.resetFields();
      setOpen(false);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(user: AdminUser) {
    try {
      const updated = await updateUserActive(accessToken, user.id, !user.isActive);
      onChanged(users.map((item) => (item.id === user.id ? updated : item)));
      message.success(
        updated.isActive ? tr('Akun diaktifkan', 'Account activated') : tr('Akun dinonaktifkan', 'Account disabled'),
      );
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<AdminUser> = [
    { title: tr('Nama', 'Name'), dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: tr('Peran', 'Role'),
      dataIndex: 'role',
      render: (role: AdminUser['role']) => (role === 'owner' ? tr('Pemilik', 'Owner') : tr('Staf', 'Staff')),
    },
    {
      title: tr('Aktif', 'Active'),
      width: 120,
      render: (_, user) => <Switch checked={user.isActive} onChange={() => void toggle(user)} />,
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 80,
      align: 'right',
      render: (_, user) => (
        <Button
          type="text"
          icon={user.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          aria-label={user.isActive ? tr('Nonaktifkan akun', 'Disable account') : tr('Aktifkan akun', 'Enable account')}
          title={user.isActive ? tr('Nonaktifkan akun', 'Disable account') : tr('Aktifkan akun', 'Enable account')}
          onClick={() => void toggle(user)}
        />
      ),
    },
  ];

  return (
    <section aria-labelledby="users-heading">
      <AdminPageHeader
        title={tr('Akun Staf & Admin', 'Staff Accounts')}
        description={tr('Kelola akses staf resepsionis dan pemilik klinik.', 'Manage receptionist staff and clinic owner access.')}
        meta={`${pagination?.total ?? users.length} ${tr('akun', 'accounts')}`}
        actions={<Button type="primary" onClick={() => setOpen(true)}>{tr('Tambah akun', 'Add account')}</Button>}
      />

      <AdminTable<AdminUser>
        rowKey="id"
        columns={columns}
        dataSource={users}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada akun staf', 'No accounts yet')}
      />

      <Drawer
        title={tr('Tambah akun', 'Add account')}
        placement="right"
        width={420}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpen(false)}>{tr('Batal', 'Cancel')}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {tr('Simpan', 'Save')}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>
          <Form.Item name="name" label={tr('Nama', 'Name')} rules={[{ required: true, message: tr('Nama wajib diisi', 'Name is required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: tr('Email tidak valid', 'Invalid email') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={tr('Peran', 'Role')} initialValue="staff">
            <Select options={[{ value: 'staff', label: tr('Staf', 'Staff') }, { value: 'owner', label: tr('Pemilik', 'Owner') }]} />
          </Form.Item>
          <Form.Item
            name="password"
            label={tr('Kata sandi', 'Password')}
            rules={[{ required: true, min: 12, message: tr('Kata sandi minimal 12 karakter', 'Password must be at least 12 characters') }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  );
}
