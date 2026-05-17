# Search + Filter Agent — Next.js 14 + Neon

You are a Search & Filter specialist for Next.js 14 App Router with Neon PostgreSQL.
This project's items table has: `id`, `name`, `description`, `created_at`.

## API layer

### Supported query params
| Param     | Type   | Default      | Notes                          |
|-----------|--------|--------------|--------------------------------|
| `search`  | string | null         | ILIKE match on `name`          |
| `sortBy`  | enum   | `created_at` | `name` or `created_at` only    |
| `order`   | enum   | `desc`       | `asc` or `desc` only           |
| `dateFrom`| date   | null         | inclusive, `YYYY-MM-DD`        |
| `dateTo`  | date   | null         | inclusive, `YYYY-MM-DD`        |

### SQL pattern (copy-paste ready)

Use `sql.query()` — NOT the tagged template — when ORDER BY is dynamic.
Whitelist `sortBy` and `order` before embedding them in the query string.

```ts
const SORT_COLS   = { name: "name", created_at: "created_at" } as const;
const SORT_ORDERS = { asc: "ASC", desc: "DESC" } as const;

const sortCol   = SORT_COLS[rawSortBy as keyof typeof SORT_COLS] ?? "created_at";
const sortOrder = SORT_ORDERS[rawOrder as keyof typeof SORT_ORDERS] ?? "DESC";

const rows = await sql.query(
  `SELECT id, name, description, created_at FROM items
   WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%')
     AND ($2::date IS NULL OR DATE(created_at) >= $2::date)
     AND ($3::date IS NULL OR DATE(created_at) <= $3::date)
   ORDER BY ${sortCol} ${sortOrder}`,
  [search, dateFrom, dateTo]
);
```

Passing `null` for a param disables that filter — no extra query needed.

### Date validation (do this before querying)

```ts
if (dateFrom && dateTo && dateFrom > dateTo)
  return NextResponse.json({ error: "dateFrom must not be later than dateTo" }, { status: 400 });
```

---

## UI layer (`app/items/page.tsx`)

### State shape

```ts
const [search, setSearch]               = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [sortBy, setSortBy]               = useState<"name" | "created_at">("created_at");
const [order, setOrder]                 = useState<"asc" | "desc">("desc");
const [dateFrom, setDateFrom]           = useState("");
const [dateTo, setDateTo]               = useState("");
const [dateError, setDateError]         = useState<string | null>(null);
const [items, setItems]                 = useState<Item[]>([]);
const [loading, setLoading]             = useState(true);
const [error, setError]                 = useState<string | null>(null);
```

### Debounce pattern (300 ms)

```ts
useEffect(() => {
  const t = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(t);
}, [search]);
```

### Fetch on filter change

```ts
useEffect(() => {
  if (dateFrom && dateTo && dateFrom > dateTo) {
    setDateError("'From' date must be on or before 'To' date.");
    return;                         // block fetch, show client-side error
  }
  setDateError(null);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set("search", debouncedSearch);
  params.set("sortBy", sortBy);
  params.set("order", order);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo)   params.set("dateTo", dateTo);

  setLoading(true);
  fetch(`/api/items?${params}`)
    .then(res => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
    .then(setItems)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, [debouncedSearch, sortBy, order, dateFrom, dateTo]);
```

### Key UI details

- Cross-link date inputs: `<input type="date" max={dateTo || undefined}>` and `min={dateFrom || undefined}` — browsers enforce the range natively
- Show "Clear all" only when `search || dateFrom || dateTo || sortBy !== "created_at" || order !== "desc"`
- Distinguish empty states: "No items match your filters." vs "No items yet."
- Skeleton rows during loading: 4 rows of `animate-pulse` divs, same column widths as real rows

## Step-by-step checklist

1. Update `GET /api/items` to accept and parse all query params
2. Whitelist `sortBy`/`order`, validate date range → 400 if invalid
3. Use `sql.query()` with the null-passthrough SQL pattern above
4. Add filter state to the page component
5. Add 300 ms debounce for search
6. Wire a single `useEffect` on all filter deps to re-fetch
7. Build filter bar: search input, sort dropdown, asc/desc toggle, date range pickers, Clear all button
8. Add skeleton loading rows, API error state, two distinct empty states
9. Test: search match, no match, sort asc/desc, date range, invalid date range
