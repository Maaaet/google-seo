# google-seo

A Claude Code / Agent skill that does SEO the way **Google documents it**, not the way blog posts
remember it — extended with **GEO/AEO auditing** (AI answer-engine visibility: ChatGPT, Claude,
Perplexity, AI Overviews, Copilot) on top of the original [ceoguy/google-seo](https://github.com/ceoguy/google-seo).

It ships three things:

1. **`docs/`** — a local fork of all **158 pages** of [Google Search Central](https://developers.google.com/search/docs), converted to Markdown, each file stamped with its source URL and fetch date. This is complete.
2. **`references/`** — dense rule sheets distilling the pages that matter for auditing a typical site. Every rule carries an **exact quote** and a path back into `docs/`. Anything Google doesn't actually say is marked `UNKNOWN — not stated in corpus`, never guessed. **They do not cover all 158 pages** — [`references/COVERAGE.md`](references/COVERAGE.md) lists exactly which pages are summarized and which aren't, and it's generated mechanically so it can't drift.
3. **`audit.mjs`** — a dependency-free auditor that crawls a live site and reports findings, each citing the Google doc that mandates it. It implements a subset of the checks the sheets identify as auditable; the rest are documented, not automated.

The corpus is the source of truth. When a question falls outside the sheets, grep `docs/`.

## Why this exists

Most SEO audits check the raw HTML *or* the rendered page. The interesting bugs live in the **gap
between them**.

Google processes pages in three phases — crawl → render → index — and rendering waits in a queue
that "may stay on this queue for a few seconds, but it can take longer than that." Meanwhile the
other things reading your HTML — ChatGPT, Claude, and Perplexity crawlers, plus every social
unfurler — **never render JavaScript at all**.

So a `<title>`, `rel=canonical`, `hreflang`, or JSON-LD block that only appears after hydration is
delayed for Google and permanently invisible to everyone else.

`audit.mjs --render` fetches both views and diffs them. That single check found, on a production
site, that all 71 product pages were serving the homepage's `<title>` and a `rel=canonical`
pointing at the homepage — quietly telling Google that every page was a duplicate of the front page.

## Install

```bash
git clone https://github.com/Maaaet/google-seo.git ~/.claude/skills/google-seo
```

Claude Code discovers it automatically as a **skill**. Or just run the auditor standalone — it needs
**Node ≥ 22** and nothing else (Chrome only for `--render`).

## What's new in v1.1 (this fork)

Everything below is additive; all 189 original regression tests still pass (203 total with the new ones).

- **GEO / AEO auditing.** A new rule sheet, [`references/geo.md`](references/geo.md), with two
  labeled sourcing tiers: **[corpus]** rules quote Google's own AI-optimization guide (which is in
  `docs/` and quote-verified like everything else), **[vendor]** rules cite OpenAI / Anthropic /
  Perplexity / Apple / Meta / Common Crawl documentation by URL. Nothing unsourced.
- **AI crawlers by role.** The auditor now knows 15 AI user-agents and what blocking each one
  actually costs. Blocking a search/index crawler (OAI-SearchBot, PerplexityBot, Claude-SearchBot,
  Bingbot/Copilot, DuckAssistBot, Amazonbot) or a user-triggered fetcher (ChatGPT-User,
  Claude-User, Perplexity-User, MistralAI-User) removes a live answer surface — reported `medium`.
  Blocking a training crawler (GPTBot, ClaudeBot, CCBot, Applebot-Extended, Meta-ExternalAgent) is
  a legitimate policy choice — reported once, `low`, and the tool never nags you to unblock a bot
  you meant to block.
- **Raw-vs-rendered main-content delta** (`--render`). The original diffed the `<head>`; v1.1 also
  measures the body text an SPA shell hides from every non-rendering consumer — the single biggest
  GEO defect a crawler-side tool can catch. Raw-only runs flag near-empty raw pages as a handoff.
- **llms.txt, honestly.** A missing llms.txt is a NON-finding (Google documents that Google Search
  ignores it, and no major answer engine documents reading it). Only a present-but-broken file
  (served as HTML by a rewrite) or a present-and-fine one (expectation-setting note) is reported.
- **Snippet controls as AI levers.** `nosnippet` and tight `max-snippet` also cap what AI Overviews
  can show; surfaced as confirm-intent handoffs, citing Google's AI-features doc.
- **Open Graph / unfurler metadata.** `og:title` / `og:description` / `og:image` checked in the raw
  view (unfurlers never render JS), aggregated into ONE site-wide finding instead of per-page
  noise. Under `--render`, OG that exists only after hydration is called out as dead weight.
- **Per-type structured data validation.** Required-property checks mirroring the corpus tables for
  Event, JobPosting, Recipe, VideoObject, LocalBusiness, BreadcrumbList (including per-ListItem
  position/item), and Product's review-or-rating-or-offers rule. Article/NewsArticle/BlogPosting
  get a `low` for missing recommended dates/author (the freshness signals AI retrieval favors).
  FAQPage and HowTo report **UNKNOWN eligibility** because the corpus no longer documents them.
- **Sitemap extensions.** Image (1,000-per-`<url>` limit), video (required thumbnail_loc / title /
  description, content_loc-or-player_loc), news (1,000-entry limit, required publication tags,
  two-day recency rule). Checked only when the namespaces are actually present.
- **Path-based pagination.** `/page/2/` canonicalizing to page 1 is now caught alongside `?page=N`.
- **Uncapped by default.** `--max-pages`, `--max-render`, `--max-sitemaps`, and
  `--max-prefix-probes` now default to **unlimited** — an audit's job is the whole site, and a
  default cap is a silent partial crawl. The flags remain for when a site is huge and time is not.
  Per-request timeouts and the sitemap cycle/depth guards stay: those prevent hangs, not coverage.
- **New slash command.** `/google-seo-geo <url>` runs a GEO-focused audit and triages the
  ai-search / javascript / social / structured-data areas against `references/geo.md`.
- **14 new regression tests** covering all of the above (`node test-audit.mjs`; set
  `TEST_BIG_URLS=1500` on slow machines to shrink the 120k-URL stress fixture).

## Using it in Claude Code

**As a skill (zero setup).** Once it's in `~/.claude/skills/`, the agent loads it on its own when your
request matches — "audit the SEO of https://example.com", "why isn't this page indexed?", "check my
hreflang", "set up SEO for a new site". Auto-triggering is driven by the skill's description, so it's
reliable but not guaranteed; if you want certainty, either **name it** ("use the google-seo skill to…")
or **pin it** in your `CLAUDE.md` (`For any SEO task, use the google-seo skill.`).

**As slash commands (guaranteed).** For SEO work you do often, the four commands in [`commands/`](commands/)
remove all doubt — invoking one *is* the instruction to load the skill. Install them once:

```bash
cp ~/.claude/skills/google-seo/commands/*.md ~/.claude/commands/
```

| Command | What it does |
|---|---|
| `/google-seo-audit <url>` | Read-only audit of a live site. Runs the auditor, groups findings by root cause, splits auto-fix vs handoff. |
| `/google-seo-fix [url]` | Run from inside the site's repo: audit → fix the auto-fix findings in code → re-audit until two clean runs. |
| `/google-seo-plan <topic\|url>` | A sequenced SEO plan in the skill's build-order, every recommendation citing the Google doc. |
| `/google-seo-geo <url>` | GEO/AEO audit: AI crawler access, JS-invisible content, unfurler metadata, AI-surface eligibility. |
| `/google-seo` | Catch-all — audit, fix, plan, GEO, or look up a rule; routes by what you type. |

Every command grounds its answer in the local corpus, never in blog folklore. New commands and skills
show up in a **new** Claude Code session (the list loads at startup).

## Usage

```bash
# raw-HTML audit (fast, no browser)
node audit.mjs https://example.com

# add the rendered-DOM diff — this is the one that finds the real bugs
node audit.mjs https://example.com --render --json report.json

# by default NOTHING is capped: every sitemap URL is crawled and (with --render) rendered.
# On a huge site that is hours — cap it when time matters:
node audit.mjs https://example.com --render --max-pages 500 --max-render 100

# tell it which noindex pages are intentional
node audit.mjs https://example.com --noindex-ok /admin,/preview
```

| Flag | Meaning |
|---|---|
| `--render` | Drive headless Chrome (DevTools Protocol) and diff raw vs rendered `<head>`. Set `CHROME=/path/to/chrome` if not auto-found. |
| `--max-render <n>` | Cap rendered pages (default: **unlimited** — every crawled page is rendered). Rendering costs seconds per page, so cap it on huge sites; capped pages are audited raw-only and say so. |
| `--max-sitemaps <n>` | Cap child-sitemap fetches across the whole tree (default: **unlimited** — every child is fetched). |
| `--max-prefix-probes <n>` | Cap sitemap path prefixes probed for soft 404s (default: **unlimited**). |
| `--json <file>` | Write findings as JSON. |
| `--max-pages <n>` | Cap pages crawled (default: **unlimited** — the whole sitemap). When capped, the tool **logs what it skipped** — a partial crawl that reads "all clear" is the worst possible output. |
| `--noindex-ok a,b` | Paths where `noindex` is deliberate. |
| `--quiet` | Findings only. |

Exit codes: `0` = no code-fixable findings (handoff items may still be printed) · `1` = auto-fix
findings remain · `2` = usage error (missing/invalid base URL). Suitable for CI.

Findings are partitioned into:

- **auto-fix** — a code change closes it. Your work list.
- **handoff** — needs a human, Search Console, real content, or off-page work. The tool will not pretend to fix these, and neither should you.

**It tells you what it did not do.** Every cap, truncation, skip and fallback emits its own finding —
children beyond `--max-sitemaps`, `Sitemap:` directives beyond the cap, nesting below the depth cap,
pages beyond `--max-pages`, and a sitemap tree that produced nothing. A partial crawl that reads as
"all clear" is the worst output an auditor can produce. Identical findings reached through two paths
(a shared template, a diamond in the sitemap graph) are reported once.

## What it checks

**robots.txt** — reachable; not blocking all crawlers; `Sitemap:` present; **not disallowing your
JS/CSS** (because "Google Search won't render JavaScript from blocked files"); which AI crawlers you
have shut out.

**Sitemaps** — the 50MB / 50,000-URL limits; UTF-8; absolute, entity-escaped, fragment-free `<loc>`;
W3C-format `<lastmod>`; duplicate and cross-host entries; and it flags `<priority>` / `<changefreq>`,
which "Google ignores."

Nested sitemap indexes (Jetpack, WordPress) are **reported and then followed** — the protocol has no
nested-index form, but refusing to descend audits zero pages, which is worse. Bounded by depth, by a
whole-tree fetch budget, and by a cycle guard that knows a *diamond* (two sibling `Sitemap:` lines
pointing at one child) from a *loop*. A sitemap tree that yields **no page URLs at all** is itself a
finding, not a quiet fallback to auditing the homepage.

**Canonical** — at most one tag; absolute; no fragment; self-referencing; and the killer:
**N distinct pages all canonicalizing to one URL**, which is how a shared SPA shell silently
de-indexes an entire site.

**Indexing** — `noindex` in meta *or* `X-Robots-Tag`; sitemap URLs that 404 or redirect.

**On-page** — missing/duplicate `<title>` and meta description (grouped by shared value, so one
template bug is one finding, not two hundred); a missing `<h1>` (as information, not a defect —
the corpus mandates no h1 count); images without `alt`;
viewport; dead `meta keywords`; `rel=next/prev`.

**International** — hreflang self-reference, `x-default`, and **reciprocity across pages** (Google:
"If two pages don't both point to each other, the tags will be ignored"); `<html lang>`.

**Lifecycle** — AMP `rel=amphtml` ↔ `rel=canonical` pairing; paginated pages that canonicalize to
page 1; `Link: rel=canonical` HTTP header conflicting with the HTML tag.

**Structured data** — JSON-LD parses; `aggregateRating` without a review count; and it always flags
ratings for human verification, because fabricating them is a manual-action offense. It does **not**
validate required properties per feature type — use `references/structured-data.md` and Google's
Rich Results Test for that.

**Crawling** — `<a>` elements with no crawlable `href` (`javascript:`, `#`, or missing); non-HTTPS
origins; and soft 404s — a nonexistent URL answering `200`.

Soft-404 behaviour is **path-dependent** the moment a host has rewrite rules, so the tool probes one
nonexistent URL under *each* path prefix in your sitemap, not just at the site root. A static host
that rewrites `/product/:slug` to `/product/:slug/index.html` answers an unknown slug with an **empty
200** — an indexable page that cannot even carry a `noindex` — while the app's catch-all `404`s
correctly everywhere else. Google counts an empty page as a soft 404, so an empty `200` is
`critical`, whether probed or listed in your sitemap. If the site root *also* answers `200` (an SPA),
no prefix is blamed: the root finding already covers it.

That check found, on a live site, that every deleted or renamed product, post and article URL had
become an indexable empty page — and on `cloudflare.com`, that `/policies/<anything>` serves a real
`200` page while the root correctly `404`s.

**JavaScript (`--render`)** — the raw-vs-rendered delta for `<title>`, canonical, hreflang, JSON-LD,
and `<h1>`.

**GEO / AI answer engines** — AI crawlers in robots.txt **by role**: blocking a search/index
crawler (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Bingbot/Copilot, DuckAssistBot,
Amazonbot) or a user-triggered fetcher (ChatGPT-User, Claude-User, Perplexity-User,
MistralAI-User) removes a live answer surface and is reported `medium`; blocking a training
crawler (GPTBot, ClaudeBot, CCBot, Applebot-Extended, Meta-ExternalAgent) is a policy choice,
reported once, `low`, informationally — the tool never tells you to unblock a bot you meant to
block. Plus: `llms.txt` (absence is a NON-finding — Google documents that Google Search ignores
it; a present-but-broken one is a rewrite bug and is reported), `nosnippet`/`max-snippet` as AI
Overview levers, and with `--render` the **raw-vs-rendered main-content text delta** — the body
an SPA hides from every non-rendering consumer, which is the single biggest GEO defect a
crawler-side tool can catch. Sourcing note: GEO findings that rest on vendor (non-Google) docs
cite `references/geo.md`, which lists the vendor URLs and labels every rule [corpus] or [vendor].

**Social / unfurlers** — `og:title` / `og:description` / `og:image` presence, aggregated
site-wide (one finding, not one per page), raw view only, because unfurlers never render JS.
Under `--render`, OG that exists only after hydration is reported: unfurlers will never see it.

**Structured data, per type** — required-property validation mirroring the corpus tables:
Event, JobPosting, Recipe, VideoObject, LocalBusiness, BreadcrumbList (incl. per-ListItem
position/item checks), Product's review-or-rating-or-offers requirement; Article/NewsArticle/
BlogPosting recommended properties (dates, author — the freshness signals AI retrieval favors)
at `low`; FAQPage and HowTo report UNKNOWN eligibility because the corpus no longer documents
them. Still not a Rich Results Test replacement; the finding text says when to use one.

**Sitemap extensions** — image (1,000 per `<url>` limit), video (required thumbnail_loc /
title / description, content_loc-or-player_loc), news (1,000 `news:news` limit, required
publication tags, two-day recency rule). Checked only when the namespaces are present.

**Pagination** — both `?page=N` and path-based `/page/N/` canonicalizing to page 1.

## What it deliberately does NOT check

Core Web Vitals field data, manual actions, backlink quality, whether your content is actually
helpful, and whether a rating you marked up is real. These are `handoff` findings. A tool that
claimed to pass them would be lying to you.

It also does not yet implement every check the reference sheets identify as mechanically
auditable — A/B-test redirect types and paused-site status codes, among others. (Per-type
structured-data validation, sitemap extension limits, and path-based pagination were implemented
in v1.1.) The sheets say *auditable*, not *audited*; each sheet's own `## Auditable checks`
section is the honest list.

For GEO specifically, it cannot measure whether ChatGPT / Claude / Perplexity / AI Overviews
actually cite the site (that needs longitudinal querying of those systems, the AI analogue of
rank tracking), nor brand-mention volume across the web. Those are `handoff` by nature.

## The rules, in short

Distilled from `references/`. Each is quoted and sourced in full there.

- **A wrong `rel=canonical` is worse than none.** Google calls `rel=canonical` "A strong signal" and sitemap inclusion "A weak signal." Google's own escape hatch: *"If you can't set the canonical URL in the HTML source code, leave it out and only set it with JavaScript."*
- **`Disallow` is not `noindex`.** robots.txt "is not a mechanism for keeping a web page out of Google" — and a disallowed page can't be seen to carry your `noindex`.
- **`<priority>` and `<changefreq>` are dead.** Include `<lastmod>` only when it's truthfully accurate.
- **List only canonical URLs in a sitemap**, verbatim. Google warns: *"don't specify one URL in a sitemap, but a different URL for that same page using `rel="canonical"`."*
- **hreflang has exactly three sanctioned homes:** HTML `<head>`, HTTP header, or sitemap. Each version "must list itself as well as all other language versions," and *"If two pages don't both point to each other, the tags will be ignored."* Canonicals must stay in-language.
- **A soft 404 is an indexable error page.** In a client-routed SPA, *"Add a `<meta name="robots" content="noindex">` to error pages using JavaScript."*
- **Putting the locale in a URL parameter is the one i18n structure Google marks "Not recommended."** Google's table names the structure "URL parameters" and gives `site.com?loc=de` as the example; `?lang=xx` is the same structure. The verdict is Google's; applying it to `?lang=` is ours. Prefer ccTLD, subdomain, or subdirectory.
- **Dynamic rendering is "a workaround and not a recommended solution."** Use SSR, static rendering, or hydration.
- **Never fabricate `aggregateRating` or `Review` markup.** Structured data must describe what's visibly on the page.
- **Rich results can be gated.** `VacationRental` needs a Google Technical Account Manager and Hotel Center access. Check before promising a client a rich result they cannot have.
- **Don't write separate content "for AI."** Google calls that scaled content abuse; AI Overviews run on core Search ranking and need no special markup.

## Maintenance scripts

```bash
python3 scripts/fetch-docs.py       # regenerate the 158-page fork (URL list scraped from the live nav)
python3 scripts/coverage.py         # which corpus pages the rule sheets cover -> references/COVERAGE.md
python3 scripts/verify-quotes.py    # check every quoted string against the corpus; --self-test proves the checker
```

`fetch-docs.py` writes `fetch-report.json` and never silently skips a page. `coverage.py` is generated,
so `COVERAGE.md` can't drift. `verify-quotes.py` is how the "every rule is a real Google quote" claim
stays true — run it before trusting a new rule sheet.

## Layout

```
SKILL.md                  agent entry point — workflow + hard-won rules
audit.mjs                 the auditor (Node ≥ 22, zero deps)
commands/*.md             optional Claude Code slash commands (copy to ~/.claude/commands/)
references/*.md           14 distilled rule sheets, every claim quoted + sourced (geo.md labels its two sourcing tiers)
references/COVERAGE.md    which corpus pages the sheets cover (generated, can't drift)
docs/                     158-page Google Search Central fork
DOCS-INDEX.md             index of the fork
scripts/fetch-docs.py     regenerate the fork
scripts/coverage.py       regenerate COVERAGE.md
scripts/verify-quotes.py  verify every quote against the corpus
urls.txt                  the page list
```

## License

Original work (`SKILL.md`, `audit.mjs`, `references/`, `scripts/`) is MIT — see `LICENSE`.

`docs/` is a fork of Google's Search Central documentation, redistributed under **CC BY 4.0** with
attribution — see `NOTICE.md`. It is a point-in-time snapshot and is **not authoritative**; always
defer to the live page linked in each file's `source:` frontmatter. Not affiliated with or endorsed
by Google.
