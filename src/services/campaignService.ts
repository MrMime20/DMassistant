import { storage } from '../lib/storage';
import { MusicTrack, PartyMember, MapData, MapToken, CampaignData } from '../types';

export type { MusicTrack, PartyMember, MapData, MapToken, CampaignData };

const DEFAULT_CAMPAIGN: CampaignData = {
  name: "Tomb of Annihilation",
  nextSession: "Crimson Moon Ritual",
  party: [
    { id: '1', name: 'Harolinda', class: 'Paladin', level: 5, hp: 45, maxHp: 45, ac: 18, exp: 6500 },
    { id: '2', name: 'Cynthannis', class: 'Wizard', level: 5, hp: 28, maxHp: 28, ac: 12, exp: 6500 },
    { id: '3', name: 'Agnestine', class: 'Rogue', level: 5, hp: 35, maxHp: 35, ac: 15, exp: 6500 },
    { id: '4', name: 'Gloreen', class: 'Cleric', level: 5, hp: 38, maxHp: 38, ac: 16, exp: 6500 },
  ],
  maps: [
    {
      id: 'default',
      name: 'Campsite Default',
      backgroundUrl: 'https://i.redd.it/20htskfncyka1.jpg',
      tokens: []
    }
  ],
  npcs: [],
  notes: [],
  music: [],
  theme: 'light',
  activeEncounter: undefined
};

export const campaignService = {
  get: (): CampaignData => {
    const data = storage.get('campaign_data', DEFAULT_CAMPAIGN);
    // Ensure all required fields exist to prevent rendering crashes
    return {
      ...DEFAULT_CAMPAIGN,
      ...data,
      party: Array.isArray(data.party) ? data.party : DEFAULT_CAMPAIGN.party,
      maps: Array.isArray(data.maps) ? data.maps : DEFAULT_CAMPAIGN.maps,
      npcs: Array.isArray(data.npcs) ? data.npcs : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
      music: Array.isArray(data.music) ? data.music : [],
      activeEncounter: data.activeEncounter || storage.get('active_encounter', undefined)
    };
  },
  set: (data: CampaignData) => storage.set('campaign_data', data),
  update: (updates: Partial<CampaignData>) => {
    const current = campaignService.get();
    const updated = { ...current, ...updates };
    campaignService.set(updated);
    return updated;
  }
};
