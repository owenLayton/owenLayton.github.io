/* ========================================
   Game Registry — Async loader
   Loads game data from JSON files via fetch.
   Mirrors the adventure loading pattern.
   Uses fetchJSON from js/utils.js
   ======================================== */

var GAME_INDEX = [];

var _gameIndexPromise = null;

async function loadGameIndex() {
  if (!_gameIndexPromise) {
    _gameIndexPromise = fetchJSON('data/game-index.json').then(function(data) {
      GAME_INDEX = data;
      return data;
    });
  }
  return _gameIndexPromise;
}

async function loadGameDetail(slug) {
  var entry = GAME_INDEX.find(function(g) { return g.slug === slug; });
  if (!entry) return null;
  return fetchJSON(entry.file);
}
