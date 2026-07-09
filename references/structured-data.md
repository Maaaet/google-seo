# Structured Data (Rich Results)

Ground truth from Google's structured-data docs: which feature maps to which schema.org `@type`, the top-level required properties, which features are gated (limited-access / invite-only / beta / region-locked), and the binding content policies. Every factual claim is an exact quote + a repo-relative source path. `UNKNOWN` appears only where the source page genuinely does not state a value.

Corpus status: complete (158 pages; feature tables render as markdown `| cell | cell |` rows). The four features that a prior extraction truncated — `local-business`, `video`, `profile-page`, `qapage` — are now resolved from their actual "Required properties" tables (see the gating table below).

## Feature → @type → required properties → gating

Required properties = top-level required only; nested/conditional required trees live in each feature's source file. Accepted markup formats for all features: "JSON-LD (recommended)", "Microdata", "RDFa" (`docs/search/docs/appearance/structured-data/sd-policies.md`).

| Feature | schema.org @type(s) | Required properties (top-level) | Gating / access | Source |
|---|---|---|---|---|
| Article | `Article`, `NewsArticle`, `BlogPosting` | "There are no required properties" | none | `appearance/structured-data/article.md` |
| Breadcrumb | `BreadcrumbList` → `ListItem` | BreadcrumbList: `itemListElement`. ListItem: `item`, `name`, `position` (item/name not required for the last item) | "available on desktop in all regions and languages where Google Search is available" | `appearance/structured-data/breadcrumb.md` |
| Carousel (host) | `ItemList` → `ListItem` (+ Recipe/Course/Movie/Restaurant) | ItemList: `itemListElement` (≥2 same-type `ListItem`). Summary ListItem: `position`, `url`. All-in-one: `item`, `item.name`, `item.url`, `position` | none, but "must be combined with one of the following features: Recipe , Course list , Restaurant , Movie" | `appearance/structured-data/carousel.md` |
| Carousels (beta) | `ItemList` + `LocalBusiness`/`Product`/`Event` | ItemList: `itemListElement` (≥3), `itemListElement.item`, `itemListElement.position`. Item: `image`, `name`, `url` | **beta + region-locked** (EEA, Turkey, South Africa) + interest form | `appearance/structured-data/carousels-beta.md` |
| Education Q&A | `Quiz` → `Question` → `Answer` | Quiz: `hasPart`. Question: `acceptedAnswer`, `eduQuestionType` (fixed value `Flashcard`), `text` | topic + region gated: "only available when searching for education-related topics on desktop and mobile"; language/region table | `appearance/structured-data/education-qa.md` |
| Event | `Event` (+ `Place`, `Offer`) | `location`, `location.address`, `name`, `startDate` | region/language limited; "Events must be bookable to the general public"; "Events must take place in a physical location" | `appearance/structured-data/event.md` |
| Job posting | `JobPosting` | `datePosted`, `description`, `hiringOrganization`, `jobLocation` (+ `addressCountry`), `title` | regional availability list; education/experience props are **beta** | `appearance/structured-data/job-posting.md` |
| Local business | `LocalBusiness` (+ subtypes, e.g. `Restaurant`) | `address` (`PostalAddress`), `name` | none feature-level; **Restaurant carousel is limited-access** (register interest) | `appearance/structured-data/local-business.md` |
| Merchant listing | `Product` → `Offer` | Product: `name`, `image`, `offers`. Offer: `price` or `priceSpecification.price`, `priceCurrency` or `priceSpecification.priceCurrency`; "merchant listing experiences require a price greater than zero" | none feature-level; loyalty/`membershipPointsEarned` props are beta | `appearance/structured-data/merchant-listing.md` |
| Organization | `Organization` (+ subtypes, e.g. `OnlineStore`) | "There are no required properties" | none | `appearance/structured-data/organization.md` |
| Product (intro) | `Product` | router page — defers to product-snippet + merchant-listing (no required list of its own) | none | `appearance/structured-data/product.md` |
| Product snippet | `Product`, `Review`, `Offer` | Product: `name` + **one of** `review` / `aggregateRating` / `offers`. Offer: `price` or `priceSpecification.price` | none; pros/cons available in 10 named languages "in all countries where Google Search is available" | `appearance/structured-data/product-snippet.md` |
| Profile page | `ProfilePage` (`mainEntity` = `Person`/`Organization`) | ProfilePage: `mainEntity`. Person/Organization: `name` | none | `appearance/structured-data/profile-page.md` |
| Q&A page | `QAPage`, `Question`, `Answer` | QAPage: `mainEntity`. Question: `answerCount`, **either** `acceptedAnswer` **or** `suggestedAnswer`, `name`. Answer: `text`. (Comment, if used: `text`) | none | `appearance/structured-data/qapage.md` |
| Recipe | `Recipe`, `HowTo`, `ItemList` | Recipe: `image`, `name` (nested `ItemList` only for host carousel) | none | `appearance/structured-data/recipe.md` |
| Review snippet | `Review`, `AggregateRating` | Review: `author`, `itemReviewed` (unless nested), `itemReviewed.name`/parent `name`, `reviewRating`, `reviewRating.ratingValue`. AggregateRating: `itemReviewed` (unless nested), `itemReviewed.name`/parent `name`, **one of** `ratingCount`/`reviewCount`, `ratingValue` | self-serving reviews ineligible (see rules below); `LocalBusiness`/`Organization` only "for sites that capture reviews about other local businesses"/"other organizations" | `appearance/structured-data/review-snippet.md` |
| Speakable (beta) | `speakable` on `Article`/`WebPage` | **one of** `cssSelector` or `xPath` — "Use either `cssSelector` or `xPath`; don't use both" | **beta + geo/language**: US users, English content, Google Home | `appearance/structured-data/speakable.md` |
| Subscription / paywalled | `CreativeWork` (+ `Article`, `NewsArticle`, `WebPage`, etc.) | `isAccessibleForFree` | none; only for content you want crawled and indexed | `appearance/structured-data/paywalled-content.md` |
| Vacation rental | `VacationRental` (`Accommodation`) | `containsPlace`, `containsPlace.occupancy`, `containsPlace.occupancy.value`, `identifier`, `image` (min 8 photos), `latitude` (or `geo.latitude`), `longitude` (or `geo.longitude`), `name` | **limited-access / invite-only**: Technical Account Manager + Hotel Center | `appearance/structured-data/vacation-rental.md` |
| Video | `VideoObject` (+ `Clip`, `BroadcastEvent`, `SeekToAction`) | VideoObject: `name`, `thumbnailUrl`, `uploadDate` | none feature-level; `SeekToAction` limited to 12 named languages; LIVE badge via `BroadcastEvent` (opt-in) | `appearance/structured-data/video.md` |
| Book actions | `Book` (`Work` + `Edition`), `DataFeed`, `ReadAction`/`BorrowAction` | DataFeed: `@context`, `@type`, `dataFeedElement`, `dateModified`. Book(Work): `@context`, `@id`, `@type`, `author`, `name`, `url`, `workExample`. Book(Edition): `@id`, `@type`, `bookFormat`, `inLanguage`, `isbn`, `potentialAction` | **invite-only / partners-only**: interest form + onboarding | `appearance/structured-data/book.md` |

