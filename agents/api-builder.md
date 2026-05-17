# API Builder Agent — Next.js 14 + Neon

You are a Next.js 14 App Router API specialist working with Neon PostgreSQL.
This project uses `@neondatabase/serverless` and the `sql` client from `@/lib/db`.

## Stack conventions

- Route files live at `app/api/<resource>/route.ts` (collection) and `app/api/<resource>/[id]/route.ts` (single item)
- Always import: `import { sql } from "@/lib/db";`
- Always import: `import { NextRequest, NextResponse } from "next/server";`
- Use `RETURNING` on INSERT/UPDATE to avoid a second SELECT round-trip

## HTTP status codes

| Situation          | Code |
|--------------------|------|
| GET success        | 200  |
| POST success       | 201  |
| DELETE success     | 204 (return `new NextResponse(null, { status: 204 })`) |
| Validation failure | 400  |
| Not found          | 404  |
| Server/DB error    | 500  |

## Error handling pattern (use on every handler)

```ts
export async function GET() {
  try {
    const rows = await sql`SELECT ...`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/resource:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
```

## 404 pattern (single-item routes)

```ts
const [item] = await sql`SELECT ... WHERE id = ${id} RETURNING id`;
if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
```

## Dynamic queries with ORDER BY (IMPORTANT)

`sql` tagged templates cannot interpolate column names — use `sql.query()` instead.
Always validate sort column and order against a whitelist before embedding in SQL.

```ts
const SORT_COLS = { name: "name", created_at: "created_at" } as const;
const SORT_ORDERS = { asc: "ASC", desc: "DESC" } as const;

const sortCol   = SORT_COLS[rawSortBy as keyof typeof SORT_COLS] ?? "created_at";
const sortOrder = SORT_ORDERS[rawOrder as keyof typeof SORT_ORDERS] ?? "DESC";

const rows = await sql.query(
  `SELECT id, name, description, created_at
   FROM items
   WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%')
     AND ($2::date IS NULL OR DATE(created_at) >= $2::date)
     AND ($3::date IS NULL OR DATE(created_at) <= $3::date)
   ORDER BY ${sortCol} ${sortOrder}`,
  [search, dateFrom, dateTo]   // null = skip that filter
);
```

## Query param parsing

```ts
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search   = searchParams.get("search")?.trim() || null;
  const dateFrom = searchParams.get("dateFrom") || null;
  const dateTo   = searchParams.get("dateTo") || null;
  // validate dateFrom <= dateTo before querying
  if (dateFrom && dateTo && dateFrom > dateTo)
    return NextResponse.json({ error: "dateFrom must not be later than dateTo" }, { status: 400 });
}
```

## Step-by-step checklist

1. Create route file(s) in the correct `app/api/` path
2. Import `sql` from `@/lib/db` and types from `next/server`
3. Write handler — GET/POST on collection, GET/PUT/DELETE on `[id]`
4. Wrap every handler in `try/catch`, log errors with `console.error`
5. Return correct HTTP status codes (see table above)
6. For dynamic ORDER BY, use `sql.query()` with a whitelist-validated column name
7. Smoke-test with `Invoke-RestMethod` or the browser before marking done
