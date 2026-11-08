import { useCallback } from "react";
import { disableDemoMode } from "@/shared/lib/demoMode";
import { useAsync } from "@/shared/lib/useAsync";
import { fetchPet, fetchPets, fetchPetsByAuthor } from "../api/petApi";
export function usePets() {
  const state = useAsync(fetchPets);
  const { reload } = state;
  const retry = useCallback(() => {
    disableDemoMode();
    reload();
  }, [reload]);
  return { ...state, retry };
}


export function usePet(id: string | undefined) {
  const state = useAsync(() => (id ? fetchPet(id) : Promise.resolve(null)), [id]);
  const { reload } = state;
  const retry = useCallback(() => {
    disableDemoMode();
    reload();
  }, [reload]);
  return { ...state, retry };
}


export function usePetsByAuthor(authorId: string) {
  const state = useAsync(() => fetchPetsByAuthor(authorId), [authorId]);
  const { reload } = state;
  const retry = useCallback(() => {
    disableDemoMode();
    reload();
  }, [reload]);
  return { ...state, retry };
}
