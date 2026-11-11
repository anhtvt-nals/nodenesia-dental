import { Button, ConfigProvider, Drawer, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  title: ReactNode;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
  width?: number;
  saveLabel?: string;
  note?: ReactNode;
};

/** Shared layout and field tokens for every content editor, including portal content. */
export function ContentFormDrawer({ title, open, saving, onClose, onSave, children, width = 560, saveLabel, note }: Props) {
  useAdminTranslation();
  return <ConfigProvider theme={{
    token: { controlHeight: 44, borderRadius: 8, fontSize: 14, colorBorder: '#DDE5E0' },
    components: {
      Input: { paddingInline: 12, paddingBlock: 10, activeShadow: '0 0 0 3px rgb(52 120 184 / 10%)' },
      InputNumber: { controlWidth: 100, activeShadow: '0 0 0 3px rgb(52 120 184 / 10%)' },
      Select: { optionSelectedBg: '#E7F0FA' },
      Form: { itemMarginBottom: 20, verticalLabelPadding: '0 0 6px', labelFontSize: 13 },
    },
  }}>
    <Drawer className="content-form-drawer" title={title} open={open} width={width}
      onClose={() => { if (!saving) onClose(); }}
      keyboard={!saving} maskClosable={!saving} closable={!saving}
      footer={<div className="content-form-drawer__footer">
        {note && <Typography.Text type="secondary">{note}</Typography.Text>}
        <Space><Button disabled={saving} onClick={onClose}>{tr('Batal', 'Cancel')}</Button><Button type="primary" loading={saving} onClick={onSave}>{saveLabel || tr('Simpan', 'Save')}</Button></Space>
      </div>}>
      {children}
    </Drawer>
  </ConfigProvider>;
}
