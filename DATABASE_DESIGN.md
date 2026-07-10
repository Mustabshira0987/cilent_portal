# Client Portal Lite — Database Design & Tech Stack

---

## 1. Recommended Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS | Already in use, fast HMR, utility-first styling |
| Backend | Node.js + Express (TypeScript) | Lightweight REST API, easy Supabase integration |
| Database | Supabase (PostgreSQL) | Relational, real-time subscriptions, built-in auth |
| Authentication | Supabase Auth | JWT-based, supports email/password + OAuth |
| File Storage | Supabase Storage | S3-compatible buckets, signed URLs for secure downloads |
| Charts | Recharts | React-native, composable, works with Tailwind |
| AI Assistant | Google Gemini 2.0 Flash | Already integrated via @google/genai |
| Deployment | Vercel (frontend) + Render (backend) | Free tiers, auto-deploy from GitHub |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                             │
│   React + Vite + Tailwind CSS + Recharts + Gemini AI        │
│   (Vercel CDN)                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST / Supabase Realtime
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌─────────────────┐              ┌──────────────────────┐
│  Node.js +      │              │   Supabase Platform  │
│  Express API    │◄────────────►│                      │
│  (Render)       │              │  ┌────────────────┐  │
│                 │              │  │  PostgreSQL DB  │  │
│  - Auth guard   │              │  │  (RLS Policies)│  │
│  - File upload  │              │  └────────────────┘  │
│  - Notifications│              │  ┌────────────────┐  │
│  - AI context   │              │  │  Supabase Auth │  │
└─────────────────┘              │  └────────────────┘  │
                                 │  ┌────────────────┐  │
                                 │  │  File Storage  │  │
                                 │  │  (Buckets)     │  │
                                 │  └────────────────┘  │
                                 └──────────────────────┘
```

---

## 3. Database Schema (PostgreSQL / Supabase)

### Table 1 — `users`
Managed by Supabase Auth. Extended with a public profile table.

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('agency', 'client')),
  avatar_url  TEXT,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- belongs to one `company`
- can be assigned to many `projects` via `project_members`

---

### Table 2 — `companies`
Represents both agency companies and client companies.

```sql
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('agency', 'client')),
  email        TEXT,
  website      TEXT,
  phone        TEXT,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- has many `users`
- agency company has many `projects`
- client company is referenced by many `projects`

---

### Table 3 — `projects`
Core entity. Each project is a workspace between an agency and a client.

```sql
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  agency_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_name     TEXT NOT NULL,
  client_email    TEXT NOT NULL,
  deadline        DATE NOT NULL,
  priority        TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status          TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold'))
                  DEFAULT 'active',
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- belongs to one `companies` (agency)
- has many `project_members`
- has many `milestones`
- has many `deliverables`
- has many `comments` (polymorphic via `entity_type = 'project'`)
- has many `activities`
- has many `notifications`

---

### Table 4 — `project_members`
Junction table — which team members (users) are assigned to which project.

```sql
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);
```

**Relationships:**
- links `projects` ↔ `users` (many-to-many)

---

### Table 5 — `milestones`
Tracks individual checkpoints within a project timeline.

```sql
CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  due_date    DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed'))
              DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- belongs to one `project`

---

### Table 6 — `deliverables`
Files and assets uploaded by the agency for client review and approval.

```sql
CREATE TABLE deliverables (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name        TEXT NOT NULL,
  version          TEXT NOT NULL DEFAULT 'v1.0',
  file_size        TEXT,
  storage_path     TEXT,
  download_url     TEXT,
  status           TEXT NOT NULL CHECK (status IN ('pending', 'review', 'approved', 'rejected'))
                   DEFAULT 'review',
  approval_status  TEXT NOT NULL CHECK (approval_status IN ('Pending', 'Approved', 'Changes Requested'))
                   DEFAULT 'Pending',
  uploaded_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- belongs to one `project`
- uploaded by one `user`
- has many `comments` (polymorphic via `entity_type = 'deliverable'`)

---

### Table 7 — `comments`
Polymorphic comments — can belong to a project discussion board OR a deliverable thread.

```sql
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('project', 'deliverable')),
  entity_id    UUID NOT NULL,
  author_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by entity
CREATE INDEX idx_comments_entity ON comments (entity_type, entity_id);
```

**Relationships:**
- belongs to one `user` (author)
- polymorphically belongs to `projects` or `deliverables`

---

### Table 8 — `activities`
Immutable audit log of all workspace events.

```sql
CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('project', 'deliverable', 'comment', 'approval', 'system')),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name   TEXT,
  actor_role   TEXT CHECK (actor_role IN ('agency', 'client')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_project ON activities (project_id, created_at DESC);
```

**Relationships:**
- belongs to one `project`
- triggered by one `user`

---

### Table 9 — `notifications`
Per-user inbox. Each event fans out to relevant users.

```sql
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('update', 'message', 'alert')),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, read, created_at DESC);
```

**Relationships:**
- belongs to one `user` (recipient)
- optionally linked to one `project`

---

## 4. Entity Relationship Diagram (ERD)

```
companies
  │
  ├──< users (company_id)
  │       │
  │       ├──< project_members >──┐
  │       ├──< comments           │
  │       ├──< activities         │
  │       └──< notifications      │
  │                               │
  └──< projects (agency_id) <─────┘
          │
          ├──< milestones
          ├──< deliverables
          │       └──< comments (entity_type='deliverable')
          ├──< comments (entity_type='project')
          ├──< activities
          └──< notifications
