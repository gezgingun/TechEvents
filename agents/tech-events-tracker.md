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
3. **Search for upcoming events** in two passes:
   - **Netherlands pass.** Use `WebSearch` and/or `WebFetch` against:
     - Aggregators: techmeetups.nl, dutchitchannel.nl, techleap.nl events page, eventbrite.com (Netherlands tech category), meetup.com (Amsterdam/Rotterdam/Utrecht/Eindhoven/The Hague tech), 10times.com (NL).
     - Known recurring NL events (verify they are still scheduled): TNW Conference (Amsterdam), Web Summit Amsterdam (if running), Devoxx UK is **not** NL &mdash; goes in Europe; Techorama (Antwerp) is **not** NL &mdash; goes in Europe; **Code Motion Amsterdam**, **GOTO Amsterdam**, **DevWorld Conference Amsterdam**, **WeAreDevelopers** (when in NL), **AI Summit Amsterdam**, **Money 20/20 Europe** (Amsterdam), **Cyber Security Week** (The Hague), **High Tech Campus Eindhoven** events, **Bits&amp;Chips Event** (Eindhoven), **ISC West** &mdash; not NL.
   - **Europe pass.** Same approach for the rest of Europe. Reach for:
     - Aggregators: 10times.com (Europe tech), confs.tech, dev.events (europe), eventbrite Europe tech, devevents.com.
     - Known recurring events: **Web Summit** (Lisbon), **Slush** (Helsinki), **VivaTech** (Paris), **Mobile World Congress / 4YFN** (Barcelona), **Bits &amp; Pretzels** (Munich), **DLD Munich**, **OFFF** (Barcelona), **WeAreDevelopers World Congress** (Berlin/Vienna), **Devoxx** (Antwerp/Paris/UK), **GOTO Copenhagen / Berlin / Aarhus**, **DroidCon** (London/Berlin/Lisbon/Italy), **FOSDEM** (Brussels), **PyCon** chapters (DE/IT/UK/etc), **Black Hat Europe** (London), **CCC / 38C3 / 39C3** (Hamburg), **NDC** (Oslo/London/Copenhagen/Porto), **Disrupt Berlin** (if running), **Reaktor Breakpoint**, **Latitude59** (Tallinn), **BalticBridge**, **Pirate Summit** (Cologne), **Codemotion Milan / Rome / Madrid**, **AI &amp; Big Data Expo Europe** (Amsterdam &mdash; if Amsterdam, that's NL), **InfoSecurity Europe** (London), **CYBERUK**, **Wikimania** (when in Europe).
4. **For each event found**, capture:
   - **Title** (use the official short name)
   - **Date** &mdash; for multi-day events, use the **start date** for filename and frontmatter `eventDate`. Note the full range in the body.
   - **City, Country** (location)
   - **Short description** (1&ndash;3 sentences &mdash; what is it, who is it for)
   - **Official website URL**
   - **Ticket / registration URL** (omit if there isn't one separate from the official site)
5. **Deduplicate** across sources by title + date.
6. **Decide region.** If the city is in the Netherlands, the file goes in `netherlands/`. Otherwise the file goes in `europe/`. **Never put the same event in both folders.**
7. **Write one markdown file per event** following the [File Format](#file-format) below.
8. **Print a summary**: `Wrote N Netherlands events, M Europe events. Earliest: <title> on <date>.`

### Single-event add
If the user asks "add &lt;event name&gt;":
1. Confirm the date and city via `WebFetch` on the official URL the user gives you (or `WebSearch` for it if not provided).
2. Pick the region folder based on the city.
3. Write the file. Do not touch other files.

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
