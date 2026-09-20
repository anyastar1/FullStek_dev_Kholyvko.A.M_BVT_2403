export type PetSpecies = "dog" | "cat" | "other";

export type ListingStatus = "lost" | "found";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  color: string;
  status: ListingStatus;
  city: string;
  district?: string;
  date: string; 
  description: string;
  photoUrl: string;
  contactName: string;
  contactPhone: string;
  matchScore?: number;
}

export const speciesLabel: Record<PetSpecies, string> = {
  dog: "Собака",
  cat: "Кошка",
  other: "Другое животное",
};

export const statusLabel: Record<ListingStatus, string> = {
  lost: "Потерян",
  found: "Найден",
};
