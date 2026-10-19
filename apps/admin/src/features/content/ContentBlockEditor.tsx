import { FormEvent, useState } from 'react';
import { saveContentBlock, type ContentBlock } from '../../api/admin-api';
import { parseContentObject } from './content-json';

type Props = { accessToken: string; blocks: ContentBlock[]; onChanged: (blocks: ContentBlock[]) => void; onError: (message: string) => void };

export function ContentBlockEditor({ accessToken, blocks, onChanged, onError }: Props) {
  const [selected, setSelected] = useState<ContentBlock>();
  const [key, setKey] = useState('');
  const [locale, setLocale] = useState('id');
  const [json, setJson] = useState('{}');
  function select(block: ContentBlock) { setSelected(block); setKey(block.key); setLocale(block.locale); setJson(JSON.stringify(block.content, null, 2)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = await saveContentBlock(accessToken, key, { locale, content: parseContentObject(json) });
      onChanged([...blocks.filter((block) => block.key !== saved.key || block.locale !== saved.locale), saved]);
      setSelected(saved);
    } catch (error) { onError((error as Error).message); }
  }
  return <section aria-labelledby="content-heading"><h2 id="content-heading">Content blocks</h2><table><thead><tr><th>Key</th><th>Locale</th><th></th></tr></thead><tbody>{blocks.map((block) => <tr key={`${block.key}:${block.locale}`}><td>{block.key}</td><td>{block.locale}</td><td><button type="button" onClick={() => select(block)}>Sửa</button></td></tr>)}</tbody></table><form onSubmit={submit}><h3>{selected ? `Sửa ${selected.key}` : 'Content block mới'}</h3><label>Key<input value={key} onChange={(event) => setKey(event.target.value)} pattern="[a-z0-9_-]+" required /></label><label>Locale<input value={locale} onChange={(event) => setLocale(event.target.value)} pattern="[a-z]{2}(-[A-Z]{2})?" required /></label><label>JSON object<textarea value={json} onChange={(event) => setJson(event.target.value)} required /></label><button>Lưu content</button></form></section>;
}