### Nested required properties for the two feature-level "opt-in" video sub-types

- `BroadcastEvent` (LIVE badge — "While `BroadcastEvent` properties aren't required, you must add the following properties if you want your video to display with a LIVE badge"): `publication`, `publication.endDate`, `publication.isLiveBroadcast`, `publication.startDate`. (`appearance/structured-data/video.md`)
- `Clip` (key moments): `name`, `startOffset`, `url`. `SeekToAction`: `potentialAction`, `potentialAction.startOffset-input`, `potentialAction.target`. (`appearance/structured-data/video.md`)

### Gated-feature summary — do NOT tell a client to "just add markup" (exact language)

- **Vacation rental** — invite-only. "These instructions are intended for sites that have already connected with a Google Technical Account Manager and have access to the Hotel Center." "Filling out the form is an expression of interest and doesn't guarantee an invitation into the Early Adopters Program." (`appearance/structured-data/vacation-rental.md`)
- **Book actions** — invite/onboarding-only. "To ensure robust coverage and better serve Search users, this feature is currently limited to book providers with a wide selection of available books." "The use of this feature is limited to book providers that have filled out the interest form and have been onboarded." "A Google support team will reach out to you with details about how and where to upload your feed." (`appearance/structured-data/book.md`)
- **Speakable** — beta + geo/language. "This feature is in beta and subject to change." "The `speakable` property works for users in the U.S. that have Google Home devices set to English, and publishers that publish content in English." (`appearance/structured-data/speakable.md`)
- **Education Q&A** — topic + region gated. "The education Q&A carousel is only available when searching for education-related topics on desktop and mobile." "The education Q&A carousel is available in the following languages and regions:" (English / Portuguese: all regions; Spanish: Mexico). (`appearance/structured-data/education-qa.md`)
- **Carousels (beta)** — beta + region-locked. "This feature is in beta and you may see changes in requirements or guidelines, as we develop this feature. This feature is also only available in European Economic Area (EEA) countries, Turkey, and South Africa, on both desktop and mobile devices." (`appearance/structured-data/carousels-beta.md`)
- **Restaurant / local-business carousel** — limited-access. "The Restaurant carousel is currently limited to a small set of restaurant providers. If you would like to participate, register your interest in our form." (`appearance/structured-data/local-business.md`)
- **Job posting** education/experience props — beta. (`appearance/structured-data/job-posting.md`)
- **Merchant listing** loyalty props — "Beta: This property is in beta, and you may not see an effect in Google Search right away." (`appearance/structured-data/merchant-listing.md`)

