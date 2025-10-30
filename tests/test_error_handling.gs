/**
 * Test SupabaseGS error handling and parseError()
 */

function testErrorHandling() {
  const SUPABASE_URL = 'https://<project>.supabase.co';
  const SUPABASE_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON');
  const sb = new SupabaseGS(SUPABASE_URL, SUPABASE_KEY);

  // Trigger deliberate error by inserting into non-existing table
  const res = sb.insert('non_existing_table', { foo: 'bar' });
  const err = sb.parseError(res);

  Logger.log('Raw Response:', res);
  Logger.log('Parsed Error:', err);

  console.assert(err !== null, 'Error should be parsed');
  console.assert(res.status >= 400, 'Expected error status code');
  console.assert(typeof err.message === 'string', 'Expected error message string');
}
