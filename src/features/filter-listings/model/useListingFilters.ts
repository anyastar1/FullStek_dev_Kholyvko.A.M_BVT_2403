import { useCallback, useMemo, useState } from "react";
import type { ListingStatus, Pet, PetSpecies } from "@/entities/pet";

export const ALL_CITIES = "Все города";

export interface ListingFilters {
  status: ListingStatus | "all";
  species: PetSpecies | "all";
  city: string;
  query: string;
}

export type SetFilter = <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => void;

const initialFilters: ListingFilters = { status: "all", species: "all", city: ALL_CITIES, query: "" };
export function useListingFilters(pets: Pet[]) {
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);

  const setFilter: SetFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters(initialFilters), []);

  const cities = useMemo(
    () => [ALL_CITIES, ...Array.from(new Set(pets.map((pet) => pet.city))).sort((a, b) => a.localeCompare(b, "ru"))],
    [pets],
  );

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return pets.filter((pet) => {
      if (filters.status !== "all" && pet.status !== filters.status) return false;
      if (filters.species !== "all" && pet.species !== filters.species) return false;
      if (filters.city !== ALL_CITIES && pet.city !== filters.city) return false;
      if (query) {
        const haystack = [pet.name, pet.breed, pet.color, pet.description].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [pets, filters]);

  const activeCount = [
    filters.status !== "all",
    filters.species !== "all",
    filters.city !== ALL_CITIES,
    filters.query.trim() !== "",
  ].filter(Boolean).length;

  return { filters, setFilter, reset, cities, filtered, activeCount };
}
