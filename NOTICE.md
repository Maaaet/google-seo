# Attribution

`docs/` is a local fork of Google's Search Central documentation
(https://developers.google.com/search/docs), fetched by `scripts/fetch-docs.py` and converted
from HTML to Markdown. Each file's frontmatter records its `source:` URL and `fetched:` date.

Google licenses that documentation under the **Creative Commons Attribution 4.0 License** (code
samples under Apache 2.0), per the Google Developers Site Policies:
https://developers.google.com/site-policies

Note: the license notice appears in each page's footer, which this fork does **not** mirror — the
fetcher extracts article bodies only. Verify the terms at the Site Policies link above or in any
page's live footer, not in `docs/`.

This fork is redistributed under CC BY 4.0 with attribution to Google. It is a point-in-time
snapshot and is **not** authoritative — always defer to the live page linked in each file's
`source:` frontmatter. Google, Google Search, and Search Console are trademarks of Google LLC.
This project is not affiliated with or endorsed by Google.

Everything outside `docs/` (SKILL.md, audit.mjs, references/, scripts/, test-audit.mjs) is original
work, MIT-licensed — see LICENSE.
