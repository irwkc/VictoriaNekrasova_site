# VICTORIA NEKRASOVA — Digital Portfolio

Fashion-first portfolio platform for Victoria Nekrasova with cinematic storytelling, 3D corridor navigation, RU/EN localization, and a production-ready admin flow for managing media.

## Live

- Main site: [https://victorianekrasova.ru](https://victorianekrasova.ru)
- Admin panel: [https://victorianekrasova.ru/admin](https://victorianekrasova.ru/admin)

## Why this project

This project is built to present model work as an editorial experience, not a static gallery:

- Immersive hero with interactive visual effects
- Scroll-driven sequence and 3D archive corridor
- Curated gallery and album-based portfolio sections
- RU/EN localization with language-first preloader flow
- Fast media delivery and SEO-ready metadata

## Feature Highlights

- **Brand experience:** custom preloader, animated transitions, cinematic typography
- **Portfolio architecture:** corridor, gallery, and category-based album pages
- **Content management:** secure admin login, content editing, media upload/delete APIs
- **Production deployment:** automated build + rsync deploy + nginx/api service setup
- **SEO/marketing foundation:** canonical tags, Open Graph, sitemap, robots, social preview image

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Motion
- Three.js / React Three Fiber
- Lenis smooth scrolling
- Node.js API (content + admin auth + media ops)
- nginx + Let's Encrypt deployment scripts

## Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deployment

Deploy to VPS using project scripts:

```bash
bash scripts/deploy.sh
```

Enable HTTPS (once DNS points to the server):

```bash
bash scripts/setup-ssl.sh victorianekrasova.ru
```

## Repository Structure

- `src/` — frontend app (pages, components, i18n, animation logic)
- `server/` — Node API for admin auth/content/media operations
- `public/` — static media and SEO assets
- `scripts/` — deploy, SSL setup, favicon/OG generation utilities

## License

MIT — see `LICENSE`.
