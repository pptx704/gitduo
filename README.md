# GitDuo

A GitHub client with Duolingo-inspired UI/UX. Streaks, XP, levels, and badges turn your GitHub activity into a gamified experience.

Built with SvelteKit, Svelte 5, TypeScript, and vanilla CSS.

## Features

- **Dashboard** with daily contribution stats, XP, player level, weekly goals, and activity feed
- **User profiles** with contribution calendar, language skill badges, and leveling system
- **Repository browser** with file tree, syntax highlighting (Shiki), branch switching, and clone URLs
- **Issues & Pull Requests** with labels, assignees, milestones, CI status, merge actions, and comment threads
- **Commits** with grouped history, diff viewer, and commit status indicators
- **Actions** with workflow run history, job/step drill-down, and summary stats
- **Releases** with assets, changelogs, and source archives
- **Explore** with repository search and trending repos
- **Notifications** inbox with filtering

## Setup

Requires [Node.js](https://nodejs.org/) and [Bun](https://bun.sh/).

```bash
bun install
```

Create a `.env` file with a GitHub OAuth app or personal access token:

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=...
```

## Development

```bash
bun run dev
```

## Build

```bash
bun run build
bun run preview
```

## Tech Stack

- **Framework:** SvelteKit + Svelte 5 (runes)
- **Language:** TypeScript
- **Styling:** Vanilla CSS with `--duo-*` design tokens, scoped `<style>` blocks
- **Icons:** Lucide Svelte
- **Code highlighting:** Shiki (lazy-loaded)
- **Package manager:** Bun

## License

[MIT](LICENSE)
