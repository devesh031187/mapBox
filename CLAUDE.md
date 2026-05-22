# CLAUDE.md — Hotel F&B Inventory Management System (HFIMS)

## Project Overview

HFIMS is a full-stack hotel Food & Beverage inventory and procurement management system. It covers the entire procurement lifecycle: Master Data → Purchase Requisitions → RFQ → Comparative Statements → Purchase Orders → Goods Receipt → Stock Operations → Finance → Vendor Analytics.

**Tech Stack:** React 18 + Vite · Express 4 · Prisma 5 · PostgreSQL · TypeScript (strict) · Tailwind CSS · TanStack Query · Zustand · Zod

**Current phase:** Phase 2 (Master Data) — items, categories, storage locations, vendors are fully implemented. Phases 3–13 (procurement workflows, approvals, finance, stock ops, recipes, reports) are specified in `docs/TECHNICAL_SPECIFICATION.md` but not yet coded.

---

## Repository Layout

```
mapBox/
├── backend/            Express + Prisma API
│   ├── src/
│   │   ├── app.ts              Express factory (middleware + route mount)
│   │   ├── index.ts            HTTP server entry point
│   │   ├── config/             env.ts · database.ts · logger.ts
│   │   ├── middleware/         authenticate · authorize · validate · errorHandler
│   │   ├── modules/            Domain modules (see pattern below)
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── categories/
│   │   │   ├── items/
│   │   │   ├── storage-locations/
│   │   │   ├── vendors/
│   │   │   ├── vendor-categories/
│   │   │   └── vendor-mappings/
│   │   ├── types/              express.d.ts (req.user augmentation)
│   │   └── utils/              responseBuilder.ts · pagination.ts
│   └── prisma/
│       ├── schema.prisma       Full DB schema (50+ tables)
│       ├── seed.ts             Admin user + reference data
│       └── migrations/
├── frontend/           React + Vite SPA
│   └── src/
│       ├── config/     api.ts (Axios instance + interceptors)
│       ├── router/     index.tsx · ProtectedRoute.tsx
│       ├── components/ layout/ (AppShell · Sidebar · Topbar) · ui/ (Button · Card · Input · Spinner)
│       ├── pages/      One folder per domain; List/Form/Detail per resource
│       ├── services/   One file per domain; typed Axios call wrappers
│       ├── hooks/      useAuth.ts · usePermissions.ts
│       ├── store/      authStore.ts (Zustand)
│       ├── lib/        queryClient.ts (TanStack Query config)
│       ├── types/      models.ts · enums.ts
│       └── utils/      permissions.ts
└── docs/
    └── TECHNICAL_SPECIFICATION.md   Full system spec (v1.1, 1186 lines)
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL running locally with database `hfims`, user `hfims`, password `hfims`

### Backend
```bash
cd backend
cp .env.example .env          # Edit secrets before running
npm install
npm run prisma:generate       # Generate Prisma client
npx prisma migrate dev        # Run migrations
npm run prisma:seed           # Seed admin user (admin@hotel.com / Admin@123)
npm run dev                   # Start on http://localhost:3000
```

### Frontend
```bash
cd frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev                   # Start on http://localhost:5173
```

### Key scripts
| Location | Command | Purpose |
|---|---|---|
| backend | `npm run dev` | tsx watch (hot reload) |
| backend | `npm run typecheck` | `tsc --noEmit` |
| backend | `npm run build` | Compile to `dist/` |
| backend | `npm run prisma:migrate` | Create + apply new migration |
| backend | `npm run prisma:seed` | Re-seed reference data |
| backend | `npm run db:reset` | Drop + re-migrate + re-seed (destructive) |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | `tsc -b && vite build` |
| frontend | `npm run lint` | `tsc --noEmit` |

---

## Backend Module Pattern

Every domain lives in `backend/src/modules/{domain}/` and contains exactly four files:

```
{domain}.router.ts      Route definitions + middleware composition
{domain}.controller.ts  Thin handlers — parse, call service, respond
{domain}.service.ts     Business logic + Prisma queries
{domain}.schema.ts      Zod schemas + inferred DTO types
```

### Router conventions
```typescript
const router = Router();
router.use(authenticate);                                      // all routes require auth
router.get("/", ctrl.list);                                   // open to all authenticated
router.post("/", authorize("ADMIN", "STORE_MANAGER"),         // role guard first
             validate({ body: createFooSchema }),             // then Zod validation
             ctrl.create);
