/**
 * Safe raw SQL execution via execute_sql RPC
 */

function exampleRawSQL() {
  const SUPABASE_URL = 'https://<project>.supabase.co';
  const SUPABASE_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON');
  const sb = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY);

  // SQL executed through a stored procedure:
  // create or replace function api.execute_sql(sql text)
  // returns json as $$
  //   execute sql;
  // $$ language plpgsql security definer;

  const sql = 'SELECT id, full_name FROM profiles LIMIT 5;';
  const res = sb.executeRaw(sql);
  if (res.error) Logger.log('Error:', res.error);
  else Logger.log('SQL Result:', res.data);
}
