-- For publication detail pages, inject the same chip row that the
-- Research listing card shows (PDF / publisher-or-DOI / arXiv / code /
-- project / Cite) and a marker the SCSS scopes pub-flavored styling
-- to. The marker carries the `pub_project` slug as a data attribute so
-- pub-self.js can append a project tag next to the venue line. The Cite
-- chip is a copy-to-clipboard trigger: its associated <template> holds
-- the BibTeX entry, which pub-self.js writes to the clipboard on click.
--
-- Self-author bolding runs client-side because Quarto pre-normalizes
-- the `authors:` frontmatter into a structured `by-author` field that
-- its title-block template reads instead of `meta.authors`. Likewise,
-- `pub_project` (not `project`) is read here because Quarto reserves
-- the bare `project` key for the website project config.

local SKIP_WORDS = {
  a = true, an = true, the = true, on = true, of = true, ["in"] = true,
  ["for"] = true, to = true, ["and"] = true, ["or"] = true, ["is"] = true,
}

-- KEEP-IN-SYNC with `_templates/pub-list.ejs`: DOI_PUBLISHERS and
-- URL_PLATFORMS below, plus SKIP_WORDS, cite_key, and bibtex_entry
-- are all duplicated in the EJS listing template in JavaScript form.
-- Edit both when adding a publisher, platform, or stop-word, or when
-- changing cite-key / BibTeX generation rules.
--
-- DOI registrant prefix → human-friendly publisher label. Used to
-- enrich the Article chip's hover tooltip (the chip label itself is
-- always "Article" — naming the publisher in the chip got too
-- platform-soupy when other chips landed at GitHub, OSF, etc.).
local DOI_PUBLISHERS = {
  ["10.1002"] = "Wiley",
  ["10.1177"] = "Sage",
  ["10.1086"] = "U Chicago",
  ["10.1093"] = "Oxford",
  ["10.1007"] = "Springer",
  ["10.1080"] = "Taylor & Francis",
  ["10.1146"] = "Annual Reviews",
  ["10.1126"] = "Science",
  ["10.1038"] = "Nature",
  ["10.1145"] = "ACM",
  ["10.1109"] = "IEEE",
  ["10.1257"] = "AEA",
}

-- URL-host → human-friendly platform label. Drives the hover tooltip
-- on each non-Article chip (Preprint / Code & Data / Data / Materials /
-- Prereg / Supplement / Slides) so readers see "GitHub" or "OSF" on
-- hover without the chip itself naming a vendor.
local URL_PLATFORMS = {
  { pattern = "github%.",      label = "GitHub"      },
  { pattern = "gitlab%.",      label = "GitLab"      },
  { pattern = "bitbucket%.",   label = "Bitbucket"   },
  { pattern = "osf%.io",       label = "OSF"         },
  { pattern = "zenodo%.org",   label = "Zenodo"      },
  { pattern = "dataverse",     label = "Dataverse"   },
  { pattern = "icpsr%.umich",  label = "ICPSR"       },
  { pattern = "aspredicted",   label = "AsPredicted" },
  { pattern = "arxiv%.org",    label = "arXiv"       },
  { pattern = "ssrn%.com",     label = "SSRN"        },
  { pattern = "biorxiv%.org",  label = "bioRxiv"     },
  { pattern = "medrxiv%.org",  label = "medRxiv"     },
  { pattern = "psyarxiv",      label = "PsyArXiv"    },
  { pattern = "researchgate",  label = "ResearchGate"},
  { pattern = "figshare",      label = "Figshare"    },
}

local function is_publication(meta)
  local cats = meta.categories
  if cats == nil then return false end
  if cats.t == "MetaList" then
    for _, c in ipairs(cats) do
      if pandoc.utils.stringify(c) == "publication" then return true end
    end
    return false
  end
  return pandoc.utils.stringify(cats) == "publication"
end

local function meta_str(meta, key)
  local v = meta[key]
  if v == nil then return nil end
  local s = pandoc.utils.stringify(v)
  s = s:gsub("^%s+", ""):gsub("%s+$", "")
  if s == "" then return nil end
  return s
end

local function escape_attr(s)
  return (s:gsub("&", "&amp;"):gsub('"', "&quot;"):gsub("<", "&lt;"):gsub(">", "&gt;"))
end

