/**
 * Basic CRUD operations using SupabaseGS
 */

function exampleCRUD() {
  const SUPABASE_URL = 'https://<project>.supabase.co';
  const SUPABASE_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON');
  const sb = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY, { schema: 'public' });

  // CREATE
  const insertRes = sb.insert('profiles', { full_name: 'Mayur', age: 28 });
  Logger.log('INSERT:', insertRes);

  // READ
  const selectRes = sb.select('profiles', '*', { filters: 'age=gte.18' });
  Logger.log('SELECT:', selectRes);

  // UPDATE
  const updateRes = sb.update('profiles', { full_name: 'Mayur Updated' }, 'id=eq.1');
  Logger.log('UPDATE:', updateRes);

  // DELETE
  const deleteRes = sb.delete('profiles', 'id=eq.1');
  Logger.log('DELETE:', deleteRes);
}
