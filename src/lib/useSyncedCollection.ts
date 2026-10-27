import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

type Updater<T> = T[] | ((prev: T[]) => T[]);

interface Options<T> {
  /** Load and subscribe only when true (e.g. once the user is signed in) */
  enabled: boolean;
  /** Order applied to the loaded rows and to rows arriving via realtime */
  sort?: (a: T, b: T) => number;
  /** Max rows to load (newest first by created_at); defaults to all */
  limit?: number;
  /** Rows to insert when the table is empty on first load */
  seed?: T[];
}

/**
 * React state backed by a Supabase table of `{ id, data }` rows.
 *
 * - `setItems` works like `useState`'s setter; changed items are upserted and removed items deleted.
 * - Changes from other clients (and server code such as the AI endpoints) arrive through Realtime.
 * - Realtime echoes of our own writes are ignored so a stale echo can't overwrite newer local edits.
 */
export function useSyncedCollection<T extends { id: string }>(table: string, options: Options<T>) {
  const { enabled, sort, limit, seed } = options;
  const [items, setItemsState] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef<T[]>([]);
  // Serialized payloads we wrote recently, per id; used to drop our own realtime echoes
  const pendingEchoes = useRef(new Map<string, string[]>());
  const sortRef = useRef(sort);
  sortRef.current = sort;

  const commit = useCallback((next: T[]) => {
    itemsRef.current = next;
    setItemsState(next);
  }, []);

  const rememberWrite = (item: T) => {
    const list = pendingEchoes.current.get(item.id) ?? [];
    list.push(JSON.stringify(item));
    pendingEchoes.current.set(item.id, list.slice(-10));
  };

  const persist = useCallback(
    async (prev: T[], next: T[]) => {
      const prevById = new Map(prev.map((i) => [i.id, i]));
      const nextIds = new Set(next.map((i) => i.id));
      const changed = next.filter((i) => prevById.get(i.id) !== i && JSON.stringify(prevById.get(i.id)) !== JSON.stringify(i));
      const removed = prev.filter((i) => !nextIds.has(i.id)).map((i) => i.id);

      if (changed.length > 0) {
        changed.forEach(rememberWrite);
        const { error: upsertError } = await supabase
          .from(table)
          .upsert(changed.map((item) => ({ id: item.id, data: item })));
        if (upsertError) setError(upsertError.message);
      }
      if (removed.length > 0) {
        const { error: deleteError } = await supabase.from(table).delete().in('id', removed);
        if (deleteError) setError(deleteError.message);
      }
    },
    [table]
  );

  /** Updates local state immediately; the returned promise resolves once the change is saved. */
  const setItems = useCallback(
    (updater: Updater<T>): Promise<void> => {
      const prev = itemsRef.current;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return Promise.resolve();
      commit(next);
      return persist(prev, next);
    },
    [commit, persist]
  );

  /** Replace one item locally without writing it back (e.g. with a server response). */
  const applyRemote = useCallback(
    (item: T) => {
      const exists = itemsRef.current.some((i) => i.id === item.id);
      const next = exists
        ? itemsRef.current.map((i) => (i.id === item.id ? item : i))
        : [...itemsRef.current, item];
      commit(sortRef.current ? [...next].sort(sortRef.current) : next);
    },
    [commit]
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      let query = supabase.from(table).select('id, data, created_at').order('created_at', { ascending: !limit });
      if (limit) query = query.limit(limit);
      const { data, error: loadError } = await query;
      if (cancelled) return;
      if (loadError) {
        setError(loadError.message);
        setLoaded(true);
        return;
      }

      let rows = (data ?? []).map((r) => r.data as T);
      if (rows.length === 0 && seed && seed.length > 0) {
        // Sequential created_at keeps the seed's order stable
        const base = Date.now();
        const { error: seedError } = await supabase.from(table).upsert(
          seed.map((item, i) => ({ id: item.id, data: item, created_at: new Date(base + i).toISOString() })),
          { onConflict: 'id', ignoreDuplicates: true }
        );
        if (seedError) setError(seedError.message);
        rows = seed;
      }
      commit(sortRef.current ? [...rows].sort(sortRef.current) : rows);
      setLoaded(true);
    };

    const channel = supabase
      .channel(`sync:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id;
          if (id) commit(itemsRef.current.filter((i) => i.id !== id));
          return;
        }
        const item = (payload.new as { data: T }).data;
        const serialized = JSON.stringify(item);
        const echoes = pendingEchoes.current.get(item.id);
        const echoIndex = echoes?.indexOf(serialized) ?? -1;
        if (echoes && echoIndex >= 0) {
          // Our own write: drop it and anything older we wrote before it
          echoes.splice(0, echoIndex + 1);
          return;
        }
        applyRemote(item);
      })
      .subscribe();

    void load();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
    // seed is only read on first load; keeping it out of deps avoids reloading on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, table, limit, commit, applyRemote]);

  return { items, setItems, applyRemote, loaded, error };
}
