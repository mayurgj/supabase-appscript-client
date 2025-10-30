# ⚡ Supabase Apps Script Client Library

A lightweight, server-side Google Apps Script library for interacting with a Supabase backend.  
It provides a simple client interface to perform **CRUD (Create, Read, Update, Delete)** operations, call **RPC (Postgres functions)**, and execute **Raw SQL** queries.

---

## 📖 Description

This project provides a simple wrapper for the **Supabase REST API**, specifically tailored for the **Google Apps Script (UrlFetchApp)** environment.

It enables server-side interactions between Google Workspace products (like **Sheets**, **Docs**, and **Forms**) and a Supabase database.  
Designed for use with your **Supabase service_role key**, which bypasses Row Level Security (RLS) — ideal for:

- Building internal administrative tools  
- Syncing data from Google Sheets to Supabase  
- Triggering backend logic from Workspace events  
- Automating workflows without a separate server  

---

## ✨ Features

- **Simple CRUD Methods** – clean functions for select, insert, update, and delete  
- **Full PostgREST Support** – filtering, ordering, and selecting data  
- **RPC (Remote Procedure Calls)** – call custom Postgres functions  
- **Raw SQL Execution** – securely execute SQL queries via RPC  
- **Service Role Authentication** – secure, server-side usage  
- **Standardized Responses** – consistent `{ success, data, error }` structure  

---

## 🔧 Installation

This project is designed to be used as a **Google Apps Script library**.

### Prerequisites
- Google Account with Apps Script access  
- Supabase project (get Project URL + `service_role` key from  
  **Dashboard → Project Settings → API**)  

---

### Step 1: Add the Library to Your Project

1. Open your project (e.g., script linked to a Sheet)  
2. In sidebar → click **+ Libraries**  
3. Paste this **Library ID**
  ```
  10TGg6EEQ4K894duUiKGGYp-aVcgct5n1gJSeFiXUGL-QkyqzVDSpovMZ
  ```  
4. Set Identifier to **SupabaseGS** (case-sensitive)  
5. Choose latest version → click **Add**  

---

## ⚙️ Configuration

Store credentials using **Apps Script’s PropertiesService** —  
**never** hardcode secrets.

1. Open **Project Settings (⚙️)** → scroll to **Script Properties**  
2. Add:

| Property Name     | Value Example |
|-------------------|----------------|
| SUPABASE_URL      | `https://your-project-id.supabase.co` |
| SUPABASE_KEY      | `your-service-role-secret-key` |

---

## 🚀 Usage

All methods return:

```js
{ success: boolean, data: (object|array|null), error: (object|null) }
```

### Initialize the Client

```js
/**
 * Gets a new Supabase client instance.
 */
function getSupabaseClient() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const SUPABASE_URL = scriptProperties.getProperty('SUPABASE_URL');
  const SUPABASE_KEY = scriptProperties.getProperty('SUPABASE_KEY');

  if (!SUPABASE_URL || !SUPABASE_KEY)
    throw new Error("Supabase URL or Key not found in Script Properties.");

  return Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Example usage
function testMyConnection() {
  const client = getSupabaseClient();
  const { success, data, error } = client.select('my_table', { select: 'id', limit: 1 });

  if (success) Logger.log('Data: ' + JSON.stringify(data));
  else Logger.log('Error: ' + JSON.stringify(error));
}
```

---

### ➡️ select(tableName, queryParams)

Fetch data using PostgREST filters.

```js
function getActiveUsers() {
  const client = getSupabaseClient();
  const params = {
    select: 'id,email',
    status: 'eq.active',
    order: 'created_at.desc',
    limit: 10
  };

  const { success, data, error } = client.select('profiles', params);
  if (success) Logger.log(data);
  else Logger.log(error);
}
```

---

### ➡️ insert(tableName, data, [options])

Insert one or more records.

```js
function addUser() {
  const client = getSupabaseClient();
  const newUser = { email: 'test.user@example.com', username: 'testuser' };
  const { success, data } = client.insert('profiles', newUser);

  if (success) Logger.log('Created user: ' + data[0].id);
}
```

**Upsert Example**

```js
function upsertUser() {
  const client = getSupabaseClient();
  const userData = { id: 'uuid123', username: 'new_username' };
  const options = { upsert: true, onConflict: 'id' };
  const { data } = client.insert('profiles', userData, options);
  Logger.log(data);
}
```

---

### ➡️ update(tableName, data, queryParams)

Update rows matching filters.

```js
function deactivateUser() {
  const client = getSupabaseClient();
  const updates = { status: 'inactive' };
  const filter = { email: 'eq.test.user@example.com' };

  const { success, data } = client.update('profiles', updates, filter);
  if (success) Logger.log(data);
}
```

---

### ➡️ delete(tableName, queryParams)

Delete rows matching filters.

```js
function deleteUser() {
  const client = getSupabaseClient();
  const filter = { id: 'eq.123' };

  const { success, data, error } = client.delete('profiles', filter);
  if (success) Logger.log('Deleted: ' + JSON.stringify(data));
  else Logger.log(error.message);
}
```

---

### 📞 rpc(functionName, args)

Call custom Postgres functions.

```js
function countAllUsers() {
  const client = getSupabaseClient();
  const { success, data, error } = client.rpc('get_user_count', {});

  if (success) Logger.log('Total users: ' + data);
  else Logger.log(error);
}
```

---

## 🐘 Raw SQL (run_raw_sql)

Supabase REST API doesn’t support direct SQL.  
Instead, create a Postgres RPC function.

### 1️⃣ Create Function in Supabase

```sql
CREATE OR REPLACE FUNCTION run_raw_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  IF result IS NULL THEN RETURN '[]'::json; END IF;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'true', 'message', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;
```

### 2️⃣ Call from Apps Script

```js
function runCustomQuery() {
  const client = getSupabaseClient();
  const myQuery = "SELECT email, status FROM profiles WHERE status = 'active' LIMIT 5";
  const { success, data, error } = client.rpc('run_raw_sql', { query: myQuery });

  if (success) {
    if (data.error)
      Logger.log(`SQL Error: ${data.message} (State: ${data.sqlstate})`);
    else
      Logger.log(data);
  } else {
    Logger.log(`RPC Error: ${error.message}`);
  }
}
```
---

## 📜 License

Distributed under the **MIT License**.

---

## 📧 Contact

**Maintainer:** [Mayur Jadhav] – [mayurgj1978@gmail.com]  
**Project Link:** [https://github.com/mayurgj/supabase-appscript-client](https://github.com/mayurgj/supabase-appscript-client)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com)  
- [Google Apps Script](https://developers.google.com/apps-script)  
- [PostgREST](https://postgrest.org)
