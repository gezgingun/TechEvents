# TechEventTracker — On-site Tech Events Index

This project hosts a single agent that maintains a curated list of **on-site (in-person) technology events**, organised into two regions and rendered as a small Eleventy site (Netherlands tab / Europe tab) for GitHub Pages.

## Available agents

| Agent | File | Output | Region split | Sort order |
|---|---|---|---|---|
| Tech Events Tracker | [agents/tech-events-tracker.md](agents/tech-events-tracker.md) | `netherlands/YYYY-MM-DD_<slug>.md`, `europe/YYYY-MM-DD_<slug>.md` | NL → `netherlands/`, rest of Europe → `europe/` (never both) | Soonest first (ascending by event date) |

## Routing

- **"track tech events", "list tech events", "find on-site tech events", "refresh the events"** → run the **Tech Events Tracker** ([agents/tech-events-tracker.md](agents/tech-events-tracker.md)).
- **"add &lt;event name&gt;"** → use the **single-event add** flow described in the agent file (verify date + city from the official URL, pick region, write one file).

When you invoke the agent, **read the file first** and follow it verbatim &mdash; don't paraphrase its rules from memory.

## Site structure

- `netherlands/` and `europe/` &mdash; one markdown file per event, named `YYYY-MM-DD_<slug>.md` using the **event start date**. Each folder has a `.11tydata.js` that parses the date from the filename and sets the right layout / permalink / collection tags.
- `index.njk` &mdash; the home page, renders the **Netherlands** tab.
- `europe.njk` &mdash; renders the **Europe** tab at `/europe/`.
- `_includes/layouts/base.njk` &mdash; shared shell with the two-tab nav.
- `_includes/layouts/event.njk` &mdash; per-event detail page.
- `.eleventy.js` &mdash; defines the `upcomingByDate` filter (drops past events, sorts ascending) and a few small date filters.
- `_data/site.js` &mdash; configures the GitHub Pages origin and path prefix.
- `.github/workflows/deploy.yml` &mdash; builds the site and deploys to GitHub Pages on push to `main`/`master`.

## Conventions

- **Dates in filenames are event dates, not run dates.** A file is named after the event it describes.
- **One event = one file = one region.** Never duplicate an event into both folders.
- **Frontmatter must include** `title`, `eventDate`, `location`, `website`, `description`. `tickets` is optional.
- **Past events** older than 14 days are deleted by the agent's retention step. Anything in the tree but in the past is hidden by the listing template anyway.
- **Print the output paths** after writing so the user can open them.

## Local preview

```
npm install
npm run serve
```

Then open the URL Eleventy prints (defaults to `http://localhost:8080/TechEventTracker/`).

## Publishing

1. Create a GitHub repo (suggested name: `TechEventTracker`).
2. Update `_data/site.js` with your `<user>.github.io` origin and the repo path prefix (or `/` if the repo is named `<user>.github.io`).
3. Push to `main` &mdash; the workflow at `.github/workflows/deploy.yml` builds and publishes the site.
4. Enable GitHub Pages → Source: GitHub Actions in repo settings.
