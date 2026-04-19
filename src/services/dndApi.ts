
const BASE_URL = 'https://www.dnd5eapi.co/api';

export const dndApi = {
  async getSpells(search?: string) {
    try {
      const res = await fetch(`${BASE_URL}/spells`);
      if (!res.ok) throw new Error(`Spells fetch failed: ${res.status}`);
      const data = await res.json();
      if (search) {
        return (data.results || []).filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));
      }
      return data.results || [];
    } catch (err) {
      console.error('Error fetching spells:', err);
      return [];
    }
  },

  async getSpellDetails(index: string) {
    try {
      const res = await fetch(`${BASE_URL}/spells/${index}`);
      if (!res.ok) throw new Error(`Spell fetch failed: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error(`Error fetching spell ${index}:`, err);
      return null;
    }
  },

  async getMonsters(search?: string) {
    try {
      const res = await fetch(`${BASE_URL}/2014/monsters`);
      if (!res.ok) throw new Error(`Monsters fetch failed: ${res.status}`);
      const data = await res.json();
      if (search) {
        return (data.results || []).filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()));
      }
      return data.results || [];
    } catch (err) {
      console.error('Error fetching monsters:', err);
      return [];
    }
  },

  async getMonsterDetails(index: string) {
    try {
      // Primary attempt with trailing slash
      const res = await fetch(`${BASE_URL}/2014/monsters/${index}/`);
      if (res.ok) return res.json();
      
      // Fallback without trailing slash
      const res2 = await fetch(`${BASE_URL}/2014/monsters/${index}`);
      if (res2.ok) return res2.json();
      
      throw new Error(`Monster details fetch failed for ${index}`);
    } catch (err) {
      console.error(`Error fetching monster ${index}:`, err);
      return null;
    }
  },

  async getRuleSections() {
    try {
      const res = await fetch(`${BASE_URL}/rule-sections`);
      if (!res.ok) throw new Error(`Rule sections fetch failed: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('Error fetching rule sections:', err);
      return { results: [] };
    }
  },

  async getRuleSectionDetails(index: string) {
    try {
      const res = await fetch(`${BASE_URL}/rule-sections/${index}`);
      if (!res.ok) throw new Error(`Rule section fetch failed: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error(`Error fetching rule section ${index}:`, err);
      return null;
    }
  }
};
