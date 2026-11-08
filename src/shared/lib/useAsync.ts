import { useCallback, useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface Snapshot<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}


export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSnapshot((prev) => ({ ...prev, loading: true, error: null }));
    load()
      .then((data) => {
        if (!cancelled) setSnapshot({ data, loading: false, error: null });
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setSnapshot({
            data: null,
            loading: false,
            error: reason instanceof Error ? reason.message : "Произошла неизвестная ошибка",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { ...snapshot, reload };
}
