export interface StickerItem {
  id: string;
  name: string;
  url: string;
  category: 'Troops' | 'Emotes' | 'Reactions';
}

export const STICKERS: StickerItem[] = [
  {
    id: 'sticker_1',
    name: 'Barbarian Laughing',
    url: '/stickers/assets/sticker_1_barbarian_laughing_hysterically_emo.png',
    category: 'Emotes',
  },
  {
    id: 'sticker_2',
    name: 'Barbarian Battle Shout',
    url: '/stickers/assets/sticker_2_barbarian_screaming_battle_shout.png',
    category: 'Emotes',
  },
  {
    id: 'sticker_3',
    name: 'Goblin Grin',
    url: '/stickers/assets/sticker_3_goblin_with_greedy_mischievous_grin.png',
    category: 'Emotes',
  },
  {
    id: 'sticker_4',
    name: 'Grand Warden Stop',
    url: '/stickers/assets/sticker_4_grand_warden.png',
    category: 'Troops',
  },
  {
    id: 'sticker_5',
    name: 'PEKKA Butterfly',
    url: '/stickers/assets/sticker_5_p.e.k.k.a_glowing_pink_neon_eyes_ho.png',
    category: 'Troops',
  },
  {
    id: 'sticker_6',
    name: 'Royal Champion Rage',
    url: '/stickers/assets/sticker_6_royal_champion_in_full_battle_rage_.png',
    category: 'Troops',
  },
  {
    id: 'sticker_7',
    name: 'Valkyrie Whirlwind',
    url: '/stickers/assets/sticker_7_valkyrie_spinning_into_a_furious_re.png',
    category: 'Troops',
  },
  {
    id: 'sticker_8',
    name: 'Wizard Grin',
    url: '/stickers/assets/sticker_8_wizard_in_blue_hooded_cowl_with_coc.png',
    category: 'Troops',
  },
  {
    id: 'sticker_9',
    name: 'Bowler Reaction',
    url: '/stickers/assets/sticker_9_single_standalone_bowler.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_10',
    name: 'Archer Reaction',
    url: '/stickers/assets/sticker_10_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_11',
    name: 'Barbarian Victory',
    url: '/stickers/assets/sticker_11_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_12',
    name: 'Clash Warrior',
    url: '/stickers/assets/sticker_12_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_13',
    name: 'Giant Reaction',
    url: '/stickers/assets/sticker_13_single_standalone_giant.png',
    category: 'Troops',
  },
  {
    id: 'sticker_14',
    name: 'Healer Reaction',
    url: '/stickers/assets/sticker_14_single_standalone_healer.png',
    category: 'Troops',
  },
  {
    id: 'sticker_15',
    name: 'Witch Reaction',
    url: '/stickers/assets/sticker_15_single_standalone_witch.png',
    category: 'Troops',
  },
  {
    id: 'sticker_16',
    name: 'Sticker Emote 16',
    url: '/stickers/assets/sticker_16_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_17',
    name: 'Sticker Emote 17',
    url: '/stickers/assets/sticker_17_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_18',
    name: 'Sticker Emote 18',
    url: '/stickers/assets/sticker_18_single_standalone.png',
    category: 'Reactions',
  },
  {
    id: 'sticker_19',
    name: 'Sticker Emote 19',
    url: '/stickers/assets/sticker_19_single_standalone.png',
    category: 'Reactions',
  },
];

export function formatStickerOrText(msg?: any, fallback: string = ''): string {
  if (!msg) return fallback;
  const text = typeof msg === 'string' ? msg : msg.text;
  if (!text) return fallback;
  if (typeof msg === 'object' && msg?.isDeleted) return 'This dispatch was recalled.';

  if (
    text.startsWith('/stickers/') ||
    text.endsWith('.png') ||
    text.endsWith('.jpg') ||
    text.endsWith('.jpeg') ||
    text.endsWith('.webp') ||
    text.endsWith('.gif')
  ) {
    const matchedSticker = STICKERS.find((s) => s.url === text);
    if (matchedSticker) {
      return `[Sticker] ${matchedSticker.name}`;
    }
    return '[Sticker]';
  }
  return text;
}

