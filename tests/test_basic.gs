/**
 * Test basic CRUD functionality of SupabaseGS
 */

function testBasicCRUD() {
  const SUPABASE_URL = 'https://<project>.supabase.co';
  const SUPABASE_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON');
  const sb = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY);

  // Insert test row
  const insert = sb.insert('profiles', { full_name: 'TestUser', active: true });
  console.assert(insert.status === 201, 'Insert failed');
  console.assert(!insert.error, 'Insert error: ' + JSON.stringify(insert.error));

  // Select test row
  const select = sb.select('profiles', '*', { filters: 'full_name=eq.TestUser' });
  console.assert(select.status === 200, 'Select failed');
  console.assert(select.data.length > 0, 'No data returned');

  // Update test row
  const id = select.data[0].id;
  const update = sb.update('profiles', { active: false }, `id=eq.${id}`);
  console.assert(update.status === 200, 'Update failed');

  // Delete test row
  const del = sb.delete('profiles', `id=eq.${id}`);
  console.assert(del.status === 204, 'Delete failed');
}
