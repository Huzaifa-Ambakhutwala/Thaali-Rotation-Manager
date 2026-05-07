**Mehdi Automates**

Product Requirements & Tech Stack Document

**Thaali Rotation Manager**  
Web Application — Zone Coordinator Platform

|             |                         |
|-------------|-------------------------|
| **Project** | Thaali Rotation Manager |

|            |                 |
|------------|-----------------|
| **Author** | Mehdi Automates |

|             |     |
|-------------|-----|
| **Version** | 1.0 |

|          |          |
|----------|----------|
| **Date** | May 2026 |

|            |                               |
|------------|-------------------------------|
| **Status** | Draft — Ready for Development |

**1. Product Overview**

**1.1 Background & Problem Statement**

Thaali (food tray) delivery is a community service where food is
distributed across multiple geographic zones in a city. Each zone has a
coordinator who manages a roster of volunteers who take turns picking up
trays from the masjid and delivering them to a designated drop-off
point.

Currently, coordinators manage these rotations manually — through
spreadsheets, WhatsApp messages, and memory — leading to missed turns,
confusion about schedules, and inefficient reminder workflows.

**1.2 Product Vision**

Thaali Rotation Manager is a multi-tenant web application that gives
zone coordinators a clean, intuitive dashboard to manage member rosters,
assign pickup rotations on a calendar, and automate email reminders —
all within a secure, zone-scoped login system managed by a super admin.

**1.3 Goals**

- Eliminate manual rotation tracking for zone coordinators

- Reduce missed pickups through automated email reminders

- Give coordinators flexible auto-scheduling with per-member
  customization

- Provide a secure, role-based access system (Super Admin + Zone
  Coordinators)

- Build a branded, polished product under the Mehdi Automates identity

**1.4 Non-Goals (v1)**

- Mobile native app (responsive web only in v1)

- SMS / push notification channels (email only in v1)

- Member self-service portal (coordinator-managed only in v1)

- Payment or donation tracking

**2. User Roles & Access Control**

| **Role** | **Description** | **Access Scope** |
|----|----|----|
| Super Admin | The app owner (Mehdi). Manages all zones and coordinator accounts. | Full access to all zones, settings, and user management |
| Zone Coordinator | Manages a single zone. Logs in via Google with a pre-approved email. | Scoped strictly to their assigned zone only |

**3. Feature Requirements**

**3.1 Authentication — Google OAuth Login**

- All users log in via Google OAuth 2.0 (no password setup required)

- Super Admin adds coordinator email addresses in the admin dashboard
  before they can log in

- On login, the system checks the authenticated email against an
  allowlist

- Super Admin email is hardcoded in environment variables (not in the
  UI)

- If an email is not on the allowlist, login is rejected with a friendly
  message

- Zone Coordinators are automatically routed to their zone dashboard
  after login

**3.2 Super Admin Dashboard**

**Zone Management**

- Create, edit, and delete zones

- Each zone record: Zone Name, City Area, Delivery Address, Coordinator
  Name, Coordinator Email

- Assign or reassign a coordinator to a zone

- View a summary of all zones and their current coordinator

**Coordinator Oversight**

- View all coordinators and their assigned zones

- Add / remove coordinator emails from the allowlist

- View basic stats per zone (member count, last rotation assigned)

**3.3 Zone Coordinator Dashboard**

**Landing View**

- Displays coordinator's name and the zone delivery address prominently

- Quick-glance summary: total members, upcoming assignments this week

- Sidebar navigation: Zone Members \| Rotations \| Notifications

**3.4 Zone Members**

- List view of all members in the zone with search/filter

- Add member: Name (required), Email (required), Phone Number (optional)

- Edit member details inline or via modal

- Delete member (with confirmation; removes them from future auto-assign
  but preserves historical records)

- Member status: Active / Inactive (inactive members are excluded from
  auto-assign)

**3.5 Rotations — Calendar View**

**Calendar Interface**

- Month view calendar showing assigned members per date

- Click any date to open an assignment panel

- Assignment panel: multi-select dropdown of zone members for that date

- Add or remove members from a date assignment

- Visual indicators on calendar days: color-coded by assignment status
  (assigned / unassigned / today)

**Send Reminder Button**

- Select a date range using a date-range picker

- Preview list of all members assigned in that range with their dates

- Send reminder emails to all those members in one click

- Confirmation toast showing how many emails were dispatched

