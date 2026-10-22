# Zero-Cost Architecture & Stack Standards

## Zero-Cost & Open-Source First
- **Zero-Cost Mandate**: Always architect applications using open-source libraries and generous free-tier cloud infrastructure. Never recommend or integrate paid APIs when robust open-source or free alternatives exist.
- **Auto-Generate Environment Files**: Whenever creating a new project or integrating services, automatically generate `.env.example` and scaffold `.env.local` with clear documentation and sensible local fallback defaults.

## Database, Auth & Backend (Supabase)
- **Primary Backend**: Use **Supabase** (Postgres, Auth, Storage, Row-Level Security) as the default backend for web applications.
- **Zero-Domain Email Auth**: Prioritize Supabase's built-in auth email engine for confirmations, magic links, and password resets (works immediately without requiring custom domain DNS verification).
- **Transactional & Broadcast Email**: Use Brevo (300 free emails/day) or Nodemailer with Gmail SMTP (500 free emails/day) to bypass Resend's custom domain restrictions during early development.

## User Roles & Dashboards (WordPress-Style Capabilities)
- **Role-Based Access Control (RBAC)**: All platforms must support distinct user tiers (`role: 'admin' | 'user'`).
- **Admin Control Room (`/admin`)**: Provide a WordPress-like management dashboard for administrators (user management, payments, content moderation).
- **User Dashboard (`/dashboard`)**: Provide user profiles, enrollment trackers, and member settings.
- **In-App CMS**: When blogging or content publishing is needed, implement an in-app visual rich-text editor (e.g., TipTap, BlockNote, or Markdown/MDX) backed by Supabase tables so the user can draft, format, and publish articles with one click—just like WordPress Gutenberg, with zero external SaaS fees.

## Continuous Deployment
- **Autonomous Shipping**: On instruction to deploy, run automated tests, stage changes, commit with clear descriptions, and push directly to GitHub (`main`) to trigger automatic Vercel production builds.
