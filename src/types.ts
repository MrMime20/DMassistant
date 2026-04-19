
export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  exp: number;
}

export interface CampaignData {
  name: string;
  nextSession: string;
  party: PartyMember[];
  maps: MapData[];
  npcs: NPC[];
  notes: CampaignNote[];
  music: MusicTrack[];
  theme: 'light' | 'dark';
  activeEncounter?: Encounter;
}

export interface Monster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { value: number; type: string }[];
  hit_points: number;
  hit_dice: string;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: { value: number; proficiency: { name: string; index: string } }[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: { name: string; index: string }[];
  senses: Record<string, string | number>;
  languages: string;
  challenge_rating: number;
  xp: number;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
  image?: string;
}

export interface Spell {
  index: string;
  name: string;
  desc: string[];
  range: string;
  components: string[];
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: { name: string; index: string };
  classes: { name: string; index: string }[];
}

export interface EncounterParticipant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  isPlayer: boolean;
  monsterIndex?: string;
  notes?: string;
  conditions: string[];
}

export interface Encounter {
  id: string;
  name: string;
  participants: EncounterParticipant[];
  currentTurnIndex: number;
  round: number;
  isActive: boolean;
}

export interface NPC {
  id: string;
  name: string;
  race: string;
  occupation: string;
  alignment: string;
  notes: string;
  personality: string;
  statBlock?: Partial<Monster>;
  images?: string[];
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  images?: string[];
}

export interface MusicTrack {
  id: string;
  title: string;
  youtubeUrl: string;
}

export interface MapData {
  id: string;
  name: string;
  backgroundUrl: string | null;
  tokens: MapToken[];
}

export interface MapToken {
  id: string;
  name: string;
  x: number;
  y: number;
  emoji?: string;
  imageUrl?: string | null;
  isPlayer?: boolean;
  type?: 'actor' | 'terrain' | 'area';
  rotation?: number;
  size?: number;
}
