import { useCallback, useRef, useState } from "react";
import { searchSimilar, type Pet, type PetSpecies } from "@/entities/pet";
import { disableDemoMode } from "@/shared/lib/demoMode";

export type SearchStatus = "idle" | "loading" | "done" | "error";

interface SearchArgs {
  file: File;
  species: PetSpecies;
}
export function useSimilarSearch() {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const lastArgs = useRef<SearchArgs | null>(null);

  const run = useCallback(async (file: File, species: PetSpecies) => {
    const id = ++requestId.current;
    lastArgs.current = { file, species };
    setStatus("loading");
    setError(null);
    try {
      const found = await searchSimilar(file, species);
      if (id !== requestId.current) return; // пришёл устаревший ответ
      setResults(found);
      setStatus("done");
    } catch (reason: unknown) {
      if (id !== requestId.current) return;
      setError(reason instanceof Error ? reason.message : "Не удалось выполнить поиск");
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    disableDemoMode();
    if (lastArgs.current) void run(lastArgs.current.file, lastArgs.current.species);
  }, [run]);
  const reset = useCallback(() => {
    requestId.current += 1;
    setStatus("idle");
    setResults([]);
    setError(null);
  }, []);

  return { status, results, error, run, retry, reset };
}
