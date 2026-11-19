import { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { tr } from '../../i18n';

export type CommandItem = {
  id: string;
  label: string;
  group: string;
  keywords?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  onSelect: (id: string) => void;
};

export function AdminCommandPalette({ open, onClose, items, onSelect }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q) ||
      (item.keywords?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={tr('Navigasi Cepat (Ctrl/Cmd + K)', 'Quick Jump (Ctrl/Cmd + K)')}
      width={500}
      destroyOnHidden
    >
      <Input
        autoFocus
        prefix={<SearchOutlined />}
        placeholder={tr('Cari halaman admin...', 'Search admin pages...')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onPressEnter={() => {
          if (filtered[0]) {
            onSelect(filtered[0].id);
            onClose();
          }
        }}
        style={{ marginBottom: 12 }}
      />
      <div className="admin-command-list" role="listbox">
        {filtered.length === 0 ? (
          <p className="admin-command-empty">{tr('Halaman tidak ditemukan.', 'No matching page.')}</p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              className="admin-command-item"
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <span className="admin-command-item__label">{item.label}</span>
              <span className="admin-command-item__group">{item.group}</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
