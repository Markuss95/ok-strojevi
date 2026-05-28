import { useEffect, useRef, useState } from 'react';

export interface Machine {
  _id: string;
  name: string;
  inv: string;
  category?: string;
}

function machineLabel(m: Machine): string {
  return `${m.name} (${m.inv})`;
}

interface Props {
  machines: Machine[];
  value: Machine | null;
  onChange: (machine: Machine | null) => void;
}

export function MachineSelect({ machines, value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.inv.toLowerCase().includes(q) ||
      (m.category ?? '').toLowerCase().includes(q)
  );

  function select(machine: Machine) {
    onChange(machine);
    setQuery(machineLabel(machine));
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={open ? query : value ? machineLabel(value) : query}
        placeholder="Odaberite stroj…"
        onFocus={() => {
          setQuery(value ? machineLabel(value) : '');
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
      />
      {open && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 240,
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderTop: 'none',
            background: '#fff',
            zIndex: 10,
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: 8, color: '#888' }}>Nema rezultata</li>
          ) : (
            filtered.map((m) => (
              <li
                key={m._id}
                onMouseDown={() => select(m)}
                style={{
                  padding: 8,
                  cursor: 'pointer',
                  background: value?._id === m._id ? '#eef' : '#fff',
                }}
              >
                <div>{m.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Inv. br. {m.inv}
                  {m.category ? ` · ${m.category}` : ''}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
