# martinlukk-dotcom

Personal website at <https://www.martinlukk.com>, built with [Quarto](https://quarto.org).

## Local development

```bash
quarto preview        # live-reloading dev server (use while editing)
quarto render         # one-shot build into _site/
```

Install Quarto: <https://quarto.org/docs/get-started/>.

## Repo layout

```
_quarto.yml          site config (theme, partials, filters, social meta, resources)
_includes/           HTML partials injected into every page
  header.html          topbar nav
  sidebar.html         left sidebar (photo, role, socials, copyright)
  scripts.html         <script> tags loaded after </body>
  pub-filter.html      project filter buttons (Research page)
  news-filter.html     category filter buttons (News page)
  footer.html          page-bottom copyright (mobile only)
_templates/          EJS templates for Quarto listings
  news-item-grouped.ejs   News page (year-grouped, all entries)
  news-item-recent.ejs    Home page (top 4 entries, hide_in_news-aware)
  news-item.ejs           generic news row (currently unused; kept as a base)
  media-list.ejs          Media page (year-grouped, filtered by category)
  pub-list.ejs            Research page (chip set, BibTeX block, project pill)
_filters/            Pandoc Lua filters wired up in _quarto.yml
  pub-detail.lua       For pub qmds: injects the chip row, the BibTeX
                       <script>, and a .pub-marker the SCSS uses to
                       scope pub-flavored title-block styling
assets/js/           Custom JS, served as static resources
  topnav.js            active-link highlight + mobile hamburger
  pub-filter.js        project filter on the Research page
  news-filter.js       category filter on the News page
  news-back.js         "← Back to ..." link injected on news detail pages
  chips.js             chip behavior (open-in-new-tab)
  pub-self.js          on pub pages: bold self-author, append project
                       pill, wire Copy BibTeX chips (also on Research)
styles/custom.scss   All site styling (overrides Quarto's cosmo theme)
news/                The content store — see "Content model" below
posts/               blog (disabled in nav until first post)
book/, media/        project pages (each with index.qmd)
index.qmd            home page (lists 4 most recent news entries)
research.qmd         Research index (reads news/, filtered to publications)
cv.pdf, favicon.ico  static resources
_site/               build output — gitignored, do not hand-edit
```

## Content model

All listed content — publications, talks, media mentions, op-eds, milestones,
appointments, book reviews — lives as a single `.qmd` file in `news/`. Each
qmd is the canonical record for one event; the News, Research, and Media
pages are different *views* over the same folder, filtered by `categories`.

### Filename convention

`news/YYYY-MM-DD-{type}-{slug}.qmd`, where `{type}` matches the primary
category (`publication`, `talk`, `media`, `writing`, `recognition`,
`milestone`, `appointment`). The leading date sorts chronologically on disk
and matches the `[0-9]*` glob used by Research and Media listings.

### Where each entry surfaces

| Page | Source | Filter |
|---|---|---|
| `news/` (full News timeline) | `news/[0-9]*.qmd` | not `hide_in_news: true` |
| `/` (home, recent News widget) | `news/[0-9]*.qmd` | not `hide_in_news`, top 4 by date |
| `research.qmd` (Research) | `news/[0-9]*.qmd` | `categories` includes `publication` |
| `media/index.qmd` (Media) | `../news/[0-9]*.qmd` | `categories` includes `media` or `writing` |

`hide_in_news: true` removes an entry from the News timeline and homepage
widget but keeps it on Research/Media — for forthcoming preprints or
backfilled older work that shouldn't pollute the chronological feed.

### Frontmatter, by category

Common fields (every entry):

```yaml
title: "..."            # news-style headline ("X published in Y") for non-pubs;
                        # for pubs this is the actual paper title (becomes H1)
date: "YYYY-MM-DD"
categories: [publication | talk | media | writing | recognition | milestone | appointment]
hide_in_news: false     # optional; default false
```

**Publication** — add a publication-flavored detail-page rendering:

```yaml
title: "Politics of Boundary Consolidation: ..."   # paper title (H1 on detail page)
subtitle: "*Socius*, 2024"                         # "Venue, Year", shown under H1
news_title: '"Politics of..." published in *Socius*'  # what News/Media listings show
authors: ["Martin Lukk"]
venue: "Socius"
year: 2024
pub_project: culture-conflict | crowdfunding   # matches a Research filter button + renders a pill next to the venue line. NOTE: not `project:` — Quarto reserves that key for the website project config in _quarto.yml.
doi: "10.1177/..."         # optional; renders the "Article" chip
preprint: "https://..."    # optional; arXiv/SSRN/OSF/bioRxiv/etc. — renders the "Preprint" chip
arxiv: "..."               # optional legacy alias for `preprint:` (still works)
pdf: "..."                 # optional
code: "https://..."        # optional — "Code" chip
data: "https://..."        # optional — "Data" chip
materials: "https://..."   # optional — "Materials" chip (stimuli, codebooks, etc.)
prereg: "https://..."      # optional — "Prereg" chip (OSF Registry, AsPredicted, …)
supplement: "https://..."  # optional — "Supplement" chip (online appendix / SI)
slides: "https://..."      # optional — "Slides" chip
project_page: "/foo/"     # optional; renders a "Project" chip (link to a project page on this site)
book: "/book/"             # optional; for the book entry — routes the Research title link to /book/ instead of the news detail page
cite_key: "lukk2024boundary"  # optional; overrides the auto-generated BibTeX cite key
abstract: >
  Multi-line YAML folded string. Rendered manually in the qmd body via
  {{< meta abstract >}} below a short context paragraph.
```

