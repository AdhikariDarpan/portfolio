# Darpan Adhikari | Portfolio

A static portfolio built with Astro, Tailwind CSS, MDX, and a small set of React islands. The site covers services, project case studies, experience, a web résumé, and contact details.

Live site: [www.darpanadhikari.com.np](https://www.darpanadhikari.com.np)

## Stack

- Astro 5, TypeScript, Tailwind CSS 4
- MDX content collections for project case studies
- React 19 islands for project filtering and the command palette
- GitHub Pages deployment through GitHub Actions
- Custom domain via `public/CNAME` (root `CNAME` kept during the legacy Pages migration)

## Local development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

```bash
npm run check    # type and content checks
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Content

Project case studies live in `src/content/projects/*.mdx`. The schema is defined in `src/content.config.ts`.

A project entry uses:

```yaml
title:
seoTitle:
description:
summary:
outcome:
category: ai | web | product | desktop | mobile | open-source
status: live | shipped | private | in-progress
year:
role:
client:
timeline:
stack: []
tags: []
image:
imageAlt:
repo:
live:
packageUrl:
featured:
private:
order:
accent:
highlights: []
decisions:
  - title:
    body:
capabilities: []
metrics: []
draft:
```

Use `seoTitle` for a keyword-focused search title when the project name alone is ambiguous. Keep `title` as the display name. Use `outcome` for the short result line on project cards and `decisions` for the engineering tradeoffs shown on selected case studies. `src/data/site.ts` holds the profile, navigation, experience, education, skills, categories, and SEO defaults. `src/data/services.ts` holds service offers, technical proof cards, the client process, engagement models, and FAQs. Update those files when changing positioning or contact information.

Images go in `public/images/`. Project screenshots use `public/images/projects/`. Projects without a screenshot fall back to a generated accent panel.

## Pages

- `/`: home
- `/projects/`: filterable project archive
- `/projects/[slug]/`: generated MDX case studies
- `/services/`: offers, process, engagement models, and FAQs
- `/about/`
- `/experience/`
- `/resume/`: printable web résumé; no public PDF
- `/contact/`: mailto contact form
- `/404/`

## Deployment

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and deploys it with GitHub Pages.

In the GitHub repository settings:

1. Set **Pages → Build and deployment → Source** to **GitHub Actions**.
2. Keep the custom domain configured as `www.darpanadhikari.com.np`.
3. Ensure DNS points to GitHub Pages; `public/CNAME` is copied into the build. The root `CNAME` is only for the existing legacy Pages source and can be removed after switching to GitHub Actions.
4. After the first successful deployment, enable **Enforce HTTPS** and disable the old `3d-portfolio` Pages site to avoid duplicate indexing.

The workflow pins Node 22 and uses `withastro/action@v3` to install, build, and upload the static output.

## Design notes

The site is intentionally static, content-first, and accessible without JavaScript. React is limited to progressive enhancement features.

The contact form does not post to a third-party service. It opens a prefilled email draft.
