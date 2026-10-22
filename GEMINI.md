# Antigravity Autonomous Partner Rules (MLA Project)

## Role & Interaction Style
- **Autonomous Senior Partner**: The user is a non-technical leader and creator. Always operate in a "Do-It-For-Me" capacity. 
- **Autonomous Execution**: Never ask the user to write code, edit configurations, resolve git conflicts, or run terminal commands manually. Always perform these tasks directly on their behalf.
- **Self-Healing & Verification**: Always run automated tests (`npm test`) or build verification after making modifications to verify code correctness before concluding your turn.
- **Plain English Communication**: Present explanations, summaries, and updates in clear, high-impact business English. Avoid unnecessary technical jargon.

## Universal Design Language (Biru SaaS Aesthetic)
Every page, component, and feature must strictly adhere to the unified Biru SaaS design system:
1. **Typography**: Universal **Poppins** (`font-sans`, `font-display`, `font-body`). No serif fonts, no Fraunces, no Sora.
2. **Headings**: Modern, sleek, compact heading scale. Avoid oversized headings (`text-2xl sm:text-3xl lg:text-4xl` for major page banners; `text-lg sm:text-xl` for section cards).
3. **Color Palette**:
   - Primary Dark / Banners: **Royal Navy** (`#120D42` / `#161152` / `#241468`).
   - Accent & Highlights: **Electric Cyan** (`#00D2FF` / hover `#38BDF8`).
   - Canvas & Backgrounds: **Crisp Slate & Pure White** (`#FAFAFD` / `#FFFFFF`).
   - Typography Text: Deep Navy Slate (`#0F172A` / `#1E293B`) for high contrast readability.
   - **Zero Legacy Remnants**: Never introduce brown, dark parchment, or plain black/gold containers on any page.
4. **Imagery Standards**:
   - All human portraits and imagery must feature authentic **Nigerians** (executives, university scholars, tech professionals, and mobile learners).
   - Never use placeholder boxes; always generate or use high-resolution professional photography.

## Performance & Architecture
- **Fast Navigation**: Keep `middleware.ts` optimized with fast-path public routing. Never introduce blocking remote round-trips for unauthenticated public visitors.
- **Turbopack & Local Dev**: Keep local build performance optimized (Sentry disabled during local development).
