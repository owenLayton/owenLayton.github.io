/* ========================================
   Shared Utilities
   ======================================== */

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to load ' + url);
  return resp.json();
}
