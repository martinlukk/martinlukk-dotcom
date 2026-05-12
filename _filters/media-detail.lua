-- For media/writing detail pages, inject a single chip generated from
-- `outlet_url` + `outlet_label` + `outlet` frontmatter. Mirrors the
-- pattern in `pub-detail.lua` for publication pages.
--
-- Frontmatter contract (see README "Media / writing"):
--   outlet:        human-readable outlet name (e.g., "Vox") — chip tooltip
--   outlet_url:    link target — required for a chip to render
--   outlet_label:  chip label override — optional; defaults to "Op-ed" for
--                  `categories: [writing]`, else "Article"
--
-- Entries with no `outlet_url` (e.g., a radio segment with an inline audio
-- player) get no chip. That's the intentional opt-out.

local function categories(meta)
  local out = {}
  local cats = meta.categories
  if cats == nil then return out end
  if cats.t == "MetaList" then
    for _, c in ipairs(cats) do
      table.insert(out, pandoc.utils.stringify(c))
    end
  else
    table.insert(out, pandoc.utils.stringify(cats))
  end
  return out
end

local function is_media_like(meta)
  for _, c in ipairs(categories(meta)) do
    if c == "media" or c == "writing" then return true end
  end
  return false
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

local function default_label(cats)
  for _, c in ipairs(cats) do
    if c == "writing" then return "Op-ed" end
  end
  return "Article"
end

function Pandoc(doc)
  if not is_media_like(doc.meta) then return nil end
  local url = meta_str(doc.meta, "outlet_url")
  if not url then return nil end
  local label = meta_str(doc.meta, "outlet_label") or default_label(categories(doc.meta))
  local outlet = meta_str(doc.meta, "outlet")
  local title_attr = outlet and (' title="' .. escape_attr(outlet) .. '"') or ""
  local chip_html =
    '<div class="chips entry-actions">' ..
    '<a class="chip" href="' .. escape_attr(url) .. '"' .. title_attr .. '>' .. label .. '</a>' ..
    '</div>'
  table.insert(doc.blocks, 1, pandoc.RawBlock("html", chip_html))
  return doc
end
