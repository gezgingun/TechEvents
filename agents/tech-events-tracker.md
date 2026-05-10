# Agent: Tech Events Tracker

## Purpose
Maintain a curated index of **on-site (in-person) technology events** in two regions:

1. **Netherlands** &mdash; everything held in NL.
2. **Europe** &mdash; everything held elsewhere in Europe (NL events do **not** double-list here).

Output is one markdown file per event, in the corresponding folder. The site renders these as two tabs (Netherlands / Europe), with **the soonest event on top**. Past events fall off automatically because the listing template filters by `eventDate >= today`.

## When to use
Invoke when the user asks to:
- "track tech events", "find tech events", "update the events list"
- "add an event" (single-event add)
- "refresh the Netherlands tab", "refresh the Europe tab"
- "remove the past events" (housekeeping &mdash; see [Retention](#retention))

## Behavior

### Full-refresh run
1. **Determine today** from the conversation context (`currentDate`). All "upcoming" filtering is done relative to this date.
2. **Run housekeeping first** (see [Retention](#retention) below) so the next steps see a clean tree.
3. **Read the existing tree** before fetching: `Glob('netherlands/*.md')` and `Glob('europe/*.md')`, and `Read` each file's frontmatter into memory. This is what lets you **update in place** instead of producing duplicate files (see [Update-in-place rules](#update-in-place-rules) below).
4. **Search for upcoming events** in two passes:
   - **Netherlands pass.** Use `WebSearch` and/or `WebFetch` against:
     - Aggregators: techmeetups.nl, dutchitchannel.nl, techleap.nl events page, eventbrite.com (Netherlands tech category), meetup.com (Amsterdam/Rotterdam/Utrecht/Eindhoven/The Hague tech), 10times.com (NL).
     - Known recurring NL events (verify they are still scheduled): TNW Conference (Amsterdam), Web Summit Amsterdam (if running), Devoxx UK is **not** NL &mdash; goes in Europe; Techorama (Antwerp) is **not** NL &mdash; goes in Europe; **Code Motion Amsterdam**, **GOTO Amsterdam**, **DevWorld Conference Amsterdam**, **WeAreDevelopers** (when in NL), **AI Summit Amsterdam**, **Money 20/20 Europe** (Amsterdam), **Cyber Security Week** (The Hague), **High Tech Campus Eindhoven** events, **Bits&amp;Chips Event** (Eindhoven), **ISC West** &mdash; not NL.
   - **Europe pass.** Same approach for the rest of Europe. Reach for:
     - Aggregators: 10times.com (Europe tech), confs.tech, dev.events (europe), eventbrite Europe tech, devevents.com.
     - Known recurring events: **Web Summit** (Lisbon), **Slush** (Helsinki), **VivaTech** (Paris), **Mobile World Congress / 4YFN** (Barcelona), **Bits &amp; Pretzels** (Munich), **DLD Munich**, **OFFF** (Barcelona), **WeAreDevelopers World Congress** (Berlin/Vienna), **Devoxx** (Antwerp/Paris/UK), **GOTO Copenhagen / Berlin / Aarhus**, **DroidCon** (London/Berlin/Lisbon/Italy), **FOSDEM** (Brussels), **PyCon** chapters (DE/IT/UK/etc), **Black Hat Europe** (London), **CCC / 38C3 / 39C3** (Hamburg), **NDC** (Oslo/London/Copenhagen/Porto), **Disrupt Berlin** (if running), **Reaktor Breakpoint**, **Latitude59** (Tallinn), **BalticBridge**, **Pirate Summit** (Cologne), **Codemotion Milan / Rome / Madrid**, **AI &amp; Big Data Expo Europe** (Amsterdam &mdash; if Amsterdam, that's NL), **InfoSecurity Europe** (London), **CYBERUK**, **Wikimania** (when in Europe).
5. **For each event found**, capture:
   - **Title** (use the official short name)
   - **Date** &mdash; for multi-day events, use the **start date** for filename and frontmatter `eventDate`. Note the full range in the body.
   - **City, Country** (location)
   - **Short description** (1&ndash;3 sentences &mdash; what is it, who is it for)
   - **Official website URL**
   - **Ticket / registration URL** (omit if there isn't one separate from the official site)
6. **Deduplicate** across sources by title + date.
7. **Decide region.** If the city is in the Netherlands, the file goes in `netherlands/`. Otherwise the file goes in `europe/`. **Never put the same event in both folders.**
8. **Reconcile each event against the existing tree** using the [Update-in-place rules](#update-in-place-rules) &mdash; create new files only when no existing file matches; otherwise update or rename.
9. **Bump the last-updated timestamp.** Write today's date (`YYYY-MM-DD`) into `_data/lastUpdate.json` so the site footer reflects this run. Format:
   ```json
   { "date": "YYYY-MM-DD" }
   ```
10. **Print a summary**: `Wrote N new, updated M, renamed K, removed L. Earliest upcoming: <title> on <date>. Last update: <today>.`

### Single-event add
If the user asks "add &lt;event name&gt;":
1. Confirm the date and city via `WebFetch` on the official URL the user gives you (or `WebSearch` for it if not provided).
2. Pick the region folder based on the city.
3. Apply the [Update-in-place rules](#update-in-place-rules) &mdash; if a file for the same event already exists, **update it** rather than writing a duplicate.
4. Bump `_data/lastUpdate.json` to today's date.
5. Print which file was written / updated.

## File Format

Filename: `{region}/YYYY-MM-DD_<slug>.md` &mdash; where the date is the event's **start date** and the slug is a short kebab-case label.

Examples:
- `netherlands/2026-06-03_money2020-europe.md`
- `europe/2026-11-10_web-summit-lisbon.md`

If two events share the same date and slug (rare), append `-2`, `-3` to the slug.

File contents:

```markdown
---
title: <Official short name>
eventDate: YYYY-MM-DD
location: <City, Country>
website: <https://official-site>
tickets: <https://ticket-url>          # optional &mdash; omit the line if none
description: <one-line teaser, &lt;= 160 chars, used on the index page>
---

<Optional: 1&ndash;3 short paragraphs with extra context. Date range for multi-day events. Tracks/themes if known. Whether it's a hybrid event with an on-site track. Anything that helps a reader decide if it's worth attending.>
```

The frontmatter fields are consumed by the templates:
- `title` &mdash; rendered as the event-page `<h1>` and the index list link text.
- `eventDate` &mdash; redundant with the filename but kept in frontmatter so the body templates have it without filename parsing. **Must match the filename's date.**
- `location` &mdash; shown next to the date.
- `website` &mdash; "Official site" link.
- `tickets` &mdash; "Tickets" link.
- `description` &mdash; teaser shown on the index page (don't repeat the title).

## Update-in-place rules

When reconciling a found event against the existing tree, **never blindly create a new file if one might already exist** for the same event. Walk this decision tree:

1. **Match an existing file.** Iterate `netherlands/*.md` and `europe/*.md`. A file matches when *any* of these are true:
   - The frontmatter `website` URL is the same (canonicalise: strip trailing `/`, lowercase the host, ignore `?utm_*` params) &mdash; **strongest signal.**
   - The frontmatter `title` is the same after lower-casing and stripping the trailing year (e.g. "Web Summit 2026" ≡ "Web Summit").
   - The slug portion of the filename matches (e.g. both files end with `_web-summit-lisbon.md`) **and** the city in `location` matches.

   If multiple files match, prefer the one whose `eventDate` is closest to the newly-found date. If none match, this is a **new event** &mdash; write a fresh file using the [File Format](#file-format) below.

2. **Compare fields.** If a file matches, diff the existing frontmatter + body against the freshly-fetched values. Treat these as the authoritative fields: `title`, `eventDate`, `location`, `website`, `tickets`, `description`, plus the body. If **nothing has changed**, leave the file untouched (do **not** rewrite it just to refresh a timestamp &mdash; that creates pointless git churn).

3. **Update in place** if any field changed:
   - **Same `eventDate`:** rewrite the existing file via `Edit` (or `Write` if multiple fields shift). Keep the filename. Don't touch fields you didn't refresh.
   - **`eventDate` changed:** the filename's `YYYY-MM-DD` prefix is wrong. **Rename**: write the new file at `<region>/<new-date>_<slug>.md`, then delete the old file. The slug stays the same unless the official event name itself changed materially. Print `Renamed <old> &rarr; <new>`.
   - **Region changed** (rare &mdash; e.g. an event moved from Amsterdam to Brussels): write the new file in the *new* region folder and delete the old file in the previous one. Print `Moved <title> from <old-region>/ to <new-region>/`.

4. **Stale files** (events that exist in the tree but were *not* re-found in this run) are **not** automatically deleted &mdash; the agent's web search may simply have missed them. Only the [Retention](#retention) step removes files, and only based on the date prefix. If you have explicit evidence an event was cancelled (e.g. the official site says so), delete it and note it in the run summary.

5. **Idempotency check.** A second back-to-back run with no upstream changes should write zero files and rename zero files. If you find yourself rewriting unchanged files, your diff logic is wrong &mdash; fix the comparison, don't paper over it.

## Retention

At the **start** of every full-refresh run (and only then &mdash; not for single-event adds):

1. List `netherlands/*.md` and `europe/*.md`.
2. For each filename, parse the `YYYY-MM-DD` date prefix.
3. If that date is **more than 14 days before today**, delete the file. (Past events older than two weeks aren't useful and clutter the tree.)
4. If a filename does not start with `YYYY-MM-DD`, skip it.
5. Print one line listing what was deleted (or "no past events older than 14 days").

Note: the listing template *also* hides past events at render time, so a stale file in the tree is invisible to the site &mdash; this retention step is just to keep the repo tidy.

## Sorting / display

The index pages call the `upcomingByDate` filter from `.eleventy.js`:
- **Filter:** keep only items where `eventDate >= today (UTC)`.
- **Sort:** ascending by `eventDate` &mdash; **the soonest event is on top** (this is the inverse of how the SocialWork digests sort).

## Notes for the agent

- **On-site only.** Skip purely virtual events. Hybrid is fine if there is a meaningful on-site track.
- **Verify dates from the official site before writing.** Aggregators often show stale years.
- **Use the start date** for multi-day events &mdash; the body should mention the full range.
- **Don't fabricate ticket URLs.** If the official site is the only registration path, omit the `tickets` field.
- **Be terse in the description.** It appears on the index page next to dozens of others &mdash; one line, no marketing fluff.
- **Don't include the year in the slug** &mdash; the date prefix already carries it.
- **Capitalise countries and city names properly** in `location` (e.g. "Amsterdam, Netherlands" not "amsterdam, netherlands").
