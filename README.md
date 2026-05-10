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
_quarto.yml          site config (theme, partials, social meta, resources)
_includes/           HTML partials injected into every page
  header.html          topbar nav
  sidebar.html         left sidebar (photo, role, socials, copyright)
  scripts.html         <script> tags loaded after </body>
  pub-filter.html      project filter buttons (Research page)
  footer.html          page-bottom copyright (mobile only)
_templates/          EJS templates for Quarto listings
  news-item.ejs        one news entry
  pub-list.ejs         publications grouped by year
assets/js/           Custom JS, served as static resources
  topnav.js            active-link highlight + mobile hamburger
  pub-filter.js        project filter on the Research page
styles/custom.scss   All site styling (overrides Quarto's cosmo theme)
news/                news/<date>-<slug>.qmd files; index.qmd lists them
posts/               blog (disabled in nav until first post)
book/, fairfund/, media/   project pages (each with index.qmd)
pubs.yml             publication list (data, no markdown)
index.qmd            home page
research.qmd         Research index (driven by pubs.yml)
cv.pdf, favicon.ico  static resources
_site/               build output — gitignored, do not hand-edit
```

## Adding content

| To add… | Do this |
|---|---|
| A new top-level page | Create `pagename.qmd` with `title:` front matter; add a nav link in `_includes/header.html` |
| A news item | Add `news/YYYY-MM-slug.qmd` with a `date:` in front matter — the home-page listing picks it up automatically |
| A publication | Add a YAML entry to `pubs.yml` (`title`, `authors`, `year`, `venue`; optional `doi` / `pdf` / `arxiv` / `code` / `project_page` / `project`) |
| A new project section | `mkdir foo/` and add `foo/index.qmd` |
| Site-wide JS | Drop a file in `assets/js/` and add `<script src="/assets/js/foo.js" defer></script>` to `_includes/scripts.html` |
| Site-wide styles | Edit `styles/custom.scss` |
| A reusable HTML chunk | Add `_includes/foo.html`, reference it from a `.qmd` with `{{< include _includes/foo.html >}}` |

## How rendering works

1. `_quarto.yml` declares the format (`html` with the `cosmo` theme + `styles/custom.scss`) and which partials to inject (`include-before-body`, `include-after-body`).
2. Each `.qmd` page is processed by Pandoc into HTML, with the partials wrapped around the content.
3. Pages with a `listing:` block (`index.qmd`, `news/index.qmd`, `research.qmd`) scan a directory or YAML file and render each entry through the EJS template named in the `template:` field.
4. Output goes to `_site/`. Quarto auto-rewrites paths so `/assets/js/foo.js` becomes `./assets/js/foo.js` on root pages and `../assets/js/foo.js` one level deep.

## Gotchas

- **Listings need an EJS template for custom HTML.** Edit `_templates/*.ejs`, not the `.qmd` file, to change how items render.
- **Raw HTML in `.qmd` is processed by Pandoc**, which sometimes wraps content in extra `<p>` tags. If that bites, move the markup to a partial included via `{{< include >}}`, or wrap it in a ```` ```{=html} ```` block.
- **Anything served as a static asset must be in `_quarto.yml > project > resources:`.** `assets/`, `cv.pdf`, and `favicon.ico` are listed there. Add new top-level static dirs to that list.
- **`page-layout: custom`** disables Quarto's default sidebar/TOC chrome. We layer our own sidebar/topbar via `_includes/`. If you ever want Quarto's built-in `website.navbar`, remove the custom partials first.
- **`<p>` inside a partial inherits the parent class's `font-size` only by accident** — Quarto/Bootstrap sets `p { font-size: 1rem }` globally, which can override inherited sizes. The fix in `styles/custom.scss` is to set `font-size: inherit` on the inner `p`.

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
