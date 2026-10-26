# danblack.co

My personal site. It's a little pixel-art world: a sky full of drifting clouds and birds up top, grass along the bottom, and the actual content in a text box in the middle.

Under the hood it's a fully static site. Every page ships as plain HTML, so search engines, AI crawlers, and link previews see everything, and JavaScript only shows up where something is actually interactive.

## Things worth knowing about

- **The sky is live.** It follows the current weather and time of day in Denver (via [Open-Meteo](https://open-meteo.com/)): sunny, cloudy, rain, snow, storms, dawn, dusk, and night with stars and bats.
- **There's something in the grass.** Find it and you can change the sky yourself. For a quick preview you can also use `?time=night&weather=snow` (`?time=auto` resets).
- **The home page is the menu.** Each section lives in its own band of the sky, and clicking one zooms into it.
- **Experience pages have scenes.** True Anomaly launches you into orbit around a rotating Earth; Freightquote puts you on a prairie highway.
- **All the art is generated.** Sprites are drawn as ASCII grids (or a little code) and turned into SVGs and PNGs by a script.

## Stack

- [Astro](https://astro.build) (static output) with View Transitions
- React islands for the interactive bits (like the audio demos in blog posts)
- Hand-written CSS, mostly in one stylesheet, for the layout and all the scenery
- TypeScript everywhere

## Getting started

You'll need Node 24 and pnpm.

```sh
nvm use
pnpm install
pnpm dev
```

Then open http://localhost:4321.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the site locally |
| `pnpm build` | Builds the static site into `web/dist` |
| `pnpm --filter web sprites` | Regenerates all the pixel art in `web/public/sprites` |

## How it's laid out

```
web/                    the Astro site
  src/pages/            routes (home, sections, writing, experience)
  src/content/          writing posts and experience entries (Markdown/MDX)
  src/components/       the scenery: sky, weather, boats, scenes, transitions
  src/islands/          React components that run in the browser
  src/styles/global.css palette, layout, and most of the animation
  scripts/              sprite generators (sprites.mjs, earth.mjs)
```

## Adding stuff

- **A blog post:** drop a `.md` file in `web/src/content/writing/` with `title`, `description`, and `pubDate` in the frontmatter. Use `.mdx` if you want components in it, and `draft: true` to keep it out of production.
- **A job:** add a Markdown file to `web/src/content/experience/`. The frontmatter holds the company, roles and dates, and which scene to show.
- **A project:** add an entry to `web/src/projects.ts`.
- **Art:** edit the grids in `web/scripts/sprites.mjs` (or the Earth in `earth.mjs`) and run the sprites command.
