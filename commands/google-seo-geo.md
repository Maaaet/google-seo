---
description: Audit a site's GEO/AEO posture (AI answer-engine visibility) using the google-seo skill
argument-hint: "<url>  — e.g. https://example.com"
allowed-tools: Bash(node:*), Bash(command -v:*), Bash(test:*), Read, Skill
---
Audit a live site's visibility posture for AI answer engines (ChatGPT, Claude, Perplexity, AI Overviews, Copilot) plus link unfurlers, grounded in `references/geo.md` and Google's own AI-optimization guide in the corpus.

1. **Load the skill first.** Invoke the Skill tool with `skill: "google-seo"`, then read `~/.claude/skills/google-seo/references/geo.md`. Respect its two sourcing tiers: [corpus] claims come from Google's docs; [vendor] claims cite OpenAI/Anthropic/Perplexity/Apple/Meta URLs and may have drifted since the sheet's date.
2. **Target.** Use the URL in `$ARGUMENTS`. If none was given, ask for one.
3. **Run the auditor with rendering.** `node ~/.claude/skills/google-seo/audit.mjs <url> --render --json /tmp/geo-report.json`
   - `--render` matters more here than anywhere else: the raw-vs-rendered content delta IS the core GEO defect. If Chrome is missing, run raw-only and say clearly that the biggest GEO check was skipped.
4. **Focus the triage on these areas of the JSON:** `ai-search` (crawler access by role, llms.txt, snippet controls), `javascript` (content invisible to non-rendering crawlers), `social` (Open Graph for unfurlers), `structured-data` (freshness/authorship signals), plus any `noindex`/soft-404 findings, since snippet-eligible indexing is the documented eligibility bar for Google's AI features.
5. **Report in three buckets:**
   - **Blocked surfaces**: which answer engines cannot index, cite, or live-fetch the site, and whether each block looks intentional (training-bot blocks are policy choices, not defects; never advise unblocking one without asking).
   - **Invisible content**: what only exists after JS runs (title, canonical, JSON-LD, OG, main text) and the SSR/prerender fix.
   - **Eligibility and signals**: indexability, snippet controls, freshness/authorship markup.
6. **Set expectations honestly.** Say what this audit cannot see: whether engines actually cite the site today (needs longitudinal prompt testing), brand-mention volume, content quality. Do not recommend llms.txt, chunking, writing "for AI", or planted mentions; the corpus documents each as useless or harmful for Google, and no major engine documents needing them.

Read-only: do NOT change code under this command. To fix findings, use `/google-seo-fix`.