export default router;
```

Import paths use `.js` extensions (NodeNext module resolution).

### Controller conventions
Controllers are thin — they parse inputs, call services, and respond. All errors are passed to `next(e)`.

```typescript
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await svc.createFoo(req.body, req.user!.id));
  } catch (e) { next(e); }
}
```

Response helpers from `utils/responseBuilder.ts`:
- `ok(res, data)` → `{ success: true, data }` with HTTP 200
- `created(res, data)` → `{ success: true, data }` with HTTP 201
- `fail(res, status, message, details?)` → `{ success: false, error: { message, details } }`

Never call `res.json()` directly in controllers.

### Service conventions
Services contain all business logic. They import the Prisma singleton from `config/database.ts` and throw `AppError` for domain errors.

```typescript
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function getFoo(id: string) {
  const foo = await prisma.foo.findUnique({ where: { id } });
  if (!foo) throw new AppError(404, "Foo not found");
  return foo;
}
```

### Schema conventions
Zod schemas live in the schema file; inferred types are exported as DTOs.

```typescript
export const createFooSchema = z.object({ ... });
export const updateFooSchema = createFooSchema.partial();
export type CreateFooDto = z.infer<typeof createFooSchema>;
```

Use `z.coerce.number()` / `z.coerce.boolean()` for query params (they arrive as strings).

### Registering a new module
1. Create the four files in `backend/src/modules/{domain}/`
2. Import the router in `backend/src/app.ts` and mount it under `/api/v1/{path}`

---

## Frontend Patterns

### API service layer
Every domain has a service file in `frontend/src/services/`. Services return typed data (not raw Axios responses).

```typescript
export const fooService = {
  list: (params?: ListFooParams) =>
    api.get<{ success: true; data: PagedResponse<Foo> }>('/foo', { params })
       .then(r => r.data.data),
  create: (data: Partial<Foo>) =>
    api.post<{ success: true; data: Foo }>('/foo', data).then(r => r.data.data),
};
```

### TanStack Query
Use `useQuery` for reads and `useMutation` for writes. Invalidate queries after mutations.

```typescript
const { data } = useQuery({ queryKey: ['foo', params], queryFn: () => fooService.list(params) });
const mutation = useMutation({
  mutationFn: fooService.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foo'] }),
});
```

### Forms
Use React Hook Form with the `zodResolver`:

```typescript
const { register, handleSubmit } = useForm<CreateFooDto>({
  resolver: zodResolver(createFooSchema),
});
```

### Pages
- **ListPage** — table/grid + filters + pagination + action buttons
- **FormPage** — create/edit form, shared between new and edit (detect by presence of `id` param)
- **DetailPage** — read-only detail view with related data

### Path aliases
`@/` maps to `frontend/src/`. Use it for all cross-folder imports.

```typescript
import { Button } from '@/components/ui/Button';
import { itemsService } from '@/services/items.service';
```

### Auth state
Auth state (access token, refresh token, user, role) lives in `authStore` (Zustand). Access it via the `useAuth` hook.

```typescript
const { user, role, isAuthenticated } = useAuth();
```

---

## Authorization

### Roles
`ADMIN` · `STORE_MANAGER` · `FB_MANAGER` · `FINANCE` · `GM_DIRECTOR`

### Backend
Apply the `authorize` middleware with the allowed roles:

```typescript
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate(...), ctrl.create);
```

### Frontend
Use `usePermissions` for conditional rendering:

```typescript
const { can } = usePermissions();
if (can('create:items')) { /* show button */ }
```

The permissions map is in `frontend/src/utils/permissions.ts`.

---

## Error Handling

The global error handler (`middleware/errorHandler.ts`) handles:

| Error type | HTTP status | Trigger |
|---|---|---|
| `AppError` | `err.status` | Throw `new AppError(404, "Not found")` |
| `ZodError` | 422 | Validation middleware or schema.parse() |
| `PrismaClientKnownRequestError` P2002 | 409 | Unique constraint violation |
| `PrismaClientKnownRequestError` P2025 | 404 | Record not found |
| Unknown | 500 | Anything else |

Never send error responses manually from controllers — throw `AppError` or let Prisma/Zod errors propagate to `next(e)`.

---

## Database Conventions

### Schema
Full schema is in `backend/prisma/schema.prisma`. Key design decisions:
- UUID primary keys on all tables (`@default(uuid())`)
- Soft deletes via `status` fields (`ACTIVE`/`INACTIVE`/`DISCONTINUED`) — **never hard-delete**
- Immutable append-only tables: `ItemStockLedger`, `PriceHistory`, `ApprovalRecord`, `VendorPerformanceRecord`
- `created_by` / `approved_by` stored as plain UUID scalars (not Prisma relations) to avoid relation explosion
- Multi-outlet support via `outletId` on relevant tables
- `@map` decorators keep Prisma field names camelCase while DB columns are snake_case

### Migrations
```bash
# After editing schema.prisma:
npm run prisma:migrate        # Generates migration file + applies it
# For production:
npm run prisma:deploy         # Apply pending migrations only (no generation)
```

### Stock mutations
**Stock only moves through GRN posting.** Do not update `Item.currentStock` directly. All stock changes write an `ItemStockLedger` row and then update `currentStock` / `averageCost` on the item.

---

## API Conventions

- Base URL: `/api/v1`
- All endpoints return `{ success: true, data: ... }` or `{ success: false, error: { message, details } }`
- Paginated responses return `{ items, total, page, limit, totalPages }`
- Timestamps are ISO 8601 strings
- UUIDs used for all IDs
- Query filters use camelCase params: `?categoryId=...&storageLocationId=...&status=ACTIVE`
- `itemCode` fields auto-uppercased in Zod schema (`.toUpperCase()`)
- All routes protected by `authenticate` middleware; no public routes except `/health` and `/api/v1/auth/login`

### Existing endpoints
```
GET  /health
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/users               ADMIN only
POST /api/v1/users               ADMIN
GET  /api/v1/categories          authenticated
POST /api/v1/categories          ADMIN, STORE_MANAGER
GET  /api/v1/storage-locations   authenticated
POST /api/v1/storage-locations   ADMIN, STORE_MANAGER
GET  /api/v1/items               authenticated
GET  /api/v1/items/below-reorder authenticated
GET  /api/v1/items/:id           authenticated
GET  /api/v1/items/:id/stock-ledger authenticated
POST /api/v1/items               ADMIN, STORE_MANAGER
PUT  /api/v1/items/:id           ADMIN, STORE_MANAGER
GET  /api/v1/vendor-categories   authenticated
POST /api/v1/vendor-categories   ADMIN
GET  /api/v1/vendors             authenticated
POST /api/v1/vendors             ADMIN, STORE_MANAGER
PUT  /api/v1/vendors/:id         ADMIN, STORE_MANAGER
GET  /api/v1/vendor-mappings     authenticated
POST /api/v1/vendor-mappings     ADMIN, STORE_MANAGER
```

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://hfims:hfims@localhost:5432/hfims?schema=public
NODE_ENV=development
PORT=3000
JWT_SECRET=<256-bit secret>
JWT_REFRESH_SECRET=<different 256-bit secret>
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
SEED_ADMIN_EMAIL=admin@hotel.com
SEED_ADMIN_PASSWORD=Admin@123
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Code Style

- **TypeScript strict mode** on both sides — no `any`, no unused locals/params
- ESM throughout; backend uses `.js` import extensions (NodeNext resolution)
- Zod for all validation; never trust unvalidated input from `req.body`, `req.query`, or `req.params`
- `Partial<Schema>` for update schemas — `createSchema.partial()` is the pattern
- No comments unless the "why" is non-obvious
- No `console.log` — use the Winston `logger` on the backend
- Frontend components use named exports, not default exports (except pages and the router)
- Tailwind CSS only — no inline styles, no CSS modules

---

## What's Next (Phase 3+)

Refer to `docs/TECHNICAL_SPECIFICATION.md` for the full spec. Implementation order:

| Phase | Feature |
|---|---|
| 3 | Purchase Requisitions (PR) |
| 4 | RFQ + Quotation management |
| 5 | Comparative Statement + PO |
| 6 | GRN + multi-tier approval engine |
| 7 | Stock Ops (issuance, transfer, count, wastage) |
| 8 | Batch/expiry tracking (FEFO) |
| 9 | Vendor invoicing + 3-way match + payments |
| 10 | Rate contracts + standing orders |
| 11 | Recipe/BOM costing |
| 12 | Reports & analytics (14 report types) |
| 13 | System config (UOM master, tax, number series, financial years) |

When adding a new module: add the Prisma model (if not already in schema), create the four backend files, register the router in `app.ts`, add the service file and page components on the frontend, and add routes to `frontend/src/router/index.tsx`.

---

## Testing

No test suite exists yet. When adding tests:
- Backend: Jest + Supertest, place test files alongside source as `*.test.ts`
- Frontend: Vitest + React Testing Library, place as `*.test.tsx`
- Use a separate `hfims_test` database for integration tests

---

## Seed Data

`npm run prisma:seed` in the backend directory creates:
- Admin user: `admin@hotel.com` / `Admin@123`
- Base item categories and vendor categories (if seeded)

After `db:reset`, always re-run the seed.
