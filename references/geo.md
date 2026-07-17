# GEO / AEO: visibility in AI answer engines

**This sheet is different from every other sheet in `references/`, and says so up front.**

The other sheets quote one source of truth: the Google Search Central corpus in `docs/`. GEO
(generative engine optimization) spans engines Google does not document. So this sheet has two
sourcing tiers, and every rule is labeled:

- **[corpus]**: quoted verbatim from `docs/`, verifiable by `scripts/verify-quotes.py`, same as
  every other sheet. The key page is `docs/search/docs/fundamentals/ai-optimization-guide.md`,
  Google's own guide to AI search visibility. It is in the corpus and it is quotable.
- **[vendor]**: sourced from OpenAI, Anthropic, Perplexity, Apple, Meta, Microsoft, or Common
  Crawl documentation, with the URL given. These are NOT verified by `verify-quotes.py` (that
  tool checks the Google corpus only). They were accurate as of the date at the bottom of this
  file; crawler names and policies change, so re-check the URL before acting on a stale claim.

Anything neither tier supports is marked `UNKNOWN`, never guessed.

## The one structural fact that drives everything else

Google renders JavaScript (queued, eventually). Every other consumer of your HTML that matters
for GEO reads the **raw response only**:

- AI training crawlers (GPTBot, ClaudeBot, CCBot, Meta-ExternalAgent) do not execute JS. [vendor]
- AI search/index crawlers (OAI-SearchBot, PerplexityBot, Claude-SearchBot) do not execute JS. [vendor]
- User-triggered fetchers (ChatGPT-User, Claude-User, Perplexity-User) do not execute JS. [vendor]
- Social/chat unfurlers (Slack, X, WhatsApp, iMessage, Discord) do not execute JS.

So for GEO purposes the raw HTML **is** the page. Content, titles, canonicals, JSON-LD, and Open
Graph tags that appear only after hydration exist for Google (late) and for nobody else.
`audit.mjs --render` measures exactly this gap, including a raw-vs-rendered main-content text
delta. The fix is the same one Google names for its own crawler: [corpus] dynamic rendering is
"a workaround and not a recommended solution"; use server-side rendering, static rendering, or
hydration (`docs/search/docs/crawling-indexing/javascript/dynamic-rendering.md`).

## AI crawlers: who reads your robots.txt, and what blocking each one costs

Three functional roles. Blocking them has three different costs. [vendor, all rows]

| User-agent | Operator | Role | Blocking it means |
|---|---|---|---|
| `GPTBot` | OpenAI | training | future OpenAI models learn less from you; does NOT remove you from ChatGPT search answers |
| `OAI-SearchBot` | OpenAI | search index | ChatGPT search cannot index or cite your pages |
| `ChatGPT-User` | OpenAI | user-triggered fetch | when a user asks ChatGPT to open your page live, the fetch fails |
| `ClaudeBot` | Anthropic | training | future Anthropic models learn less from you |
| `Claude-SearchBot` | Anthropic | search index | Claude search cannot index or cite your pages |
| `Claude-User` | Anthropic | user-triggered fetch | user-initiated fetches from Claude fail |
| `PerplexityBot` | Perplexity | search index | Perplexity cannot index or cite your pages |
| `Perplexity-User` | Perplexity | user-triggered fetch | user-initiated fetches from Perplexity fail |
| `Google-Extended` | Google | training/grounding control | limits "AI training and grounding in some of Google's other systems"; does NOT affect Google Search or AI Overviews [corpus] |
| `Bingbot` | Microsoft | search index | you leave Bing AND the Microsoft Copilot answers built on it |
| `Applebot-Extended` | Apple | training control | Apple foundation models stop training on you; Applebot (Siri/Spotlight search) is separate |
| `CCBot` | Common Crawl | training corpus | you leave the Common Crawl dumps many labs train on |
| `Meta-ExternalAgent` | Meta | training | Meta AI models learn less from you |
| `DuckAssistBot` | DuckDuckGo | answer generation | DuckAssist cannot cite your pages |
| `Amazonbot` | Amazon | search/assistant index | Alexa and Rufus answers cannot draw on your pages |
| `MistralAI-User` | Mistral | user-triggered fetch | user-initiated fetches from Le Chat fail |

Source URLs: OpenAI `https://platform.openai.com/docs/bots`; Anthropic
`https://support.anthropic.com/en/articles/8896518`; Perplexity
`https://docs.perplexity.ai/guides/bots`; Apple `https://support.apple.com/en-us/119829`; Meta
`https://developers.facebook.com/docs/sharing/webmasters/web-crawlers`; Common Crawl
`https://commoncrawl.org/ccbot`.

Rules of thumb the auditor encodes:

- Blocking a **search/index** crawler or a **user-triggered fetcher** removes you from a live
  answer surface today. That is a visibility decision and the audit surfaces it at `medium`.
- Blocking a **training** crawler is an IP/policy decision, not a visibility bug. The audit
  surfaces it at `low`, informationally, and never tells you to unblock a bot you meant to block.
- [corpus] For Google's own AI surfaces there is no separate bot to court: "AI is built into
  Search and integral to how Search functions, which is why robots.txt directives for Googlebot
  is the control for site owners to manage access to how their sites are crawled for Search."
  (`docs/search/docs/appearance/ai-features.md`)
- [corpus] Preview controls gate AI features too: "To limit the information shown from your
  pages in Search, use `nosnippet`, `data-nosnippet`, `max-snippet`, or `noindex` controls."
  (`docs/search/docs/appearance/ai-features.md`) A `max-snippet` of a tiny value or a blanket
  `nosnippet` therefore also limits what AI Overviews can show from you.

## What Google says GEO actually is

[corpus] All quotes from `docs/search/docs/fundamentals/ai-optimization-guide.md`:

- "From Google Search's perspective, optimizing for generative AI search is optimizing for the
  search experience, and thus still SEO."
- Eligibility is mechanical: "To be eligible to be shown in generative AI features on Google
  Search, a page must be indexed and eligible to be shown in Google Search with a snippet,
  fulfilling the Search technical requirements."
- AI Overviews retrieve via RAG and "query fan-out", both of which run on the ordinary Search
  index. There is no separate index to optimize for.

## What Google says you can skip (the mythbusting list)

[corpus] Same page. Each of these is a documented "you can ignore this", not our opinion:

- **llms.txt**: "You don't need to create new machine readable files, AI text files, markup, or
  Markdown to appear in Google Search (including its generative AI capabilities), as Google
  Search itself doesn't use them." And if you keep one anyway: "Doing so will neither harm nor
  help your site's visibility or rankings in Google Search, as Google Search ignores them."
  [vendor] No major answer engine (OpenAI, Anthropic, Perplexity) documents reading llms.txt
  either, as of this sheet's date. The auditor therefore treats a MISSING llms.txt as a
  non-finding. It only reports on one that exists but is broken (serves HTML instead of text,
  usually an SPA catch-all), because a broken file signals a rewrite bug, not a GEO gap.
- **Chunking**: "There's no requirement to break your content into tiny pieces for AI to better
  understand it."
- **Writing for AI**: "You don't need to write in a specific way just for generative AI search."
  Creating page variants per fan-out query violates the scaled content abuse policy.
- **Inauthentic mentions**: seeking planted mentions across the web "isn't as helpful as it
  might seem"; spam systems sit in front of the AI features.
- **Structured data as a GEO hack**: "Structured data isn't required for generative AI search,
  and there's no special schema.org markup you need to add." Keep using it for rich-result
  eligibility, which is a real, separate benefit.

## What actually moves GEO, in build order

1. **Serve real HTML.** The raw response must contain the main content, title, canonical,
   JSON-LD, and OG tags. (Everything in "the one structural fact" above.)
2. **Do not block the answer-engine crawlers you want citations from.** See the table.
3. **Be indexable and snippet-eligible in Google.** [corpus] That is the entire eligibility bar
   for AI Overviews. `noindex`, `nosnippet`, and aggressive `max-snippet` all subtract from it.
4. **Non-commodity content.** [corpus] "Creating content that people find unique, compelling,
   and useful will likely influence your website's presence in generative AI search in the long
   run more than any of the other suggestions in this guide." First-hand experience, a unique
   point of view, clear heading structure written for humans.
5. **Freshness signals where truthful.** [corpus] RAG is described as favoring "relevant,
   up-to-date web pages". Truthful `<lastmod>`, `datePublished`/`dateModified` in Article
   markup. Never fake dates.
6. **Unfurl correctly.** When an AI assistant or a human pastes your link into Slack/X/WhatsApp,
   the unfurler reads raw HTML only. `og:title`, `og:description`, `og:image` are the de facto
   standard (`https://ogp.me`, [vendor]). Not a Google ranking input; it is how your page looks
   everywhere links are shared.

## What this skill still cannot measure (GEO handoff)

- Whether ChatGPT/Claude/Perplexity/AI Overviews actually cite you today, and for which
  prompts. That requires querying those systems over time (a rank-tracking analogue). `UNKNOWN`
  to any crawler-side audit; use a tracking service or manual spot checks.
- Brand-mention volume across the web (the input LLMs weigh for entity familiarity). Off-page,
  same category as backlinks.
- Whether your content is actually good. [corpus] Google's own guide says this is the largest
  factor. No tool passes it honestly.

Sheet last verified against vendor docs: 2026-07-17.
