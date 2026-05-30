import { useState, type KeyboardEvent } from 'react';

type Props = {
  onAdd: (text: string) => void;
};

export function Compose({ onAdd }: Props) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="compose">
      <input
        className="input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        placeholder="What needs doing?"
        aria-label="New todo"
      />
      <button className="btn btn-primary" onClick={submit} disabled={!draft.trim()}>
        Add
      </button>
    </div>
  );
}
