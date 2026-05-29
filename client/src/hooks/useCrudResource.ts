import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import { toErrorMessage } from '../api/errors';

interface Options<T> {
  /** API path under `/api`, e.g. '/machines'. */
  endpoint: string;
  /** Key in the list response, e.g. 'machines' for `{ machines: [...] }`. */
  responseKey: string;
  /** Fields to search the local filter input against. */
  searchableFields: (item: T) => string[];
  loadErrorMessage: string;
  addErrorMessage: string;
  saveErrorMessage: string;
  deleteErrorMessage: string;
}

interface HasId {
  _id: string;
}

/**
 * Shared CRUD state + API wrapper for admin list pages. Holds the items,
 * loading/error/filter state, and exposes create/update/remove operations
 * that reload the list on success.
 */
export function useCrudResource<T extends HasId>({
  endpoint,
  responseKey,
  searchableFields,
  loadErrorMessage,
  addErrorMessage,
  saveErrorMessage,
  deleteErrorMessage,
}: Options<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<Record<string, T[]>>(endpoint)
      .then((res) => setItems(res[responseKey] ?? []))
      .catch((err) => setError(toErrorMessage(err, loadErrorMessage)))
      .finally(() => setLoading(false));
  }, [endpoint, responseKey, loadErrorMessage]);

  useEffect(load, [load]);

  async function create(payload: Partial<T>): Promise<boolean> {
    setError(null);
    try {
      await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      load();
      return true;
    } catch (err) {
      setError(toErrorMessage(err, addErrorMessage));
      return false;
    }
  }

  async function update(id: string, payload: Partial<T>): Promise<boolean> {
    setError(null);
    try {
      await apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      load();
      return true;
    } catch (err) {
      setError(toErrorMessage(err, saveErrorMessage));
      return false;
    }
  }

  async function remove(id: string): Promise<void> {
    setError(null);
    try {
      await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(toErrorMessage(err, deleteErrorMessage));
    }
  }

  // An empty query string matches everything (''.includes('') === true),
  // so no need to special-case it.
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((it) =>
      searchableFields(it).some((s) => s.toLowerCase().includes(q))
    );
  }, [items, filter, searchableFields]);

  return {
    items,
    filtered,
    loading,
    error,
    setError,
    filter,
    setFilter,
    create,
    update,
    remove,
  };
}
