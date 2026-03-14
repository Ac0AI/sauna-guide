# SEO Title & Meta Description Guide

> Reference for writing titles and meta descriptions that rank AND get clicks.
> Based on Google Search Console data + SERP analysis (March 2026).

## The Rules

### Titles (`<title>` tag / frontmatter `title:`)

| Rule | Why |
|------|-----|
| **Max 55 characters** | Google truncates at ~60. Aim for 55 to be safe. |
| **Primary keyword first** | Google weighs words at the start more. "Sauna Safety Guidelines" > "The Complete Guide to Sauna Safety" |
| **Use words people actually search** | Check Search Console / Google autocomplete. People type "when to avoid sauna", not "sauna contraindications". |
| **No filler words** | Kill "The", "A Complete Guide to", "Everything You Need to Know", "The Ultimate". They waste characters. |
| **No pipe-separated brand names** | "... \| Sauna Guide" eats 15 characters. Google adds site name automatically. |
| **Question format only if people search that way** | "How Long to Sit in a Sauna?" works. "Who Should Not Use a Sauna?" doesn't — nobody types that. |
| **Numbers work** | "7 Sauna Mistakes" > "Common Sauna Mistakes". But only if the content delivers. |

### Bad vs Good Titles

```
BAD  (75 chars, truncated, filler):
"Sauna Safety: The Complete Guide to Heat Therapy Without the Hospital Visit"

GOOD (51 chars, keyword-first):
"Sauna Safety Guidelines: How to Use a Sauna Safely"
```

```
BAD  (70 chars, brand-voice over search intent):
"The Complete Contrast Therapy Guide: Sauna and Cold Plunge as Practice"

GOOD (53 chars, matches what people search):
"Contrast Therapy Guide: Sauna & Cold Plunge Protocol"
```

```
BAD  (82 chars, way too long):
"Bryan Johnson's Sauna Protocol: Blueprint for Sweating Out Microplastics (Or Is It?)"

BETTER (56 chars):
"Bryan Johnson's Sauna Protocol: What the Science Says"
```

### Meta Descriptions (`description:`)

| Rule | Why |
|------|-----|
| **Max 155 characters** | Google truncates at ~160. |
| **Include the primary keyword** | It gets bolded in search results. |
| **Be specific** | Numbers, steps, lists signal value: "12 conditions, 8 medications, 6 situations" |
| **Answer the search intent** | If they search "sauna after lifting", they want to know: help or hurt? Tell them. |
| **Include a reason to click** | "Evidence-based", "step-by-step", "with protocols", "free" — value signals. |
| **No brand voice in descriptions** | Save "practice, not a hack" and "five minutes of stillness" for the actual content. Search snippets need clarity, not poetry. |

### Bad vs Good Descriptions

```
BAD  (brand voice, vague):
"Learn to move between heat and cold as a practice, not a hack.
Protocols, science, safety, and the transformative threshold moment where everything shifts."

GOOD (specific, actionable):
"How to do contrast therapy with sauna and cold plunge.
Timing, temperatures, rounds, benefits, and safety. Step-by-step protocols for beginners to advanced."
```

## How to Find the Right Keywords

1. **Google autocomplete** — Start typing your topic in Google. The suggestions ARE what people search.
2. **"People also ask"** — Search your topic and check the PAA box. These are real queries.
3. **Search Console** — Run `pnpm search-console` to see actual queries driving impressions.
4. **Competitor titles** — Search your target keyword. What titles rank on page 1? Mirror their structure, not their exact words.

## Title vs H1

- The `title:` in frontmatter becomes both the `<title>` tag AND the H1 by default.
- They CAN be different if needed (manual H1 in the MDX body).
- `<title>` = optimized for search (keyword-first, concise).
- `H1` = optimized for the reader (can be more expressive).
- For most guides, keeping them the same is fine.

## Checklist Before Publishing

- [ ] Title under 55 characters?
- [ ] Primary keyword in the first 4 words of the title?
- [ ] Description under 155 characters?
- [ ] Description includes the primary keyword?
- [ ] Googled the keyword — does the title match what ranks?
- [ ] No filler words ("Complete Guide", "Ultimate", "Everything You Need")?
- [ ] Description is specific (numbers, steps, deliverables)?
- [ ] H1 and title are aligned (same or complementary)?

## Current Issues to Fix

These titles are too long or use filler. Fix when editing these pages:

| Guide | Current Title | Chars | Issue |
|-------|--------------|-------|-------|
| bryan-johnson-sauna-protocol | "Bryan Johnson's Sauna Protocol: Blueprint for Sweating Out Microplastics (Or Is It?)" | 85 | Way too long, truncated |
| longevity-sauna-protocol | "The Longevity Protocol: How 4 Sauna Sessions Per Week Could Add Years to Your Life" | 83 | Too long, "The" filler |
| sauna-for-women | "Sauna for Women: What Every Guide Written by Finnish Men Forgot to Tell You" | 75 | Too long, truncated |
| home-sauna-cost-guide-2026 | "Home Sauna Cost Guide 2026: Real Budgets, Running Costs, and What People Underestimate" | 87 | Way too long |
| ultimate-home-sauna-buying-guide | "Ultimate Home Sauna Buying Guide 2026: Everything You Need to Know" | 66 | "Ultimate" + "Everything You Need to Know" filler |
| infrared-sauna-complete-guide | "The Infrared Sauna: A Complete Guide to Gentle Heat Therapy" | 59 | "The" + "A Complete Guide to" filler |
| homepage | "Home Sauna Buying Guide 2026 \| Honest Reviews & Comparisons \| Sauna Guide" | 73 | Double pipe, too long |

## Pages That Work Well (Don't Touch)

These follow good patterns:

| Guide | Title | Chars |
|-------|-------|-------|
| sauna-etiquette | "Sauna Etiquette: How Not to Be That Person (A Global Guide)" | 60 |
| sauna-after-lifting | "Sauna After Lifting: Does Heat Help or Hurt Muscle Growth?" | 59 |
| morning-vs-evening-sauna | "Morning vs Evening Sauna: Which Timing Is Better for Energy, Sleep, and Performance?" | 85 -- but keyword matches search intent well |
| sauna-mistakes-to-avoid | "7 Sauna Mistakes Everyone Makes (And One That Could Kill You)" | 61 |
| sauna-weight-loss-myth | "The Truth About Sauna Weight Loss (And Why It Doesn't Matter)" | 61 |
| contrast-therapy | "Contrast Therapy: The Complete Protocol for Sauna + Cold Plunge" | 63 |
