const fs = require('fs');
const path = require('path');

/* ==========================================
   Load Validator from editor.html
   ========================================== */

let Validator;

beforeAll(() => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'tools', 'editor.html'), 'utf8');

  // Extract the Validator object from the IIFE inside the <script> tag.
  // It starts at "const Validator = {" and ends before the next module comment block.
  const startMarker = 'const Validator = {';
  const endMarker = /\n\s{4}\/\* =+\s*\n\s+LayoutEngine/;
  const startIdx = html.indexOf(startMarker);
  const endMatch = endMarker.exec(html.substring(startIdx));
  const chunk = html.substring(startIdx, startIdx + endMatch.index);

  // Wrap the extracted code so it returns the object
  const code = chunk.replace('const Validator =', 'return');
  const factory = new Function(code);
  Validator = factory();
});

/* ==========================================
   Helper: build a minimal valid adventure
   ========================================== */

function makeAdventure(nodes, title = 'Test Adventure') {
  return { title, nodes };
}

function node(id, text, options) {
  return { id, text, options };
}

function opt(text, target) {
  return { text, target };
}

/* ==========================================
   Validator.validate — basic validation
   ========================================== */

describe('Validator.validate', () => {

  test('valid adventure returns no errors', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('Go', 2)]),
      node(2, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual([]);
  });

  test('null input returns error', () => {
    const result = Validator.validate(null);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/not a valid object/);
  });

  test('undefined input returns error', () => {
    const result = Validator.validate(undefined);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('non-object input returns error', () => {
    const result = Validator.validate('hello');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('missing title returns error', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('Go', 2)]),
      node(2, 'End', []),
    ]);
    delete adv.title;
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/title/i)])
    );
  });

  test('empty nodes array returns error', () => {
    const result = Validator.validate({ title: 'Test', nodes: [] });
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/empty.*nodes/i)])
    );
  });

  test('duplicate node IDs returns error', () => {
    const adv = makeAdventure([
      node(1, 'First', [opt('Go', 1)]),
      node(1, 'Second', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/Duplicate node ID: 1/)])
    );
  });

  test('option targeting non-existent node returns error', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('Go', 999)]),
      node(2, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/target 999 does not exist/)])
    );
  });

  test('no ending nodes returns error', () => {
    const adv = makeAdventure([
      node(1, 'A', [opt('Go', 2)]),
      node(2, 'B', [opt('Go', 1)]),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/No ending nodes/)])
    );
  });

  test('unreachable node returns error', () => {
    const adv = makeAdventure([
      node(1, 'Start', []),
      node(2, 'Orphan', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/Node 2 is unreachable/)])
    );
  });

  test('node with non-number id returns error', () => {
    const adv = makeAdventure([
      { id: 'abc', text: 'Bad', options: [] },
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/id.*must be a number/i)])
    );
  });

  test('node with empty text returns error', () => {
    const adv = makeAdventure([
      node(1, '', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/text.*must be a non-empty string/i)])
    );
  });

  test('option with empty text returns error', () => {
    const adv = makeAdventure([
      node(1, 'Start', [{ text: '', target: 2 }]),
      node(2, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/option.*text.*must be a non-empty string/i)])
    );
  });

  test('option with non-number target returns error', () => {
    const adv = makeAdventure([
      node(1, 'Start', [{ text: 'Go', target: 'abc' }]),
      node(2, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/target.*must be a number/i)])
    );
  });
});

/* ==========================================
   Dead-end loop detection
   ========================================== */

