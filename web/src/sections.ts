// Site sections, top of the sky to the horizon. Each lives in its own sky band.
export const sections = [
  { slug: 'about', title: 'About', band: '--sky-2' },
  { slug: 'projects', title: 'Projects', band: '--sky-3' },
  { slug: 'experience', title: 'Experience', band: '--sky-4' },
  { slug: 'writing', title: 'Writing', band: '--sky-5' },
] as const;

export type Section = (typeof sections)[number];
