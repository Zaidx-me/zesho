const POTTER_API_BASE = 'https://potterapi-fedeperin.vercel.app/en';

export interface PotterBook {
  number: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  description: string;
  pages: number;
  cover: string;
  index: number;
}

export interface PotterCharacter {
  fullName: string;
  nickname: string;
  hogwartsHouse: string;
  interpretedBy: string;
  children: string[];
  image: string;
  birthdate: string;
  index: number;
}

export interface PotterHouse {
  house: string;
  emoji: string;
  founder: string;
  colors: string[];
  animal: string;
  index: number;
}

export interface PotterSpell {
  spell: string;
  use: string;
  index: number;
}

async function fetchJson<T>(path: string): Promise<T> {
  const resp = await fetch(`${POTTER_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!resp.ok) return [] as any;
  return resp.json();
}

export async function getPotterBooks(): Promise<PotterBook[]> {
  try {
    return await fetchJson<PotterBook[]>('/books');
  } catch { return []; }
}

export async function getPotterCharacters(): Promise<PotterCharacter[]> {
  try {
    return await fetchJson<PotterCharacter[]>('/characters');
  } catch { return []; }
}

export async function getPotterHouses(): Promise<PotterHouse[]> {
  try {
    return await fetchJson<PotterHouse[]>('/houses');
  } catch { return []; }
}

export async function getPotterSpells(): Promise<PotterSpell[]> {
  try {
    return await fetchJson<PotterSpell[]>('/spells');
  } catch { return []; }
}

export async function getRandomCharacter(): Promise<PotterCharacter | null> {
  try {
    return await fetchJson<PotterCharacter>('/characters/random');
  } catch { return null; }
}

export async function getRandomSpell(): Promise<PotterSpell | null> {
  try {
    return await fetchJson<PotterSpell>('/spells/random');
  } catch { return null; }
}

export async function searchPotterCharacters(query: string): Promise<PotterCharacter[]> {
  try {
    return await fetchJson<PotterCharacter[]>(`/characters?search=${encodeURIComponent(query)}`);
  } catch { return []; }
}

export async function searchPotterSpells(query: string): Promise<PotterSpell[]> {
  try {
    return await fetchJson<PotterSpell[]>(`/spells?search=${encodeURIComponent(query)}`);
  } catch { return []; }
}
