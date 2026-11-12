export interface PlateAlt {
  comet: string;
  eclipse: string;
  nebula: string;
  rocket: string;
  moon: string;
  saturn: string;
  sphere: string;
  belt: string;
  cluster: string;
  capsule: string;
}

export const PLATE_ALT: PlateAlt = {
  comet: 'halftone plate: a comet with a bright head and a long dust tail',
  eclipse: 'halftone plate: a total eclipse, dark disc inside a thin corona ring',
  nebula: 'halftone plate: a nebula, bright core inside uneven veils of gas',
  rocket: 'halftone plate: a rocket climbing with a short flame below it',
  moon: 'halftone plate: a moon with craters and a few stars behind it',
  saturn: 'halftone plate: saturn with a tilted ring system and scattered stars',
  sphere: 'halftone plate: a planet shaded from the upper left',
  belt: 'halftone plate: an asteroid belt, rocks of mixed size across a star field',
  cluster: 'halftone plate: a globular star cluster, hundreds of stars packed to one core',
  capsule: 'halftone plate: a space capsule re-entering, wake burning under its shield',
};

export const PLATES = [
  'comet',
  'eclipse',
  'nebula',
  'rocket',
  'moon',
  'saturn',
  'sphere',
  'belt',
  'cluster',
  'capsule',
] as const;

export type PlateName = (typeof PLATES)[number];

export const PLATE_LABEL: Record<PlateName, { fig: string; subject: string; glyph: string; alt: string }> = {
  comet: { fig: 'fig. 01', subject: 'comet · 彗', glyph: '彗', alt: PLATE_ALT.comet },
  eclipse: { fig: 'fig. 02', subject: 'eclipse · 蝕', glyph: '蝕', alt: PLATE_ALT.eclipse },
  nebula: { fig: 'fig. 03', subject: 'nebula · 雲', glyph: '雲', alt: PLATE_ALT.nebula },
  rocket: { fig: 'fig. 04', subject: 'rocket · 矢', glyph: '矢', alt: PLATE_ALT.rocket },
  moon: { fig: 'fig. 05', subject: 'moon · 月', glyph: '月', alt: PLATE_ALT.moon },
  saturn: { fig: 'fig. 06', subject: 'saturn · 星', glyph: '星', alt: PLATE_ALT.saturn },
  sphere: { fig: 'fig. 07', subject: 'planet · 球', glyph: '球', alt: PLATE_ALT.sphere },
  belt: { fig: 'fig. 08', subject: 'belt · 環', glyph: '環', alt: PLATE_ALT.belt },
  cluster: { fig: 'fig. 10', subject: 'cluster · 群', glyph: '群', alt: PLATE_ALT.cluster },
  capsule: { fig: 'fig. 09', subject: 'capsule · 舟', glyph: '舟', alt: PLATE_ALT.capsule },
};

export function plateFor(pathname: string): PlateName {
  const map: Array<[RegExp, PlateName]> = [
    [/moderation|automod|protection|blacklist|logs|audit/, 'eclipse'],
    [/tickets|suggestions|forms|polls/, 'nebula'],
    [/levels|economy|minigames|clans|leaderboard|donors/, 'rocket'],
    [/music|notifications|soutien|premium|starboard/, 'cluster'],
    [/welcome|autoroles|embeds|settings|servers|users|connected|deploy|services|metrics|changelogs|announcements/, 'moon'],
    [/dashboard|overview|stats|docs|2fa|commands/, 'saturn'],
  ];
  for (const [pattern, plate] of map) {
    if (pattern.test(pathname)) return plate;
  }
  return 'sphere';
}