## Hard requirements

### sd-policies — binding across ALL features (visibility, no fabrication, no markup for off-page content)

Exact quotes from `docs/search/docs/appearance/structured-data/sd-policies.md` unless noted:

- Visibility: "Don't mark up content that is not visible to readers of the page. For example, if the JSON-LD markup describes a performer, the HTML body must describe that same performer." — `appearance/structured-data/sd-policies.md`
- No markup for content not on the page (intro): "Don't create blank or empty pages just to hold structured data, and don't add structured data about information that is not visible to the user, even if the information is accurate." — `appearance/structured-data/intro-structured-data.md`
- No fake/misleading content: "Don't mark up irrelevant or misleading content, such as fake reviews or content unrelated to the focus of a page." — `appearance/structured-data/sd-policies.md`
- No deception/impersonation: "Don't use structured data to deceive or mislead users. Don't impersonate any person or organization, or misrepresent your ownership, affiliation, or primary purpose." — `appearance/structured-data/sd-policies.md`
- Original content: "Provide original content that you or your users have generated." — `appearance/structured-data/sd-policies.md`
- Up to date: "Provide up-to-date information. We won't show a rich result for time-sensitive content that is no longer relevant." — `appearance/structured-data/sd-policies.md`
- Fabricated ratings → manual action: "reviews or ratings not by actual users may result in manual action" — `appearance/structured-data/sd-policies.md`
- Relevance: "Your structured data must be a true representation of the page content." — `appearance/structured-data/sd-policies.md`
- Completeness: "Specify all required properties listed in the documentation for your specific rich result type. Items that are missing required properties are not eligible for rich results." — `appearance/structured-data/sd-policies.md`
- Access: "Don't block your structured data pages to Googlebot using robots.txt, `noindex`, or any other access control methods." — `appearance/structured-data/sd-policies.md`

Consequence / non-guarantee:

- "A structured data manual action means that a page loses eligibility for appearance as a rich result; it doesn't affect how the page ranks in Google web search." — `appearance/structured-data/sd-policies.md`
- "Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly according to the Rich Results Test." — `appearance/structured-data/sd-policies.md`

