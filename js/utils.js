/* ========================================
   Shared Utilities
   ======================================== */

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to load ' + url);
  return resp.json();
}

function toEmbedUrl(url) {
  if (typeof url !== 'string') return url;
  var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  return url;
}
