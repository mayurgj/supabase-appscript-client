# Supabase Apps Script Library

A production-ready Google Apps Script library for integrating Supabase (REST/PostgREST) with full CRUD, RPC, raw SQL via functions, multi-schema support, and structured error handling.

---

## ✅ Features

- **Full CRUD operations** using Supabase REST API
- **Raw SQL support** via RPC function (safe approach)
- **Multi-schema access** through Accept-Profile and Content-Profile headers
- **TypeScript-like structured output** (`{ data, error, status, statusText }`)
- **Secure authentication** using anon or publishable keys only
- **Error handling** with Supabase error codes and unified response
- **RLS Policy ready** — respects Supabase Row-Level Security

---

## Repository layout (for reference)

```
supabase-appscript-client/
├── README.md                      # this file (plaintext)
├── examples/
│   ├── ExampleCRUD.gs             # CRUD usage examples
│   ├── ExampleRPC.gs              # RPC usage examples
│   └── ExampleRawSQL.gs           # Raw SQL via RPC examples
├── tests/
│   ├── test_basic.gs              # basic CRUD tests
│   └── test_error_handling.gs     # error handling tests
├── .gitignore
└── LICENSE
```

---

## 🚀 Getting Started

### 1. Add to Apps Script via Library

Add via Apps Script Libraries using the following Library ID:

```
10TGg6EEQ4K894duUiKGGYp-aVcgct5n1gJSeFiXUGL-QkyqzVDSpovMZ
```

**Steps**
1. Open your Apps Script project.
2. Open the left-side menu `Libraries` or go to `Project settings` → `Libraries`.
3. Paste the Library ID above and add the library.
4. Choose the latest version and save.

Reference: https://developers.google.com/apps-script/guides/libraries

### 2. Initialize Client

```javascript
const SUPABASE_URL = 'https://<project>.supabase.co';
const SUPABASE_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON');
const sb = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY, { schema: 'public' });
```

### 3. Example CRUD Operations

#### SELECT
```javascript
const res = sb.select('users', '*', { filters: 'id=eq.1' });
if (res.error) Logger.log(res.error);
else Logger.log(res.data);
```

#### INSERT
```javascript
const res = sb.insert('profiles', { id: 'uuid', full_name: 'Mayur' });
```

#### UPDATE
```javascript
const res = sb.update('profiles', { full_name: 'Mayur Updated' }, 'id=eq.123');
```

#### DELETE
```javascript
const res = sb.delete('profiles', 'id=eq.123');
```

---

## ⚙️ RPC Functions (Postgres Functions)

Use Supabase RPC to execute Postgres functions securely.

```javascript
const rpcRes = sb.rpc('increment_counter', { step: 5 });
```

### Raw SQL via RPC Wrapper

Supabase does **not** expose direct SQL execution. Use a safe RPC wrapper:

#### Example SQL RPC Function (Postgres)
```sql
create or replace function api.execute_sql(sql text)
returns json as $$
  execute sql;
$$ language plpgsql security definer;
```

#### Apps Script Usage
```javascript
const sql = 'SELECT * FROM profiles WHERE active = true;';
const res = sb.executeRaw(sql);
```

⚠️ **Warning:** Exposing `execute_sql` to anon users is unsafe. Restrict with RLS or use a service key only on trusted servers.

---

## 🧩 Multi-Schema Support

You can access non-`public` schemas using headers:

```javascript
const sbPrivate = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY, { schema: 'analytics' });
const res = sbPrivate.select('user_stats', '*');
```

Ensure the schema is **exposed** in your Supabase project and the anon role has **USAGE** permissions.

```sql
grant usage on schema analytics to anon;
```

---

## 🧱 Structured Response Format

Each method returns a normalized object:

```javascript
{
  data: <JSON>,
  error: { message, code, hint } | null,
  status: <number>,
  statusText: <string>,
  raw: <original response>
}
```

Example:
```javascript
const res = sb.select('tasks');
if (res.error) Logger.log(res.error.message);
else Logger.log(res.data);
```

---

## 🔒 Security Notes

- Never expose **service_role** keys in Apps Script or client code.
- Use **anon** or **publishable** keys only.
- Always enable **RLS** policies on your tables.
- Consider using **Edge Functions** for privileged logic.

---

## ⚠️ Limitations

- Apps Script cannot open WebSocket connections → no real-time subscriptions.
- Raw SQL must go through a secure RPC function.
- File uploads must use Supabase Storage REST API directly.

---

## 🧠 Advanced Features

### Upsert Example
```javascript
const res = sb.insert('profiles', { id: 'uuid', full_name: 'Mayur' }, { upsert: true, onConflict: 'id' });
```

### Pagination
```javascript
const res = sb.select('posts', '*', { filters: 'order=created_at.desc&limit=10' });
```

### Custom Schema per Request
```javascript
const res = sb.select('metrics', '*', { schema: 'analytics' });
```

---

## 🧾 Error Handling

Use `.parseError()` to normalize Supabase errors:

```javascript
const res = sb.insert('users', {});
const err = sb.parseError(res);
if (err) Logger.log(`Error ${err.code}: ${err.message}`);
```

Typical error codes:
| Code | Meaning |
|------|----------|
| 23505 | Unique constraint violation |
| 23503 | Foreign key violation |
| PGRST301 | Schema not accessible |
| 404 | Table or route not found |

---

## 🧰 Apps Script Best Practices

1. Store API keys in Script or User Properties:
```javascript
PropertiesService.getScriptProperties().setProperty('SUPABASE_ANON', '<anon-key>');
```
2. Log errors, not raw responses.
3. Use batch operations carefully to avoid rate limits.
4. Prefer lightweight select queries (`limit`, `order`).

---

## 📚 References

- [Supabase REST API (PostgREST)](https://supabase.com/docs/guides/api)
- [Supabase RPC Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Google Apps Script UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)

---

## 🧩 License
MIT License — use freely with credit.

---

## 📦 Version
**v1.0.0** — Stable Production Release
