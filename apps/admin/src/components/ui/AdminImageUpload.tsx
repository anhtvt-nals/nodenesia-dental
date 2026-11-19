import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Space, Upload } from 'antd';
import { useState } from 'react';
import { tr } from '../../i18n';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  onError?: (message: string) => void;
  disabled?: boolean;
  maxSizeMb?: number;
  shape?: 'rect' | 'avatar';
  avatarFallback?: string;
  emptyLabel?: string;
  uploadLabel?: string;
  replaceLabel?: string;
  removeLabel?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

/**
 * Unified R2 image uploader with old/current image preview + upload button (no manual URL input).
 */
export function AdminImageUpload({
  value,
  onChange,
  onUpload,
  onError,
  disabled = false,
  maxSizeMb = 10,
  shape = 'rect',
  avatarFallback = '?',
  emptyLabel,
  uploadLabel,
  replaceLabel,
  removeLabel,
  onUploadingChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const hasValue = Boolean(value && value.trim());

  const setBusy = (next: boolean) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  const handleBeforeUpload = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !file.size || file.size > maxSizeMb * 1024 * 1024) {
      onError?.(
        tr(
          `Pilih file JPG, PNG, atau WebP maksimal ${maxSizeMb} MB.`,
          `Choose a JPG, PNG, or WebP file up to ${maxSizeMb} MB.`,
        ),
      );
      return false;
    }

    setBusy(true);
    try {
      const uploadedUrl = await onUpload(file);
      onChange?.(uploadedUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
    return false;
  };

  return (
    <div className={`admin-image-upload admin-image-upload--${shape}`}>
      <div className="admin-image-upload__preview">
        {shape === 'avatar' ? (
          <Avatar size={72} src={hasValue ? value || undefined : undefined}>
            {avatarFallback}
          </Avatar>
        ) : hasValue ? (
          <Image
            src={value || ''}
            width={136}
            height={90}
            style={{ objectFit: 'cover', borderRadius: 8, display: 'block' }}
          />
        ) : (
          <div className="admin-image-upload__placeholder">
            <PictureOutlined style={{ fontSize: 20, color: 'var(--neutral-400)' }} />
            <span>{emptyLabel ?? tr('Belum ada gambar', 'No image yet')}</span>
          </div>
        )}
      </div>

      <Space wrap size={8}>
        <Upload
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          showUploadList={false}
          disabled={disabled || uploading}
          beforeUpload={handleBeforeUpload}
        >
          <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
            {hasValue
              ? (replaceLabel ?? tr('Ganti foto', 'Change image'))
              : (uploadLabel ?? tr('Unggah foto', 'Upload image'))}
          </Button>
        </Upload>

        {hasValue && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={disabled || uploading}
            onClick={() => onChange?.(null)}
          >
            {removeLabel ?? tr('Hapus', 'Remove')}
          </Button>
        )}
      </Space>
    </div>
  );
}
