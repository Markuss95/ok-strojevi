import { useEffect, useRef, useState, ReactNode } from 'react';

interface Props<T> {
  items: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getSearchableText: (item: T) => string[];
  getSecondary?: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  placeholder?: string;
  emptyText?: string;
}

export function Combobox<T>({
  items,
  value,
  onChange,
  getKey,
  getLabel,
  getSearchableText,
  getSecondary,
  renderItem,
  placeholder = 'Odaberite…',
  emptyText = 'Nema rezultata',
}: Props<T>) {
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
  const filtered = items.filter((it) =>
    getSearchableText(it).some((s) => s.toLowerCase().includes(q))
  );

  function select(item: T) {
    onChange(item);
    setQuery(getLabel(item));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? query : value ? getLabel(value) : query}
        placeholder={placeholder}
        onFocus={() => {
          setQuery(value ? getLabel(value) : '');
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        className="field"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-10">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">{emptyText}</li>
          ) : (
            filtered.map((it) => {
              const key = getKey(it);
              const isSelected = value ? getKey(value) === key : false;
              return (
                <li
                  key={key}
                  onMouseDown={() => select(it)}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  {renderItem ? (
                    renderItem(it)
                  ) : (
                    <>
                      <div className="text-slate-900">{getLabel(it)}</div>
                      {getSecondary && (
                        <div className="text-xs text-slate-500 mt-0.5">{getSecondary(it)}</div>
                      )}
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