**Auto Assign**

- Toggle switch to enable/disable Auto Assign mode

- Configure per-member assignment schedules independently

- Frequency options per member:

  - Every specific day(s) of the week (e.g. every Friday)

  - Once every N weeks (e.g. once every 2 weeks)

  - Once every N months

  - Custom: pick specific dates manually

- Set a start date and optional end date for the auto-assign window

- Preview auto-generated schedule before applying

- Apply generates assignments on the calendar (does not overwrite
  existing manual ones unless toggled)

**3.6 Notifications**

**Global Defaults**

- Set a default reminder profile that applies to all zone members

- Supports multiple reminder triggers per assignment:

  - X days before (e.g. 2 days before)

  - X hours before (e.g. 5 hours before)

  - Specific time on the day of (e.g. 7:00 AM on the day)

**Per-Member Overrides**

- Each member can have their own reminder schedule that overrides the
  global default

- Toggle per-member override on/off

- Same trigger options available at the member level

**Email Content**

- Reminder email includes: member name, assigned date, delivery address,
  coordinator contact info

- Branded with Mehdi Automates / zone name in the email header

**4. UX & UI Guidelines**

**4.1 Design Principles**

- Clean, modern SaaS aesthetic — not a generic template

- Mobile-responsive (coordinators may use phones on the go)

- Fast interactions — calendar loads without full page reload

- Minimal clicks to complete core tasks (assign, remind, add member)

**4.2 Branding**

- Product name: Thaali Rotation Manager

- Brand: Mehdi Automates (visible in header/footer and emails)

- Color palette: deep navy, warm accent, clean white backgrounds

- Typography: Inter or similar clean sans-serif

**5. Tech Stack**

**5.1 Stack Overview**

| **Layer** | **Technology** | **Rationale** |
|----|----|----|
| Frontend | Next.js 14 (App Router) | React-based, SSR support, API routes built-in, easy Vercel deploy |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI components with full customization |
| Auth | NextAuth.js v5 + Google OAuth | First-class Google OAuth, session management, easy allowlist middleware |
| Database | PostgreSQL (via Supabase) | Relational, well-suited for zones/members/rotations. Supabase gives free tier + realtime |
| ORM | Prisma | Type-safe DB queries, schema-first migrations, great DX |
| Email | Resend + React Email | Modern email API, React-based templates, generous free tier |
| Scheduling | Vercel Cron Jobs | Trigger reminder emails on a schedule without extra infra |
| Deployment | Vercel | Zero-config Next.js deployment, cron support, preview URLs |
| File Storage | Supabase Storage (if needed) | Avatars or exports if added later |

**5.2 Frontend Architecture**

**Next.js App Router Structure**

The app uses Next.js 14 App Router with route groups for clean
separation between auth, admin, and coordinator flows.

| **Route**                | **Description**                                |
|--------------------------|------------------------------------------------|
| /                        | Landing / login page (Google Sign In button)   |
| /auth/error              | Auth error page (email not allowlisted, etc.)  |
| /admin                   | Super Admin dashboard (protected)              |
| /admin/zones             | Zone management                                |
| /admin/zones/\[id\]      | Edit individual zone                           |
| /dashboard               | Zone Coordinator dashboard (scoped by session) |
| /dashboard/members       | Zone Members management                        |
| /dashboard/rotations     | Calendar rotation view                         |
| /dashboard/notifications | Notification settings                          |

**5.3 Database Schema**

**Core Tables**

| **Table** | **Key Fields** |
|----|----|
| zones | id, name, area, delivery_address, created_at |
| coordinators | id, zone_id (FK), name, email, created_at |
| members | id, zone_id (FK), name, email, phone, status (active/inactive), created_at |
| assignments | id, zone_id (FK), member_id (FK), assigned_date, created_by, created_at |
| notification_settings | id, zone_id (FK), member_id (FK, nullable), triggers (JSONB), is_default |
| reminder_logs | id, assignment_id (FK), sent_at, status (sent/failed) |
| auto_assign_rules | id, member_id (FK), frequency_type, frequency_value, days_of_week, start_date, end_date |

**5.4 Authentication Flow**

- User clicks 'Sign in with Google'

- NextAuth.js handles OAuth callback

- On signIn callback: query coordinators table for matching email

- If Super Admin email (env var): set role = 'admin' in session

- If found in coordinators: set role = 'coordinator', attach zone_id to
  session