Chip vocabulary, in render order: **PDF · Article · Preprint · Code · Data · Materials · Prereg · Supplement · Slides · Project · Copy BibTeX**. Chips render only when the corresponding field is populated; "Copy BibTeX" always renders for entries that have authors + title + year. Chip labels name *what's at the link*, not the platform; the platform name (GitHub, OSF, Zenodo, AsPredicted, arXiv, …) appears in the chip's hover tooltip. Recognized hosts live in the `URL_PLATFORMS` table — duplicated in `_filters/pub-detail.lua` and `_templates/pub-list.ejs`; edit both when adding one.

Pub qmd body convention: one short context paragraph (e.g., "Lead article in a *X* special issue"), then `::: {.abstract}` `{{< meta abstract >}}` `:::`.

**Media / writing** — add outlet info:

```yaml
outlet: "The Washington Post"
outlet_url: "https://..."
```

`writing` is grouped with `media` everywhere (News filter, Media page) — use
it for op-eds and other public-facing prose. The body can contain whatever
contextual prose makes sense (quote, embedded audio, etc.).

**Talk / recognition / milestone / appointment** — no extra fields required;
common fields are enough. Body contains contextual prose (event, abstract of
the talk, blockquote of the review, etc.).

## Adding content

| To add… | Do this |
|---|---|
| A new top-level page | Create `pagename.qmd` with `title:` front matter; add a nav link in `_includes/header.html` |
| A news item / talk / media mention / milestone / etc. | Add `news/YYYY-MM-DD-{type}-{slug}.qmd` with the common frontmatter; it appears in the News timeline and homepage widget automatically |
| A publication | Add `news/YYYY-MM-DD-publication-{slug}.qmd` with the publication frontmatter above; it appears on Research, in the News timeline (using `news_title`), and on its own detail page |
| A book | Same as a publication, plus set `book: "/book/"` so the Research listing title links to the dedicated book page rather than the news detail page. The `/book/` page itself lives at `book/index.qmd`. |
| A media mention / op-ed | Add `news/YYYY-MM-DD-{media\|writing}-{slug}.qmd` with `outlet` + `outlet_url`; it appears on Media and in the News timeline |
| A new project section | `mkdir foo/` and add `foo/index.qmd` |
| Site-wide JS | Drop a file in `assets/js/` and add `<script src="/assets/js/foo.js" defer></script>` to `_includes/scripts.html` |
| Site-wide styles | Edit `styles/custom.scss` |
| A reusable HTML chunk | Add `_includes/foo.html`, reference it from a `.qmd` with `{{< include _includes/foo.html >}}` |

## How rendering works