describe('dead-end loop detection', () => {

  test('2-node loop (A→B→A, both single-option) returns error', () => {
    const adv = makeAdventure([
      node(1, 'Node A', [opt('Go to B', 2)]),
      node(2, 'Node B', [opt('Go to A', 1)]),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors.length).toBe(1);
    expect(loopErrors[0]).toMatch(/1 → 2 → 1/);
  });

  test('3-node loop (A→B→C→A, all single-option) returns error', () => {
    const adv = makeAdventure([
      node(1, 'Node A', [opt('Go', 2)]),
      node(2, 'Node B', [opt('Go', 3)]),
      node(3, 'Node C', [opt('Go', 1)]),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors.length).toBe(1);
    expect(loopErrors[0]).toMatch(/1 → 2 → 3 → 1/);
  });

  test('self-loop (node points to itself) returns error', () => {
    const adv = makeAdventure([
      node(1, 'Stuck', [opt('Again', 1)]),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors.length).toBe(1);
    expect(loopErrors[0]).toMatch(/1 → 1/);
  });

  test('single-option chain ending at a node with 0 options (ending) is NOT a loop', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('Go', 2)]),
      node(2, 'Middle', [opt('Go', 3)]),
      node(3, 'End', []),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors).toEqual([]);
  });

  test('cycle with multi-option escape is NOT a dead-end loop', () => {
    // Node 2 has 2 options: one back to 1 (cycle) and one to 3 (escape).
    // Because node 2 has >1 option, it's not a "single-option" node, so no dead-end.
    const adv = makeAdventure([
      node(1, 'Start', [opt('Go', 2)]),
      node(2, 'Choice', [opt('Back', 1), opt('Forward', 3)]),
      node(3, 'End', []),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors).toEqual([]);
  });

  test('loop among some nodes while others are valid', () => {
    // Nodes 1→2 is a valid path. Nodes 3→4→3 form a dead-end loop.
    // Node 1 reaches both 2 and 3.
    const adv = makeAdventure([
      node(1, 'Start', [opt('Good path', 2), opt('Bad path', 3)]),
      node(2, 'End', []),
      node(3, 'Trap A', [opt('Go', 4)]),
      node(4, 'Trap B', [opt('Go', 3)]),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors.length).toBe(1);
    expect(loopErrors[0]).toMatch(/3 → 4 → 3/);
  });

  test('two independent loops both reported', () => {
    // Loop 1: 2→3→2, Loop 2: 4→5→4
    const adv = makeAdventure([
      node(1, 'Start', [opt('Path A', 2), opt('Path B', 4)]),
      node(2, 'Loop1A', [opt('Go', 3)]),
      node(3, 'Loop1B', [opt('Go', 2)]),
      node(4, 'Loop2A', [opt('Go', 5)]),
      node(5, 'Loop2B', [opt('Go', 4)]),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors.length).toBe(2);
  });

  test('single-option chain that ends at a multi-option node is NOT a loop', () => {
    // 1 (single) → 2 (single) → 3 (multi-option) → ...
    // The chain terminates at 3 which has >1 option, so not in the single-option map.
    const adv = makeAdventure([
      node(1, 'Linear A', [opt('Go', 2)]),
      node(2, 'Linear B', [opt('Go', 3)]),
      node(3, 'Branch', [opt('Left', 4), opt('Right', 5)]),
      node(4, 'End A', []),
      node(5, 'End B', []),
    ]);
    const result = Validator.validate(adv);
    const loopErrors = result.errors.filter(e => e.includes('Dead-end loop'));
    expect(loopErrors).toEqual([]);
  });
});

/* ==========================================
   Warnings and stats
   ========================================== */

describe('warnings and stats', () => {

  test('single-option node triggers warning', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('Only way', 2)]),
      node(2, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/Node 1 has only one option/)])
    );
  });

  test('long text node triggers warning', () => {
    const longText = 'A'.repeat(301);
    const adv = makeAdventure([
      node(1, longText, []),
    ]);
    const result = Validator.validate(adv);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/Node 1 has very long text/)])
    );
  });

  test('text at exactly 300 chars does NOT trigger warning', () => {
    const text = 'A'.repeat(300);
    const adv = makeAdventure([
      node(1, text, []),
    ]);
    const result = Validator.validate(adv);
    const longWarnings = result.warnings.filter(w => w.includes('long text'));
    expect(longWarnings).toEqual([]);
  });

  test('stats reflect correct counts', () => {
    const adv = makeAdventure([
      node(1, 'Start', [opt('A', 2), opt('B', 3)]),
      node(2, 'Mid', [opt('Go', 4)]),
      node(3, 'Alt', []),
      node(4, 'End', []),
    ]);
    const result = Validator.validate(adv);
    expect(result.stats.totalNodes).toBe(4);
    expect(result.stats.totalEndings).toBe(2);
    expect(result.stats.totalConnections).toBe(3);
  });
});
