const fs = require('fs');
const path = require('path');

// Helper: execute code in global scope so that top-level const/let/var and
// function declarations are accessible as globals (mimicking browser <script>).
function evalAsGlobal(code) {
  // Convert const/let/var to global assignments
  let transformed = code.replace(
    /^(const|let|var)\s+(\w+)\s*=/gm,
    'global.$2 ='
  );
  // Convert top-level function declarations to global assignments
  // Matches `function name(` at the start of a line (not indented = top-level)
  transformed = transformed.replace(
    /^function\s+(\w+)\s*\(/gm,
    'global.$1 = function $1('
  );
  // Convert top-level async function declarations
  transformed = transformed.replace(
    /^async\s+function\s+(\w+)\s*\(/gm,
    'global.$1 = async function $1('
  );
  const fn = new Function(transformed);
  fn();
}

// Load STRINGS into global scope
const stringsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'strings.js'), 'utf8');
evalAsGlobal(stringsCode);

// Stub browser APIs not implemented in jsdom
window.scrollTo = function() {};

// Load shared utilities into global scope
const utilsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'utils.js'), 'utf8');
evalAsGlobal(utilsCode);

// Load game registry into global scope
const registryCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'game-registry.js'), 'utf8');
evalAsGlobal(registryCode);

// Populate GAME_INDEX from JSON files (simulating what loadGameIndex() does at runtime)
const gamesDir = path.join(__dirname, '..', 'data', 'games');
const gameIndex = [];
const fullGameData = {};

fs.readdirSync(gamesDir).filter(f => f.endsWith('.json')).sort().forEach(file => {
  const game = JSON.parse(fs.readFileSync(path.join(gamesDir, file), 'utf8'));
  gameIndex.push({
    slug: game.slug,
    title: game.title,
    category: game.category,
    subtitle: game.subtitle,
    file: `data/games/${file}`,
    ...(game.heroImage ? { heroImage: game.heroImage } : {}),
  });
  fullGameData[game.slug] = game;
});

global.GAME_INDEX = gameIndex;
global.FULL_GAME_DATA = fullGameData;

// Mock loadGameIndex as a no-op (data already populated)
global.loadGameIndex = async function() { return GAME_INDEX; };
// Mock loadGameDetail to return from pre-loaded data
global.loadGameDetail = async function(slug) {
  return FULL_GAME_DATA[slug] || null;
};

// Helper to load a JS file into global scope, suppressing DOMContentLoaded auto-init
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  // Remove DOMContentLoaded listener registration so scripts don't auto-init
  const stripped = code.replace(
    /document\.addEventListener\(['"]DOMContentLoaded['"],\s*\w+\);?/g,
    '// DOMContentLoaded listener removed for testing'
  );
  evalAsGlobal(stripped);
}

global.loadScript = loadScript;