### Review-snippet rules — self-serving restriction + required AggregateRating/Review props

Provenance / self-serving — exact quotes from `docs/search/docs/appearance/structured-data/review-snippet.md`:

- Self-serving reviews are ineligible: "If the entity that's being reviewed controls the reviews about itself, their pages that use `LocalBusiness` or any other type of `Organization` structured data are ineligible for star review feature." — `appearance/structured-data/review-snippet.md`
- "Ratings must be sourced directly from users." — `appearance/structured-data/review-snippet.md`
- "Don't rely on human editors to create, curate, or compile ratings information for local businesses." — `appearance/structured-data/review-snippet.md`
- "Don't aggregate reviews or ratings from other websites." — `appearance/structured-data/review-snippet.md`
- Visibility: "Make sure the review content you mark up are readily available to users from the marked-up page. It must be immediately obvious to users that the page has review content." — `appearance/structured-data/review-snippet.md`
- "If you include multiple individual reviews, also include an aggregate rating of the individual reviews." — `appearance/structured-data/review-snippet.md`
- "Provide review information about a specific item, not about a category or a list of items." — `appearance/structured-data/review-snippet.md`
- Valid author name: "The reviewer's name must be a valid name. For example, \"50% off until Saturday\" is not a valid name for a reviewer." — `appearance/structured-data/review-snippet.md`
- `LocalBusiness`/`Organization` reviews eligible only "for sites that capture reviews about other local businesses" / "for sites that capture reviews about other organizations". — `appearance/structured-data/review-snippet.md`

`AggregateRating` required properties (exact) — `docs/search/docs/appearance/structured-data/review-snippet.md`:

- `itemReviewed` (if not a Nested Aggregate Rating) — "The item that is being rated." (omit if nested via `aggregateRating`).
- `itemReviewed.name` or parent `name` — "The name of the item that is being reviewed."
- `ratingCount` — "The total number of ratings for the item on your site. At least one of `ratingCount` or `reviewCount` is required."
- `reviewCount` — "Specifies the number of people who provided a review with or without an accompanying rating. At least one of `ratingCount` or `reviewCount` is required."
- `ratingValue` — "The average rating for the item's quality using a numerical rating..."
- Recommended: `bestRating` ("If `bestRating` is omitted, 5 is assumed."), `worstRating` ("If `worstRating` is omitted, 1 is assumed.").

`Review` required properties (exact): `author`, `itemReviewed` (if not a Nested Review), `itemReviewed.name`/parent `name`, `reviewRating`, `reviewRating.ratingValue`. Author length rule: "This field must be shorter than 100 characters. If it's longer than 100 characters, your page won't be eligible for an author-based review snippet." — `appearance/structured-data/review-snippet.md`

Formatting rule: "For decimal numbers, use a dot instead of a comma to specify the value (for example `4.4` instead of `4,4`)." — `appearance/structured-data/review-snippet.md`

## Recommendations

- Prefer JSON-LD: "In general, Google recommends using JSON-LD for structured data if your site's setup allows it, as it's the easiest solution for website owners to implement and maintain at scale." — `appearance/structured-data/intro-structured-data.md`
- Google Search Central docs win over schema.org: "you should rely on the Google Search Central documentation as definitive for Google Search behavior, rather than the schema.org documentation." — `appearance/structured-data/intro-structured-data.md`
- Quality over quantity: "it is more important to supply fewer but complete and accurate recommended properties rather than trying to provide every possible recommended property with less complete, badly-formed, or inaccurate data." — `appearance/structured-data/intro-structured-data.md`
- Specificity: "Try to use the most specific applicable type and property names defined by schema.org for your markup." — `appearance/structured-data/sd-policies.md`
- Duplicates: "If you have duplicate pages for the same content, we recommend placing the same structured data on all page duplicates, not just on the canonical page." — `appearance/structured-data/sd-policies.md`
- Images must be crawlable: "All image URLs specified in structured data must be crawlable and indexable." — `appearance/structured-data/sd-policies.md`
- Monitor after deploy: "Be sure to check your structured data using the Rich Results Test during development, and the Rich result status reports after deployment." — `appearance/structured-data/intro-structured-data.md`

