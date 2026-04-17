# Feature: Neon + Drizzle Setup

**Phase:** 1 — Foundation  
**Feature ID:** P1-F2  
**Status:** Ready for Implementation  
**Priority:** Critical (blocking — all data features depend on this)

---

## 1) Overview

This feature configures Neon PostgreSQL as the database and sets up Drizzle ORM for type-safe database access. It establishes the database connection, configures the Drizzle client, and prepares the project for schema definition and migrations.

---

## 2) Scope

### In Scope
- get latest docs by using context 7 mcp
- Install Drizzle ORM and Drizzle Kit dependencies
- Install Neon serverless driver
- Create database client with connection pooling
- Configure Drizzle Kit (`drizzle.config.ts`)
- Set up environment variables for database URLs
- Create placeholder schema file
- Test database connection

### Out of Scope
- Schema definition (covered in P1-F3)
- Migrations (covered in P1-F3)
- Better Auth integration (covered in P1-F4)
- Query helpers (covered in subsequent features)

---

## 3) User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | Developer | Connect to Neon PostgreSQL | Application can persist data |
| US-2 | Developer | Use Drizzle ORM | Database queries are type-safe |
| US-3 | Developer | Have separate pooled and direct connections | Queries are fast and migrations work correctly |

---

## 4) Technical Requirements

### 4.1 Dependencies

```bash
npm install drizzle-orm
npm install @neondatabase/serverless
npm install -D drizzle-kit
```

### 4.2 Environment Variables

Update `.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **Note:** 
> - `DATABASE_URL` — Pooled connection (for queries in serverless)
> - `DATABASE_URL_UNPOOLED` — Direct connection (for migrations)

### 4.3 Drizzle Configuration

Create `drizzle.config.ts`:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
  verbose: true,
  strict: true,
});
```

### 4.4 Database Client

Create `lib/db/index.ts`:

```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
```

Alternative for HTTP mode (serverless edge):

```typescript
// lib/db/index.ts (HTTP mode for edge)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
```

### 4.5 Placeholder Schema

Create `lib/db/schema.ts`:

```typescript
// lib/db/schema.ts
// Placeholder - schema will be defined in P1-F3

// Better Auth tables will be generated here
// Application tables (tasks, categories, preferences) will be added here

export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.6 Connection Test (Optional)

Create a simple script to verify connection:

```typescript
// scripts/test-db.ts
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
```

---

## 5) Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1 | Drizzle ORM and dependencies installed | `package.json` shows drizzle-orm, @neondatabase/serverless |
| AC-2 | Drizzle Kit installed as dev dependency | `package.json` shows drizzle-kit |
| AC-3 | Database client connects to Neon | Connection test passes or query works |
| AC-4 | Drizzle config points to correct schema path | `drizzle.config.ts` exists with valid config |
| AC-5 | Placeholder schema file exists | `lib/db/schema.ts` exists |
| AC-6 | Environment variables documented | `.env.example` has DATABASE_URL entries |

---

## 6) File Checklist

### Must Create
- [ ] `lib/db/index.ts` — Database client
- [ ] `lib/db/schema.ts` — Placeholder schema
- [ ] `drizzle.config.ts` — Drizzle Kit configuration
- [ ] `scripts/test-db.ts` — Connection test (optional)

### Must Update
- [ ] `.env.example` — Add database URLs
- [ ] `.env.local` — Add actual Neon credentials
- [ ] `package.json` — Add dependencies and scripts

---

## 7) Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 8) Version-Sensitive Checklist

| Check | Requirement | Status |
|-------|-------------|--------|
| V-1 | Use `dialect: 'postgresql'` in drizzle.config.ts | ☐ |
| V-2 | Use Neon serverless driver (`@neondatabase/serverless`) | ☐ |
| V-3 | Use unpooleed URL for migrations in drizzle.config.ts | ☐ |
| V-4 | Use `defineConfig` from `drizzle-kit` | ☐ |

---

## 9) Dependencies

This feature requires:
- **P1-F1:** Project Initialization (complete)

This feature blocks:
- **P1-F3:** Schema Generation & Migration
- **P1-F4:** Better Auth Configuration
- **All features requiring database access**

---

## 10) Neon Setup Guide

### Create Neon Project

1. Go to https://neon.tech
2. Create a new project
3. Copy connection strings:
   - Pooled connection (Dashboard → Connection Details)
   - Direct connection (add `?sslmode=require` if needed)

### Local Development

1. Add `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to `.env.local`
2. Never commit actual credentials (`.env.local` is gitignored)

---

## 11) Commands Reference

```bash
# Install dependencies
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Test connection
npx tsx scripts/test-db.ts

# Open Drizzle Studio (visual database browser)
npm run db:studio

# Generate migrations (after schema defined in P1-F3)
npm run db:generate

# Run migrations
npm run db:migrate
```

---

## 12) Notes

- Use `db:push` only for rapid prototyping, not production
- Use `db:generate` + `db:migrate` for proper migration history
- The schema file is a placeholder — actual tables defined in P1-F3

---

*This feature establishes the database connection. Schema definition (P1-F3) and Better Auth integration (P1-F4) follow.*