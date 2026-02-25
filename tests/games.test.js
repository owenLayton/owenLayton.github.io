beforeAll(() => {
  loadScript('js/games.js');
});

beforeEach(() => {
  document.body.innerHTML = '<main class="main-content" id="games-content"></main>';
  // Reset document.title
  document.title = '';
});

/* ==========================================
   Pure functions
   ========================================== */

describe('getGameBySlug', () => {
  test('returns correct game object', () => {
    const game = getGameBySlug(GAME_INDEX[0].slug);
    expect(game).toBeDefined();
    expect(game.title).toBe(GAME_INDEX[0].title);
  });

  test('returns undefined for unknown slug', () => {
    expect(getGameBySlug('nonexistent-game')).toBeUndefined();
  });
});

/* ==========================================
   DOM rendering
   ========================================== */

describe('renderGamesGrid', () => {
  test('renders a card for each game', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    const cards = container.querySelectorAll('.game-card');
    expect(cards.length).toBe(GAME_INDEX.length);
  });

  test('each card has title and truncated subtitle', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    GAME_INDEX.forEach(game => {
      const card = Array.from(container.querySelectorAll('.game-card'))
        .find(c => c.querySelector('h3').textContent === game.title);
      expect(card).toBeDefined();
      // Description should be truncated with "..."
      const desc = card.querySelector('p').textContent;
      expect(desc.endsWith('...')).toBe(true);
    });
  });

  test('each card has category badge', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    const badges = container.querySelectorAll('.game-category');
    expect(badges.length).toBe(GAME_INDEX.length);
    badges.forEach(badge => {
      expect(['professional', 'personal']).toContain(badge.textContent);
    });
  });

  test('renders professional and personal category headings', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    const headings = container.querySelectorAll('.games-category-heading');
    const headingTexts = Array.from(headings).map(h => h.textContent);
    expect(headingTexts).toContain(STRINGS.games.categoryProfessional);
    expect(headingTexts).toContain(STRINGS.games.categoryPersonal);
  });

  test('renders separate grids for professional and personal games', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    const grids = container.querySelectorAll('.games-grid');
    expect(grids.length).toBe(2);
  });

  test('cards with heroImage render img, those without do not', () => {
    const container = document.getElementById('games-content');
    renderGamesGrid(container);

    GAME_INDEX.forEach(game => {
      const card = Array.from(container.querySelectorAll('.game-card'))
        .find(c => c.querySelector('h3').textContent === game.title);
      const img = card.querySelector('.game-card-image');
      if (game.heroImage) {
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBe(game.heroImage);
      } else {
        expect(img).toBeNull();
      }
    });
  });
});

describe('renderGameDetail', () => {
  test('renders subtitle as subheader', () => {
    const game = FULL_GAME_DATA[GAME_INDEX[0].slug];
    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    expect(container.querySelector('h1').textContent).toBe(game.title);
    expect(container.querySelector('.game-subtitle').textContent).toBe(game.subtitle);
  });

  test('renders array description as bullet list', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => Array.isArray(g.description));
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const list = container.querySelector('ul.game-description');
    expect(list).not.toBeNull();
    expect(list.querySelectorAll('li').length).toBe(game.description.length);
  });

  test('renders string description as paragraph', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => typeof g.description === 'string');
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const desc = container.querySelector('p.game-description');
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe(game.description);
  });

  test('renders meta info (role, tools, platforms)', () => {
    const game = FULL_GAME_DATA[GAME_INDEX[0].slug];
    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const meta = container.querySelector('.game-meta');
    if (game.role) expect(meta.textContent).toContain(game.role);
    if (game.tools) expect(meta.textContent).toContain(game.tools[0]);
    if (game.platforms) expect(meta.textContent).toContain(game.platforms[0]);
  });

  test('renders gallery section when game has gallery', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => g.gallery && g.gallery.length > 0);
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const gallery = container.querySelector('.game-gallery');
    expect(gallery).not.toBeNull();
    expect(gallery.querySelectorAll('img').length).toBe(game.gallery.length);
  });

  test('omits gallery section when absent', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => !g.gallery || g.gallery.length === 0);
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    expect(container.querySelector('.game-gallery')).toBeNull();
  });

  test('renders hero video iframe when game has heroVideo', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => g.heroVideo);
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const iframe = container.querySelector('.game-hero-video');
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toBe(game.heroVideo);
  });

  test('renders hero image when game has heroImage', () => {
    const game = Object.values(FULL_GAME_DATA).find(g => g.heroImage);
    if (!game) return;

    const container = document.getElementById('games-content');
    renderGameDetail(game, container);

    const img = container.querySelector('.game-hero');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(game.heroImage);
  });
});

describe('initGamesPage', () => {
  test('renders grid when no ?game= parameter', async () => {
    delete window.location;
    window.location = new URL('http://localhost/games.html');

    await initGamesPage();
    const grid = document.querySelector('.games-grid');
    expect(grid).not.toBeNull();
  });

  test('renders detail when ?game= matches a slug', async () => {
    const slug = GAME_INDEX[0].slug;
    delete window.location;
    window.location = new URL(`http://localhost/games.html?game=${slug}`);

    await initGamesPage();
    const detail = document.querySelector('.game-detail');
    expect(detail).not.toBeNull();
    expect(document.querySelector('h1').textContent).toBe(GAME_INDEX[0].title);
  });

  test('renders not-found when ?game= does not match', async () => {
    delete window.location;
    window.location = new URL('http://localhost/games.html?game=nonexistent');

    await initGamesPage();
    expect(document.querySelector('h1').textContent).toBe(STRINGS.games.notFoundTitle);
  });
});