- If not found: return false to block login, redirect to /auth/error

- Middleware protects /admin and /dashboard routes based on session role

**5.5 Email & Reminder System**

**Reminder Email Flow**

- Cron job runs every hour (Vercel Cron)

- Query assignments where assigned_date is upcoming and matching
  notification triggers

- For each assignment, check member's notification settings (or zone
  default)

- If trigger time matches: send email via Resend API

- Log send result in reminder_logs table

**Manual Send Reminder**

- Coordinator picks date range and clicks Send Reminder

- API route fetches all assignments in range with member emails

- Batch sends via Resend API

- Returns count of emails sent to the UI

**5.6 Auto Assign Logic**

- When coordinator saves Auto Assign rules, rules stored in
  auto_assign_rules table

- Preview endpoint: generates a dry-run list of dates for each member
  given their rule

- Apply endpoint: bulk-inserts into assignments table (skips dates
  already assigned)

- Frequency types supported: weekly_days (array of weekdays),
  every_n_weeks, every_n_months, custom_dates

**6. Development Phases**

| **Phase** | **Scope** | **Est. Effort** |
|----|----|----|
| Phase 1 — Foundation | Project setup, Auth (Google OAuth + allowlist), Super Admin zone & coordinator CRUD, DB schema + Prisma setup | ~1 week |
| Phase 2 — Coordinator Core | Coordinator dashboard, Zone Members CRUD, Rotations calendar view, manual assignment + removal | ~1.5 weeks |
| Phase 3 — Automation | Send Reminder (manual), Auto Assign logic + preview + apply, Notification settings (global + per-member) | ~1.5 weeks |
| Phase 4 — Polish | Email templates (React Email), responsive design pass, error handling, loading states, deployment to Vercel | ~1 week |
| Phase 5 — Hardening | Cron-based reminder system, reminder logs, edge case handling, testing | ~1 week |

**7. Open Questions & Decisions**

| **Question** | **Options** | **Recommended** |
|----|----|----|
| How many zones in v1? | Unlimited vs. capped at 20 | Unlimited (no perf risk at this scale) |
| Reminder email from address? | Resend domain vs. custom domain | Custom domain for brand trust |
| Time zone handling? | Single city TZ vs. per-zone TZ | Single configurable TZ in v1 (simpler) |
| Member import? | Manual only vs. CSV upload | Manual only in v1, CSV in v2 |
| Audit log? | Who assigned/changed what | Basic log in v2 (nice-to-have) |

**8. Future Enhancements (v2+)**

- Member self-service portal: members can view their schedule and
  confirm

- SMS reminders via Twilio

- PWA / mobile app wrapper

- CSV import for bulk member upload

- Swap requests: member requests to swap their turn with another member

- Analytics dashboard: attendance rates, most/least frequent volunteers

- Multi-city / multi-organization support

- WhatsApp notification channel via Twilio

**Appendix — Quick Reference**

**Environment Variables Required**

| **Variable** | **Purpose** |
|----|----|
| GOOGLE_CLIENT_ID | Google OAuth app client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth app client secret |
| NEXTAUTH_SECRET | NextAuth session encryption key |
| NEXTAUTH_URL | App base URL (e.g. https://thaali.vercel.app) |
| DATABASE_URL | Supabase PostgreSQL connection string |
| SUPER_ADMIN_EMAIL | Hardcoded super admin email (bypasses allowlist check) |
| RESEND_API_KEY | Resend email API key |
| FROM_EMAIL | Verified sender address for reminder emails |

**Key Dependencies**

| **Package**             | **Version** | **Purpose**                          |
|-------------------------|-------------|--------------------------------------|
| next                    | 14.x        | Full-stack React framework           |
| next-auth               | 5.x (beta)  | Authentication with Google OAuth     |
| @prisma/client          | 5.x         | Type-safe ORM for PostgreSQL         |
| resend                  | latest      | Email sending API                    |
| @react-email/components | latest      | React-based email templates          |
| react-big-calendar      | latest      | Calendar component for rotation view |
| date-fns                | latest      | Date manipulation utilities          |
| zod                     | latest      | Schema validation for API routes     |
| tailwindcss             | 3.x         | Utility-first CSS                    |
| shadcn/ui               | latest      | Accessible UI component library      |

**Mehdi Automates — Build. Automate. Ship.**

Document version 1.0 \| May 2026
