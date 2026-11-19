import { Button, Checkbox, Drawer, Form, Input, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import { createDoctor, updateDoctor, uploadDoctorAvatar, type ClinicDoctor, type ClinicService } from '../../api/admin-api';
import { AdminImageUpload } from '../../components/ui';
import { copy, tr, useAdminTranslation } from '../../i18n';

type DoctorInput = { slug: string; name: string; title?: string; specialty?: string; photoUrl?: string | null; gender?: 'female' | 'male' | null; sipNumber?: string; serviceIds: string[] };
type Props = { accessToken: string; services: ClinicService[]; doctor?: ClinicDoctor; open: boolean; onClose: () => void; onSaved: () => void; onError: (message: string) => void };

export function DoctorCreateForm({ accessToken, services, doctor, open, onClose, onSaved, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<DoctorInput>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(doctor
      ? { photoUrl: doctor.photoUrl ?? null, gender: doctor.gender ?? null, sipNumber: doctor.sipNumber ?? undefined, slug: doctor.slug, name: doctor.name, title: doctor.title ?? undefined, specialty: doctor.specialty ?? undefined, serviceIds: doctor.services.map((service) => service.serviceId) }
      : { photoUrl: null, gender: null, sipNumber: undefined, slug: '', name: '', title: undefined, specialty: undefined, serviceIds: [] });
  }, [doctor, form, open]);

  async function submit(values: DoctorInput) {
    setSaving(true);
    try {
      const input = { ...values, title: values.title || null, specialty: values.specialty || null, gender: values.gender || null, sipNumber: values.sipNumber?.trim() || null };
      if (doctor) await updateDoctor(accessToken, doctor.id, input);
      else await createDoctor(accessToken, input);
      onSaved();
      onClose();
    } catch (error) { onError((error as Error).message); } finally { setSaving(false); }
  }

  return <Drawer className="doctor-form-drawer" title={doctor ? `${tr('Ubah dokter', 'Edit doctor')}: ${doctor.name}` : tr('Tambah dokter', 'Add doctor')} open={open} onClose={() => { if (!uploading && !saving) onClose(); }} width={520} destroyOnHidden footer={<Space><Button disabled={uploading || saving} onClick={onClose}>{copy.cancel}</Button><Button type="primary" loading={saving} disabled={uploading} onClick={() => form.submit()}>{copy.save}</Button></Space>}>
    <Form className="doctor-form" form={form} layout="vertical" onFinish={(values) => void submit(values)}>
      <Form.Item name="photoUrl" label={tr('Foto profil', 'Avatar')} extra={tr('JPG, PNG atau WebP, maksimal 5 MB ke Cloudflare R2.', 'JPG, PNG or WebP, up to 5 MB to Cloudflare R2.')}>
        <AdminImageUpload
          shape="avatar"
          avatarFallback={doctor?.name?.[0] || '?'}
          maxSizeMb={5}
          onUpload={(file) => uploadDoctorAvatar(accessToken, file)}
          onError={onError}
          onUploadingChange={setUploading}
          disabled={saving}
          uploadLabel={tr('Unggah foto', 'Upload avatar')}
          replaceLabel={tr('Ganti foto', 'Change avatar')}
        />
      </Form.Item>
      <Form.Item name="name" label={tr('Nama dokter', 'Doctor name')} rules={[{ required: true, message: tr('Nama wajib diisi', 'Name is required') }]}><Input autoFocus /></Form.Item>
      <Form.Item name="slug" label="Slug" extra={tr('Gunakan huruf kecil, angka, dan tanda hubung.', 'Use lowercase letters, numbers, and hyphens.')} rules={[{ required: true, message: tr('Slug wajib diisi', 'Slug is required') }, { pattern: /^[a-z0-9-]+$/, message: tr('Slug tidak valid', 'Invalid slug') }]}><Input /></Form.Item>
      <Form.Item name="title" label={tr('Gelar', 'Title')}><Input placeholder={tr('Contoh: drg., Sp.Ort', 'Example: drg., Sp.Ort')} /></Form.Item>
      <Form.Item name="specialty" label={tr('Keahlian', 'Specialty')}><Input placeholder={tr('Contoh: Ortodonti', 'Example: Orthodontics')} /></Form.Item>
      <Form.Item name="gender" label={tr('Jenis kelamin', 'Gender')}><Select allowClear placeholder={tr('Pilih', 'Select')} options={[{ value: 'female', label: tr('Perempuan', 'Female') }, { value: 'male', label: tr('Laki-laki', 'Male') }]} /></Form.Item>
      <Form.Item name="sipNumber" label={tr('Nomor SIP', 'SIP number')}><Input placeholder="SIP-..." /></Form.Item>
      <Form.Item name="serviceIds" label={tr('Layanan yang ditangani', 'Services provided')} rules={[{ required: true, message: tr('Pilih minimal satu layanan', 'Select at least one service') }]}><Checkbox.Group className="doctor-service-options" options={services.filter((service) => service.isActive).map((service) => ({ value: service.id, label: service.name }))} /></Form.Item>
    </Form>
  </Drawer>;
}
