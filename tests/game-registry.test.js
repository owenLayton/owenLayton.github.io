/* ==========================================
   Game Index — data integrity
   ========================================== */

describe('GAME_INDEX', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(GAME_INDEX)).toBe(true);
    expect(GAME_INDEX.length).toBeGreaterThan(0);
  });

  test('each entry has required index properties', () => {
    GAME_INDEX.forEach(entry => {
      expect(typeof entry.slug).toBe('string');
      expect(entry.slug.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe('string');
      expect(typeof entry.category).toBe('string');
      expect(typeof entry.subtitle).toBe('string');
      expect(typeof entry.file).toBe('string');
    });
  });

  test('all slugs are unique', () => {
    const slugs = GAME_INDEX.map(g => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('all categories are professional or personal', () => {
    GAME_INDEX.forEach(entry => {
      expect(['professional', 'personal']).toContain(entry.category);
    });
  });

  test('heroImage is a string when present', () => {
    GAME_INDEX.forEach(entry => {
      if (entry.heroImage !== undefined) {
        expect(typeof entry.heroImage).toBe('string');
      }
    });
  });
});

/* ==========================================
   Full game JSON files — data integrity
   ========================================== */

describe('Full game data (FULL_GAME_DATA)', () => {
  test('each game has required detail fields', () => {
    Object.values(FULL_GAME_DATA).forEach(game => {
      expect(typeof game.slug).toBe('string');
      expect(typeof game.title).toBe('string');
      expect(typeof game.category).toBe('string');
      expect(typeof game.subtitle).toBe('string');
      expect(['professional', 'personal']).toContain(game.category);
    });
  });

  test('description is string or array of strings when present', () => {
    Object.values(FULL_GAME_DATA).forEach(game => {
      if (game.description !== undefined) {
        if (Array.isArray(game.description)) {
          game.description.forEach(item => {
            expect(typeof item).toBe('string');
          });
        } else {
          expect(typeof game.description).toBe('string');
        }
      }
    });
  });

  test('optional fields have correct types when present', () => {
    Object.values(FULL_GAME_DATA).forEach(game => {
      if (game.heroImage !== undefined) expect(typeof game.heroImage).toBe('string');
      if (game.heroVideo !== undefined) expect(typeof game.heroVideo).toBe('string');
      if (game.role !== undefined) expect(typeof game.role).toBe('string');
      if (game.gallery !== undefined) expect(Array.isArray(game.gallery)).toBe(true);
      if (game.tools !== undefined) expect(Array.isArray(game.tools)).toBe(true);
      if (game.platforms !== undefined) expect(Array.isArray(game.platforms)).toBe(true);
    });
  });
});

/* ==========================================
   Async loader functions
   ========================================== */

describe('loadGameIndex', () => {
  test('returns GAME_INDEX', async () => {
    const result = await loadGameIndex();
    expect(result).toBe(GAME_INDEX);
  });
});

describe('loadGameDetail', () => {
  test('returns full game data for valid slug', async () => {
    const slug = GAME_INDEX[0].slug;
    const game = await loadGameDetail(slug);
    expect(game).toBeDefined();
    expect(game.slug).toBe(slug);
  });

  test('returns null for unknown slug', async () => {
    const game = await loadGameDetail('nonexistent-game');
    expect(game).toBeNull();
  });
});
