#!/usr/bin/env python3
"""Generate references/COVERAGE.md: which corpus pages the rule sheets actually cite.

Mechanical, so the skill can never quietly overclaim its own coverage again.
Exit 1 if the summary in README.md disagrees with reality.
"""
import pathlib, re, sys, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
pages = sorted(p.relative_to(ROOT).as_posix() for p in DOCS.rglob("*.md"))

cited = set()
prose = []
for f in list((ROOT / "references").glob("*.md")) + [ROOT / "SKILL.md", ROOT / "README.md", ROOT / "audit.mjs"]:
    if not f.exists():
        continue
    prose.append(f.read_text(errors="replace"))
blob = "\n".join(prose)
for p in pages:
    # A page counts as cited only when something PATH-SHAPED points at it: the full repo path, or
    # the path with the docs/ prefix stripped (e.g. "crawling-indexing/sitemaps/build-sitemap").
    # Matching a bare stem would score `video.md` as covered because some sheet says "video" --
    # which is how the first version of this script reported a fraudulent 158/158.
    rel = p.replace("docs/search/docs/", "").replace("docs/crawling/docs/", "")[:-3]
    if "/" not in rel:                     # top-level hub pages: require the full path
        if p in blob:
            cited.add(p)
        continue
    if p in blob or rel in blob:
        cited.add(p)

missing = [p for p in pages if p not in cited]
by_sec = collections.defaultdict(list)
for p in missing:
    rel = p.replace("docs/search/docs/", "").replace("docs/crawling/docs/", "crawling/")
    by_sec[rel.split("/")[0] if "/" in rel else "root"].append(p)

out = ["# Coverage: corpus vs. rule sheets", "",
       f"`docs/` holds **{len(pages)} of 158** Google Search Central pages — the corpus is complete.",
       f"The `references/` sheets summarize **{len(cited)}** of them ({len(cited)*100//len(pages)}%).", "",
       "The sheets are a working subset for auditing a typical site. They are **not** a replacement",
       "for the corpus. For anything below, or anything you're unsure of, **grep `docs/` directly.**", ""]
if missing:
    out += [f"## Pages not summarized in a rule sheet ({len(missing)})", ""]
    for sec in sorted(by_sec):
        out.append(f"**{sec}**")
        out += [f"- `{p}`" for p in sorted(by_sec[sec])]
        out.append("")
else:
    out.append("Every page is referenced by at least one rule sheet.")

(ROOT / "references" / "COVERAGE.md").write_text("\n".join(out) + "\n")
print(f"corpus={len(pages)} cited={len(cited)} missing={len(missing)}")
