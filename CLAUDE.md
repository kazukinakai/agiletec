# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgileTech is a corporate website with dual purpose:
1. AI/DX consultancy website built with Astro
2. Technical proof-of-concept for VibeSurfer SaaS (code generation tool interoperability)

## Essential Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Build for production
pnpm preview               # Preview production build
pnpm check                 # Run Astro checks

# Ready.ai Sync System
pnpm sync:ready-ai         # Run Ready.ai content sync
pnpm sync:ready-ai:dev     # Run with verbose logging
pnpm test:system           # Test sync system
pnpm clean:history         # Clean old sync history
pnpm stats                 # Show sync statistics

# Slack Connect Bot (separate project in slack-connect-bot/)
cd slack-connect-bot && npm run dev      # Local development
cd slack-connect-bot && npm run deploy   # Deploy to Cloudflare
```

## Architecture

### Main Website (Astro)
- **Framework**: Astro 5.x with Island Architecture
- **Styling**: UnoCSS (NOT Tailwind despite some docs)
- **Language**: TypeScript (strict mode)
- **Animations**: React components only for animations
- **Performance**: Target <100KB initial page, <50KB JS

### Ready.ai Sync System
Located in `scripts/ready-ai/`, this system:
- Scrapes content from dev.agiletec.net (Ready.ai site)
- Converts HTML/CSS to Astro components via custom converter
- Runs every 6 hours via GitHub Actions
- Uses MD5 hashing for change detection
- Stores history in `scraped-data/ready-ai/`

### Slack Connect Bot
Separate Cloudflare Workers app in `slack-connect-bot/`:
- Hono framework API
- Slack OAuth integration
- Infisical secrets management
- Automated Slack Connect channel creation

## Key Development Guidelines

### Component Creation
- Use `.astro` files for static content
- Use `.tsx` files ONLY for animation islands
- Follow existing component patterns in `src/components/`
- Prioritize GPU-accelerated animations (transform only)

### Performance Requirements
- 60FPS animations mandatory
- Respect `prefers-reduced-motion`
- Lazy load images with Astro Image
- Mobile-first responsive design

### Code Conversion
When working with Ready.ai sync:
- Converter is in `scripts/ready-ai/converter/htmlToAstro.ts`
- Maintains semantic HTML structure
- Converts inline styles to UnoCSS utilities
- Preserves animations and interactivity

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── animation/      # React animation components
│   │   ├── common/         # Shared components
│   │   └── sections/       # Page sections
│   ├── pages/              # Astro pages
│   └── layouts/            # Page layouts
├── scripts/
│   └── ready-ai/           # Content sync system
├── slack-connect-bot/      # Separate Worker project
└── docs/                   # Architecture documentation
```

## Important Context

This project serves as technology validation for VibeSurfer - a future SaaS platform enabling interoperability between code generation tools (Ready.ai, v0, Bolt, etc.). The Ready.ai sync system demonstrates the core conversion technology.

### Recent Additions (2025-06-28)
- **Scroll Background Animation**: GPU-accelerated parallax effect in `src/components/animation/ScrollBackground.astro`
- **Cloudflare Deployment**: Automated deployment workflow in `.github/workflows/deploy-cloudflare.yml`
- **VibeSurfer Vision**: Product roadmap in `docs/VIBESURFER_VISION.md`

### Key Domains
- **AgileTech**: agiletec.net (corporate site)
- **Ready.ai Mirror**: dev.agiletec.net (source for sync)
- **VibeSurfer**: vibesurfer.work (future SaaS product)

When making changes:
- Maintain dual-purpose nature (corporate site + tech demo)
- Preserve performance constraints
- Follow Island Architecture principles
- Consider VibeSurfer validation requirements
- Test Ready.ai sync after major changes