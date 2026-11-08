import { delay } from "@/shared/lib/delay";
import { getDemoMode } from "@/shared/lib/demoMode";
import type { NewListing, Pet, PetSpecies } from "../model/types";
import { mockPets } from "./mockData";

let store: Pet[] = [...mockPets];
let nextId = mockPets.length + 1;

const NETWORK_ERROR = "Не удалось связаться с сервером. Проверьте соединение и повторите попытку.";

async function simulateRequest(ms: number): Promise<void> {
  await delay(ms);
  if (getDemoMode() === "error") throw new Error(NETWORK_ERROR);
}

const newestFirst = (a: Pet, b: Pet) => b.date.localeCompare(a.date);

export async function fetchPets(): Promise<Pet[]> {
  await simulateRequest(700);
  if (getDemoMode() === "empty") return [];
  return [...store].sort(newestFirst);
}

export async function fetchPet(id: string): Promise<Pet | null> {
  await simulateRequest(400);
  return store.find((pet) => pet.id === id) ?? null;
}

export async function fetchPetsByAuthor(authorId: string): Promise<Pet[]> {
  await simulateRequest(500);
  return store.filter((pet) => pet.authorId === authorId).sort(newestFirst);
}

export async function createPet(input: NewListing, authorId: string): Promise<Pet> {
  await delay(800);
  const pet: Pet = { ...input, id: String(nextId++), authorId };
  store = [pet, ...store];
  return pet;
}

export async function deletePet(id: string): Promise<void> {
  await delay(500);
  store = store.filter((pet) => pet.id !== id);
}

export async function searchSimilar(file: File, species: PetSpecies): Promise<Pet[]> {
  await simulateRequest(1400);
  if (getDemoMode() === "empty") return [];
  return store
    .filter((pet) => pet.species === species)
    .map((pet) => ({ ...pet, matchScore: 60 + ((file.size + Number(pet.id) * 37) % 36) }))
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