local function escape_html(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"))
end

local function authors_list(meta)
  -- Quarto normalizes each author into a record with `name = { given,
  -- family, literal }, letter, number, id, metadata`. Prefer
  -- `name.literal` (whole-name string), else fall back to "given family".
  local out = {}
  if not meta.authors then return out end
  for _, a in ipairs(meta.authors) do
    local picked
    if type(a) == "table" and type(a.name) == "table" then
      if a.name.literal then
        picked = pandoc.utils.stringify(a.name.literal)
      elseif a.name.given and a.name.family then
        picked = pandoc.utils.stringify(a.name.given) .. " " ..
                 pandoc.utils.stringify(a.name.family)
      end
    end
    if not picked or picked == "" then
      picked = pandoc.utils.stringify(a)
    end
    table.insert(out, picked)
  end
  return out
end

local function publisher_label(doi)
  local prefix = doi:match("^(10%.%d+)")
  return prefix and DOI_PUBLISHERS[prefix] or nil
end

local function platform_label(url)
  if not url then return nil end
  local lower = url:lower()
  for _, p in ipairs(URL_PLATFORMS) do
    if lower:find(p.pattern) then return p.label end
  end
  return nil
end

-- Chips read as `what's at the link`, not where it's hosted; the
-- platform name (GitHub, OSF, …) goes in the hover tooltip. Order
-- below is the canonical render order on both detail and listing.
local function chip_links_html(meta)
  local chips = {}
  local function add(label, href, title)
    if href and href ~= "" then
      local title_attr = title and (' title="' .. escape_attr(title) .. '"') or ""
      chips[#chips + 1] =
        '<a class="chip" href="' .. escape_attr(href) .. '"' .. title_attr .. '>' ..
        label .. '</a>'
    end
  end
  local function add_with_platform(label, href)
    add(label, href, platform_label(href))
  end

  add_with_platform("PDF", meta_str(meta, "pdf"))

  local doi = meta_str(meta, "doi")
  if doi then
    local pub = publisher_label(doi)
    local title = pub and (pub .. " \u{00b7} DOI: " .. doi) or ("DOI: " .. doi)
    add("Article", "https://doi.org/" .. doi, title)
  end

  -- Accept `preprint:` (preferred) or `arxiv:` (legacy alias).
  add_with_platform("Preprint", meta_str(meta, "preprint") or meta_str(meta, "arxiv"))
  add_with_platform("Code & Data",   meta_str(meta, "code"))
  add_with_platform("Data",          meta_str(meta, "data"))
  add_with_platform("Materials",     meta_str(meta, "materials"))
  add_with_platform("Prereg",        meta_str(meta, "prereg"))
  add_with_platform("Supplement",    meta_str(meta, "supplement"))
  add_with_platform("Slides",        meta_str(meta, "slides"))
  add("Project", meta_str(meta, "project_page"))

  return table.concat(chips, "")
end

-- Cite-key: <first-author-family><year><first-significant-title-word>.
-- Overridable via the `cite_key:` frontmatter field.
local function cite_key(meta, authors, year, title)
  local override = meta_str(meta, "cite_key")
  if override then return override end
  local first = authors[1] or ""
  local family = first:match("(%S+)%s*$") or first
  family = family:lower():gsub("[^a-z]", "")
  local y = year:gsub("[^%d]", "")
  local first_word = ""
  local plain_title = title:gsub("%*", ""):gsub("%-", " ")
  for w in plain_title:gmatch("%S+") do
    local clean = w:lower():gsub("[^a-z]", "")
    if clean ~= "" and not SKIP_WORDS[clean] then
      first_word = clean
      break
    end
  end
  return family .. y .. first_word
end

local function bibtex_entry(meta, authors, year, title)
  local is_book = meta.book ~= nil
  local entry_type = is_book and "book" or "article"
  local key = cite_key(meta, authors, year, title)
  local clean_title = title:gsub("%*", "")
  local venue = meta_str(meta, "venue") or ""
  local doi = meta_str(meta, "doi") or ""

  local lines = {
    "@" .. entry_type .. "{" .. key .. ",",
    "  author = {" .. table.concat(authors, " and ") .. "},",
    "  title = {" .. clean_title .. "},",
  }
  if is_book then
    if venue ~= "" then lines[#lines + 1] = "  publisher = {" .. venue .. "}," end
  else
    if venue ~= "" then lines[#lines + 1] = "  journal = {" .. venue .. "}," end
  end
  if year ~= "" then lines[#lines + 1] = "  year = {" .. year .. "}," end
  if doi ~= "" then lines[#lines + 1] = "  doi = {" .. doi .. "}," end
  lines[#lines] = lines[#lines]:gsub(",$", "")
  lines[#lines + 1] = "}"
  return table.concat(lines, "\n")
end

-- Returns (cite_chip_html, template_html) or (nil, nil) if not enough
-- metadata to form a citation.
local function build_cite_parts(meta)
  local authors = authors_list(meta)
  local title = meta_str(meta, "title") or ""
  local year = meta_str(meta, "year") or ""
  if #authors == 0 or title == "" or year == "" then return nil, nil end
  local bib = bibtex_entry(meta, authors, year, title)
  local cite_chip =
    '<button type="button" class="chip pub-cite" ' ..
    'aria-label="Copy BibTeX citation to clipboard" ' ..
    'data-cite-target="pub-bibtex">Copy BibTeX</button>'
  -- Stash the BibTeX in a <script> rather than <template>: script
  -- content is treated as raw CDATA by HTML parsers (and by Pandoc),
  -- so the leading `@article` is not parsed as a citation reference
  -- and embedded newlines are preserved. (On the EJS listing page,
  -- using <template> got the @-prefix wrapped in a .citation span.)
  -- Guard against an accidental </script> sequence in the BibTeX.
  local safe = escape_html(bib):gsub("</script>", "<\\/script>")
  local tpl = '<script type="application/x-bibtex" id="pub-bibtex">' .. safe .. '</script>'
  return cite_chip, tpl
end

local function marker_block(meta)
  local project = meta_str(meta, "pub_project") or ""
  local attrs = ' hidden aria-hidden="true"'
  if project ~= "" then
    attrs = attrs .. ' data-project="' .. escape_attr(project) .. '"'
  end
  return pandoc.RawBlock("html", '<div class="pub-marker"' .. attrs .. '></div>')
end

local function build_actions_block(meta)
  local chips_inner = chip_links_html(meta)
  local cite_chip, cite_tpl = build_cite_parts(meta)
  if chips_inner == "" and not cite_chip then return nil end
  local row = '<div class="chips pub-actions">' .. chips_inner
  if cite_chip then row = row .. cite_chip end
  row = row .. '</div>'
  if cite_tpl then row = row .. cite_tpl end
  return pandoc.RawBlock("html", row)
end

function Pandoc(doc)
  if not is_publication(doc.meta) then return nil end
  table.insert(doc.blocks, 1, marker_block(doc.meta))
  local actions = build_actions_block(doc.meta)
  if actions then
    table.insert(doc.blocks, 2, actions)
  end
  return doc
end
