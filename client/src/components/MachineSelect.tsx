import { useEffect, useRef, useState } from 'react';

export interface Machine {
  _id: string;
  name: string;
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

  const filtered = machines.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function select(machine: Machine) {
    onChange(machine);
    setQuery(machine.name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={open ? query : value?.name ?? query}
        placeholder="Odaberite stroj…"
        onFocus={() => {
          setQuery(value?.name ?? '');
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
                {m.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