```

---

## 5. Supabase Row Level Security (RLS) Policies

RLS ensures users only see data they are authorized to access.

```sql
-- Projects: agency sees all their projects, client sees only their assigned ones
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_access_projects" ON projects
  FOR ALL USING (
    agency_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "client_access_projects" ON projects
  FOR SELECT USING (
    client_email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Notifications: users only see their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Comments: visible to project members only
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_member_comments" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.user_id = auth.uid()
        AND pm.project_id = comments.entity_id
    )
  );
```

---

## 6. Supabase Storage Buckets

```
supabase-storage/
├── deliverables/          ← project files (PDFs, PNGs, Figma exports)
│   └── {project_id}/
│       └── {deliverable_id}/{filename}
└── avatars/               ← user profile pictures
    └── {user_id}/avatar
```

**Bucket Policy (deliverables):**
- Upload: authenticated agency users only
- Download: authenticated users who are project members (signed URL, 1hr expiry)

---

## 7. API Endpoints (Express Backend)

### Auth
```
POST   /api/auth/register        — create user + company
POST   /api/auth/login           — Supabase Auth sign-in
POST   /api/auth/logout
```

### Projects
```
GET    /api/projects             — list all (filtered by role)
POST   /api/projects             — create project (agency only)
GET    /api/projects/:id         — get single project with members, milestones
PATCH  /api/projects/:id         — update progress, status, priority
DELETE /api/projects/:id         — delete project (agency only)
```

### Milestones
```
POST   /api/projects/:id/milestones          — add milestone
PATCH  /api/projects/:id/milestones/:mid     — toggle status
DELETE /api/projects/:id/milestones/:mid     — remove milestone
```

### Deliverables
```
GET    /api/deliverables                     — list (filtered by project)
POST   /api/deliverables                     — upload metadata + file to Storage
PATCH  /api/deliverables/:id/status          — approve / reject
GET    /api/deliverables/:id/download        — generate signed URL
```

### Comments
```
GET    /api/comments?entity_type=&entity_id= — fetch thread
POST   /api/comments                         — post comment
```

### Notifications
```
GET    /api/notifications        — get user inbox
PATCH  /api/notifications/read   — mark all as read
```

### Activities
```
GET    /api/activities?project_id= — get project activity log
```

---

## 8. Realtime Subscriptions (Supabase)

Replace polling with live push updates using Supabase Realtime channels.

```typescript
// Frontend: subscribe to new notifications for current user
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${currentUserId}`,
  }, (payload) => {
    addNotification(payload.new);
  })
  .subscribe();

// Frontend: subscribe to deliverable status changes on a project
const deliverableChannel = supabase
  .channel('deliverables')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'deliverables',
    filter: `project_id=eq.${projectId}`,
  }, (payload) => {
    updateDeliverable(payload.new);
  })
  .subscribe();
```

---

## 9. Migration from localStorage → Supabase

| Current (localStorage) | New (Supabase) |
|---|---|
| `cpl_projects` | `projects` table |
| `cpl_deliverables` | `deliverables` table |
| `cpl_activities` | `activities` table |
| `cpl_notifications` | `notifications` table |
| `cpl_profile` | `companies` + `users` tables |
| `cpl_role` | `users.role` column (from JWT) |
| File name strings | `supabase.storage` signed URLs |
| Hardcoded team members | `users` + `project_members` tables |

---

## 10. Environment Variables

### Frontend `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=https://your-backend.onrender.com
```

### Backend `.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
GEMINI_API_KEY=your_gemini_api_key
```

---

## 11. Deployment Checklist

```
Frontend (Vercel)
  ✓ Connect GitHub repo
  ✓ Set VITE_* environment variables in Vercel dashboard
  ✓ Build command: npm run build
  ✓ Output directory: dist

Backend (Render)
  ✓ Connect GitHub repo
  ✓ Set environment variables in Render dashboard
  ✓ Start command: node dist/server.js
  ✓ Enable auto-deploy on push to main

Supabase
  ✓ Run all SQL migrations in order
  ✓ Enable RLS on all tables
  ✓ Create storage buckets: deliverables, avatars
  ✓ Set bucket policies (authenticated read/write)
  ✓ Enable Realtime on: notifications, deliverables, comments
```

---

## 12. Folder Structure (Full Stack)

```
client-portal-lite/
├── frontend/                        ← React + Vite (current codebase)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiAssistant.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── context/
│   │   │   └── PortalContext.tsx    ← replace with Supabase hooks
│   │   ├── hooks/
│   │   │   ├── useProjects.ts       ← NEW: Supabase data hooks
│   │   │   ├── useDeliverables.ts
│   │   │   └── useNotifications.ts
│   │   ├── lib/
│   │   │   └── supabase.ts          ← NEW: Supabase client init
│   │   ├── pages/
│   │   └── types.ts
│   └── .env.local
│
├── backend/                         ← NEW: Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── deliverables.ts
│   │   │   ├── comments.ts
│   │   │   ├── notifications.ts
│   │   │   └── auth.ts
│   │   ├── middleware/
│   │   │   └── authGuard.ts
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   └── server.ts
│   └── .env
│
└── supabase/
    └── migrations/
        ├── 001_companies.sql
        ├── 002_users.sql
        ├── 003_projects.sql
        ├── 004_project_members.sql
        ├── 005_milestones.sql
        ├── 006_deliverables.sql
        ├── 007_comments.sql
        ├── 008_activities.sql
        ├── 009_notifications.sql
        └── 010_rls_policies.sql
```
