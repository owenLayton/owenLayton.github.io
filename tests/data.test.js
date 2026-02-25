const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const adventureIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'adventure-index.json'), 'utf8'));
const gameIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'game-index.json'), 'utf8'));

/* ==========================================
   Adventure Index validation
   ========================================== */

describe('adventure-index.json', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(adventureIndex)).toBe(true);
    expect(adventureIndex.length).toBeGreaterThan(0);
  });

  test('each entry has id (string), title (string), file (string)', () => {
    adventureIndex.forEach(entry => {
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.file).toBe('string');
      expect(entry.file.length).toBeGreaterThan(0);
    });
  });

  test('all adventure IDs are unique', () => {
    const ids = adventureIndex.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all referenced adventure files exist', () => {
    adventureIndex.forEach(entry => {
      const filePath = path.join(__dirname, '..', entry.file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});

/* ==========================================
   Individual adventure file validation
   ========================================== */

describe.each(adventureIndex)('adventure: $title ($id)', (entry) => {
  let adventure;

  beforeAll(() => {
    const filePath = path.join(__dirname, '..', entry.file);
    adventure = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  test('has title (string) and nodes (array)', () => {
    expect(typeof adventure.title).toBe('string');
    expect(adventure.title.length).toBeGreaterThan(0);
    expect(Array.isArray(adventure.nodes)).toBe(true);
    expect(adventure.nodes.length).toBeGreaterThan(0);
  });

  test('all node IDs are unique', () => {
    const ids = adventure.nodes.map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('each node has id (number), text (string), and options (array)', () => {
    adventure.nodes.forEach(node => {
      expect(typeof node.id).toBe('number');
      expect(typeof node.text).toBe('string');
      expect(node.text.length).toBeGreaterThan(0);
      expect(Array.isArray(node.options)).toBe(true);
    });
  });

  test('each option has text (string) and target (number)', () => {
    adventure.nodes.forEach(node => {
      node.options.forEach(opt => {
        expect(typeof opt.text).toBe('string');
        expect(opt.text.length).toBeGreaterThan(0);
        expect(typeof opt.target).toBe('number');
      });
    });
  });

  test('all option targets reference existing node IDs', () => {
    const nodeIds = new Set(adventure.nodes.map(n => n.id));
    adventure.nodes.forEach(node => {
      node.options.forEach(opt => {
        expect(nodeIds.has(opt.target)).toBe(true);
      });
    });
  });

  test('at least one ending node exists (empty options)', () => {
    const endings = adventure.nodes.filter(n => n.options.length === 0);
    expect(endings.length).toBeGreaterThan(0);
  });

  test('no dead-end loops (single-option cycles with no way out)', () => {
    const singleOptionTargets = new Map();
    adventure.nodes.forEach(node => {
      if (node.options.length === 1) {
        singleOptionTargets.set(node.id, node.options[0].target);
      }
    });
    const checked = new Set();
    singleOptionTargets.forEach((_, startId) => {
      if (checked.has(startId)) return;
      const chain = [];
      const chainSet = new Set();
      let current = startId;
      while (current !== undefined && singleOptionTargets.has(current) && !checked.has(current)) {
        expect(chainSet.has(current)).toBe(false); // would mean a dead-end loop
        chain.push(current);
        chainSet.add(current);
        current = singleOptionTargets.get(current);
      }
      chain.forEach(id => checked.add(id));
    });
  });

  test('all nodes are reachable from the first node', () => {
    const startId = adventure.nodes[0].id;
    const visited = new Set();
    const queue = [startId];

    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);

      const node = adventure.nodes.find(n => n.id === id);
      if (node) {
        node.options.forEach(opt => {
          if (!visited.has(opt.target)) queue.push(opt.target);
        });
      }
    }

    adventure.nodes.forEach(node => {
      expect(visited.has(node.id)).toBe(true);
    });
  });
});

/* ==========================================
   Game Index validation
   ========================================== */

describe('game-index.json', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(gameIndex)).toBe(true);
    expect(gameIndex.length).toBeGreaterThan(0);
  });

  test('each entry has slug, title, category, subtitle, file', () => {
    gameIndex.forEach(entry => {
      expect(typeof entry.slug).toBe('string');
      expect(entry.slug.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.category).toBe('string');
      expect(typeof entry.subtitle).toBe('string');
      expect(typeof entry.file).toBe('string');
    });
  });

  test('all slugs are unique', () => {
    const slugs = gameIndex.map(e => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('all referenced game files exist', () => {
    gameIndex.forEach(entry => {
      const filePath = path.join(__dirname, '..', entry.file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});

/* ==========================================
   Individual game file validation
   ========================================== */

describe.each(gameIndex)('game: $title ($slug)', (entry) => {
  let game;

  beforeAll(() => {
    const filePath = path.join(__dirname, '..', entry.file);
    game = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  test('has required fields', () => {
    expect(typeof game.slug).toBe('string');
    expect(typeof game.title).toBe('string');
    expect(typeof game.subtitle).toBe('string');
    expect(['professional', 'personal']).toContain(game.category);
  });

  test('slug matches filename', () => {
    const expectedSlug = path.basename(entry.file, '.json');
    expect(game.slug).toBe(expectedSlug);
  });

  test('slug matches index entry', () => {
    expect(game.slug).toBe(entry.slug);
  });
});