1. `_quarto.yml` declares the format (`html` with the `cosmo` theme + `styles/custom.scss`), the partials to inject (`include-before-body`, `include-after-body`), and the Pandoc Lua filters (`filters:`).
2. Each `.qmd` page is processed by Pandoc into HTML, with the partials wrapped around the content.
3. Pages with a `listing:` block (`index.qmd`, `news/index.qmd`, `research.qmd`, `media/index.qmd`) scan `news/[0-9]*.qmd`. Quarto extracts frontmatter into an `items` array; the EJS template named in `template:` filters and renders. Each listing exposes only the `fields:` it needs — add a field name there if a template needs to read it.
4. Publication detail pages get three layers of rendering on top of Quarto's defaults:
   - **Quarto** auto-renders title, subtitle, authors, date, and DOI into the title block from frontmatter.
   - **`_filters/pub-detail.lua`** (a Pandoc Lua filter) detects `categories: [publication]` and prepends two raw-HTML blocks to the body: a `.pub-marker` (carries `data-project="..."` so the SCSS can scope pub styling and JS can read the project slug) and a `.pub-actions` chip row + a sibling `<script type="application/x-bibtex">` containing the generated BibTeX entry.
   - **SCSS** scopes pub-flavored title-block styling via `#quarto-content:has(.pub-marker)` (hides the auto-rendered abstract block since pub qmds emit it manually via `{{< meta abstract >}}` further down the body; reorders the title block to title → authors → venue+year; reuses the listing's bolded self-author and pill-style project tag).
   - **`assets/js/pub-self.js`** wraps "Martin Lukk" in `<span class="pub-self">` inside the auto-rendered author paragraphs (which Quarto pre-processes into a structured `by-author` field, so a server-side filter can't easily touch them), appends the project pill to the venue line, and wires up Copy-BibTeX click → `navigator.clipboard.writeText(scriptTag.textContent)`. The same Copy-BibTeX wiring runs on the Research listing, which embeds one `<script type="application/x-bibtex">` per pub item.
5. Output goes to `_site/`. Quarto auto-rewrites paths so `/assets/js/foo.js` becomes `./assets/js/foo.js` on root pages and `../assets/js/foo.js` one level deep.

## Gotchas

- **Listings need an EJS template for custom HTML.** Edit `_templates/*.ejs`, not the `.qmd` file, to change how items render.
- **Listings use the `news/[0-9]*.qmd` glob, not `news/*.qmd`.** With `*.qmd`, Quarto matches `news/index.qmd` and silently inlines its body into the listing page (e.g., the News filter chips show up at the bottom of Research). The digit-prefixed glob excludes `index.qmd` cleanly. Keep this in mind if filenames ever stop starting with a year.
- **`title` doubles as both H1 and listing label.** For non-publications this is fine. For publications, set `title` to the paper title (H1 on the detail page) and `news_title` to the news-style headline (what News/Media listings display). EJS templates fall back: `news_title || title`.
- **`{{< meta authors >}}` does not work for array values** — it emits `?invalid meta type:authors`. String fields work (`venue`, `abstract`, etc.). Authors are auto-rendered by Quarto into the title block; restyle via SCSS rather than trying to re-emit them.
- **Raw HTML in `.qmd` is processed by Pandoc**, which sometimes wraps content in extra `<p>` tags. If that bites, move the markup to a partial included via `{{< include >}}`, or wrap it in a ```` ```{=html} ```` block.
- **Anything served as a static asset must be in `_quarto.yml > project > resources:`.** `assets/`, `cv.pdf`, and `favicon.ico` are listed there. Add new top-level static dirs to that list.
- **`page-layout: custom`** disables Quarto's default sidebar/TOC chrome. We layer our own sidebar/topbar via `_includes/`. If you ever want Quarto's built-in `website.navbar`, remove the custom partials first.
- **`<p>` inside a partial inherits the parent class's `font-size` only by accident** — Quarto/Bootstrap sets `p { font-size: 1rem }` globally, which can override inherited sizes. The fix in `styles/custom.scss` is to set `font-size: inherit` on the inner `p`.
- **`project:` is reserved by Quarto** — it's used in `_quarto.yml` for the website project config, and Quarto strips it from per-document metadata before Pandoc filters see it. (The listing engine still exposes it to EJS via `item.project`, but a Lua filter reading `meta.project` will get `nil`.) Per-pub project slug lives under `pub_project:` instead.
- **BibTeX in `<script type="application/x-bibtex">`, not `<template>`.** Pandoc processes the contents of `<template>` elements when they appear in EJS-rendered HTML: a leading `@article` gets wrapped in a `.citation` span, and embedded newlines collapse. `<script>` content is treated as raw CDATA by the HTML spec and by Pandoc, so it round-trips verbatim. The detail-page Lua filter and the listing's EJS template both emit `<script type="application/x-bibtex">` for the BibTeX payload.
- **Chips name what's at the link, not where it's hosted.** Repeated platform names in a chip row (`Wiley · arXiv · GitHub · OSF`) read as alphabet soup; content-typed labels (`Article · Preprint · Code · Data`) stay coherent and degrade nicely when fields are missing. Platform names live in the chip's hover tooltip via `URL_PLATFORMS` (kept in sync between `_filters/pub-detail.lua` and `_templates/pub-list.ejs`).
- **Quarto's `quarto preview` cache can desync from a separate `quarto render`.** If you run `quarto render` while a preview is already up, the preview server may start returning `Bad resource ID` for the rebuilt pages. Restart the preview to fix.

## Quarto in context

Quarto is a Pandoc-based static-site generator. The main alternatives:

- **Hugo / Jekyll / 11ty** — faster builds, larger theme ecosystems, markdown-only. Quarto wins when you want literate programming (executable R / Python / Julia blocks rendered into the page) or first-class citations.
- **Next.js / Astro / SvelteKit** — JS frameworks; the right fit if the site has meaningful client-side state. Overkill for a content-driven academic page.
- **Hugo Apéro / academicpages.github.io** — Hugo themes targeted at academics. Solid out-of-the-box but you live inside someone else's theme. Quarto + custom partials gives full control with less frontend tooling.

This repo uses Quarto because (a) the academic-page primitives (publications, news, citations) come for free, and (b) the site is content-only, no client-side state worth a JS framework.

## References

- Quarto websites: <https://quarto.org/docs/websites/>
- Listings: <https://quarto.org/docs/websites/website-listings.html>
- EJS syntax (listing templates): <https://ejs.co/>