## Ignored / myths

- Data-vocabulary is dead: "Data-vocabulary.org markup is no longer eligible for Google rich result features." — `appearance/structured-data/intro-structured-data.md`
- Markup ≠ guaranteed display: "Using structured data enables a feature to be present, it does not guarantee that it will be present." — `appearance/structured-data/sd-policies.md`
- Manual action does not touch ranking: "it doesn't affect how the page ranks in Google web search." — `appearance/structured-data/sd-policies.md`
- More recommended props ≠ always better: see the "quality over quantity" quote above — `appearance/structured-data/intro-structured-data.md`

## Auditable checks

1. `[auto]` Parse each page's JSON-LD/Microdata/RDFa; for the declared feature, assert every top-level required property from the gating table is present and non-empty. Missing = "not eligible for rich results". Source: `appearance/structured-data/sd-policies.md`.
2. `[auto]` Confirm markup format is one of JSON-LD / Microdata / RDFa; flag any data-vocabulary.org usage as dead. Source: `appearance/structured-data/intro-structured-data.md`.
3. `[render]` Render the page and verify every marked-up entity/field is also visible in the rendered HTML body (performer, reviews, price, hours, etc.). Any markup-only field violates the visibility rule. Source: `appearance/structured-data/sd-policies.md`, `appearance/structured-data/intro-structured-data.md`.
4. `[auto]` Confirm structured-data pages are not blocked by robots.txt / `noindex` / login. Source: `appearance/structured-data/sd-policies.md`.
5. `[auto]` Review snippet: if `AggregateRating` is present, assert at least one of `ratingCount`/`reviewCount` AND `ratingValue` are present, and `ratingValue` uses a dot decimal. Source: `appearance/structured-data/review-snippet.md`.
6. `[handoff]` Review snippet: verify reviews are user-sourced and not self-serving (entity reviewing itself via `LocalBusiness`/`Organization`), not aggregated from other sites, not editor-curated. Requires human judgment of provenance. Source: `appearance/structured-data/review-snippet.md`.
7. `[handoff]` Before recommending a gated feature (vacation rental, book actions, restaurant/local-business carousel, carousels-beta, speakable, education Q&A), confirm the client meets the access precondition (TAM/Hotel Center, onboarding, region, beta, topic). Do not promise the rich result otherwise. Source: `appearance/structured-data/vacation-rental.md`, `book.md`, `local-business.md`, `carousels-beta.md`, `speakable.md`, `education-qa.md`.
8. `[render]` Validate with the Rich Results Test and URL Inspection (live) — but treat a pass as eligibility only, not guaranteed display. Source: `appearance/structured-data/sd-policies.md`.
9. `[auto]` Author name sanity: flag `Review.author` (or `author.name`) ≥100 chars or promotional strings (e.g. "50% off until Saturday"). Source: `appearance/structured-data/review-snippet.md`.
10. `[auto]` Carousel: assert `itemListElement` has ≥2 same-type `ListItem`s (≥3 for carousels-beta) and each `url` is unique on the same domain. Source: `appearance/structured-data/carousel.md`, `appearance/structured-data/carousels-beta.md`.
11. `[auto]` Local business: assert `address` (`PostalAddress`) and `name` are present. Q&A page: assert `QAPage.mainEntity` → `Question` has `answerCount`, `name`, and at least one `acceptedAnswer`/`suggestedAnswer`, each `Answer` with `text`. Profile page: assert `ProfilePage.mainEntity` (`Person`/`Organization`) has `name`. Video: assert `VideoObject` has `name`, `thumbnailUrl`, `uploadDate`. Source: `appearance/structured-data/local-business.md`, `qapage.md`, `profile-page.md`, `video.md`.
