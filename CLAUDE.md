# Sauna Guide

> The ultimate sauna directory and guide website. Goal: become #1 resource for sauna enthusiasts and build a 100K+ subscriber newsletter.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Newsletter**: Beehiiv integration
- **Content**: MDX for guides, JSON for listings
- **AI Images**: NanoBanana for visuals

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── saunas/            # Listings pages
│   ├── guides/            # Educational content
│   └── api/               # API routes (newsletter signup)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── newsletter/       # Beehiiv signup forms
│   └── listings/         # Sauna listing components
├── content/guides/        # MDX guide articles
├── data/                  # Agent outputs and listings
└── lib/                   # Utilities and helpers
```

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check (tsc --noEmit)
```

## Agent Team

This project has a powerhouse team of AI agents. Invoke them proactively.

| Agent | Purpose |
|-------|---------|
| `reddit-scout` | Scrape Reddit for trends and content ideas |
| `trend-analyst` | Analyze Google Trends and social patterns |
| `seo-strategist` | Keyword research and SEO optimization |
| `content-writer` | Write articles and newsletter content |
| `image-creator` | Generate NanoBanana image prompts |
| `newsletter-strategist` | Growth and monetization strategy |
| `growth-hacker` | Viral tactics and rapid growth |
| `social-manager` | Social media content and scheduling |
| `team-coordinator` | Orchestrate all agents, weekly planning |

### Agent Workflows

- `/weekly-kickoff` - Run full research cycle and create weekly plan
- `/create-content [topic]` - Generate optimized article with images
- `/newsletter-edition` - Create complete newsletter ready for Beehiiv
- `/growth-sprint` - Execute focused growth tactics

### Agent Outputs

Agents save data to `src/data/`:
- `reddit-insights.json` - Reddit trends and opportunities
- `trend-report.json` - Search and social trends
- `seo-strategy.json` - Keyword targets and opportunities
- `newsletter-strategy.json` - Growth roadmap and KPIs
- `growth-tactics.json` - Prioritized growth activities
- `social-calendar.json` - Scheduled social content
- `weekly-plan.json` - Current week priorities

## Key Files

- `src/data/saunas.json` - Sauna listings database
- `src/lib/beehiiv.ts` - Newsletter API integration
- `src/content/guides/` - MDX guide articles
- `.claude/agents/` - Agent definitions

## Newsletter Growth Phases

1. **Foundation (0-1K)**: Build lead magnets, establish voice
2. **Growth (1K-10K)**: Referral program, cross-promotions
3. **Scale (10K-100K)**: Paid acquisition, partnerships
4. **Monetize (100K+)**: Sponsorships, premium tier

## Brand Voice

**CRITICAL: Read `src/data/brand-voice.json` before writing ANY copy.**

Core principles:
- We sell **longing**, not information
- The sauna is not a hack — it's a **practice**
- Lead with **atmosphere**, not features
- Give **permission** to slow down, don't pressure

| Use | Avoid |
|-----|-------|
| "Step inside" | "Subscribe now" |
| "Practice", "Ritual" | "Hack", "Optimize" |
| "Warmth", "Stillness" | "High performers", "Level up" |
| Short, breathing sentences | Hype and urgency |

**Signature phrases:**
- "There's a room with no notifications."
- "Just heat. Silence. Breath."
- "Slower. Hotter. Older."

## Content Guidelines

- Every piece drives newsletter signups through **longing**, not pressure
- Write for beginners AND enthusiasts
- Include safety information where relevant
- CTA language: "Step inside" (never "Subscribe now")

## SEO Requirements

IMPORTANT: Every page must have:
- Unique `<title>` and `meta description`
- Open Graph tags for social sharing
- Structured data (JSON-LD) where applicable
- Alt text on all images

## Environment Variables

```
BEEHIIV_API_KEY=your_key
BEEHIIV_PUBLICATION_ID=your_pub_id
```

## Verification

Before committing:
```bash
npm run typecheck && npm run lint && npm run build
```
