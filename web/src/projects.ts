import type { ImageMetadata } from 'astro';
import chiptunes from './assets/projects/chiptunes.png';

export interface Project {
  name: string;
  url: string;
  /** Source code link, if public. */
  repo?: string;
  tagline: string;
  description: string;
  tags: string[];
  image?: { src: ImageMetadata; alt: string };
  /** Label for the call-to-action link. */
  cta?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Chiptunes',
    url: 'https://chiptunes.studio/',
    repo: 'https://github.com/daniel-black/chiptune-tracker',
    tagline: 'A Game Boy–style music tracker that runs in your browser.',
    description:
      'Compose songs the way 8-bit composers did: note by note, in a grid. Write across three ' +
      "pulse channels and a noise channel, shape each note's duty cycle, volume, and rate, then " +
      'arrange patterns into a full song. Every sound is synthesized live with the Web Audio API.',
    tags: ['React', 'TypeScript', 'Jotai', 'Tailwind', 'Web Audio API'],
    image: {
      src: chiptunes,
      alt: 'The Chiptunes editor playing the song "Pixel Sunrise": rows of notes across three pulse channels and a noise channel, beside its Intro, Verse, Chorus, and Outro patterns arranged into a sequence.',
    },
    cta: 'Make a song',
    featured: true,
  },
];
