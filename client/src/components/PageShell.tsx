import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  /** Tailwind max-width class for the header bar, e.g. 'max-w-6xl'. */
  maxWidth?: string;
  /** Tailwind max-width class for the main content column. Defaults to `maxWidth`. */
  mainMaxWidth?: string;
  error?: string | null;
  children: ReactNode;
}

/**
 * Standard inner-page chrome: top bar with a "← Natrag" link back to the
 * dashboard, the page title, an optional error banner, and a centered
 * main column. Used by every page that isn't the Login screen or the
 * Dashboard itself.
 */
export function PageShell({
  title,
  maxWidth = 'max-w-6xl',
  mainMaxWidth,
  error,
  children,
}: Props) {
  const navigate = useNavigate();
  const innerMax = mainMaxWidth ?? maxWidth;
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div
          className={`${maxWidth} mx-auto px-4 py-3 flex items-center justify-between`}
        >
          <button onClick={() => navigate('/')} className="btn-link">
            ← Natrag
          </button>
          <h1 className="text-xl">{title}</h1>
          <div />
        </div>
      </header>
      <main className={`${innerMax} mx-auto px-4 py-8 space-y-6`}>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
