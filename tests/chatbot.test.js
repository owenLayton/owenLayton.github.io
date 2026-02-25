const fs = require('fs');
const path = require('path');

// Sample adventure data for tests
const sampleAdventure = {
  id: 'test',
  title: 'Test Adventure',
  nodes: [
    { id: 1, text: 'Start node', options: [{ text: 'Go to 2', target: 2 }, { text: 'Go to 3', target: 3 }] },
    { id: 2, text: 'Middle node', options: [{ text: 'Go to 3', target: 3 }] },
    { id: 3, text: 'End node', options: [] },
  ],
};

const sampleIndex = [
  { id: 'test', title: 'Test Adventure', file: 'data/adventures/test.json' },
  { id: 'other', title: 'Other Adventure', file: 'data/adventures/other.json' },
];

// Load chatbot.js into global scope
beforeAll(() => {
  loadScript('js/chatbot.js');
});

// Reset state before each test
beforeEach(() => {
  localStorage.clear();
  // Reset chatbot globals
  adventureIndex = [];
  currentAdventure = null;
  messageHistory = [];
  gameState = null;
  pickerMode = false;
  welcomeMode = false;

  // Set up minimal DOM
  document.body.innerHTML = '<div id="chatbot-container"></div>';
});

/* ==========================================
   Pure functions
   ========================================== */

describe('getNode', () => {
  test('finds node by ID', () => {
    const node = getNode(sampleAdventure, 1);
    expect(node).toBeDefined();
    expect(node.text).toBe('Start node');
  });

  test('returns undefined for missing ID', () => {
    expect(getNode(sampleAdventure, 999)).toBeUndefined();
  });
});

describe('replayPath', () => {
  test('builds correct messages for a multi-step path', () => {
    const messages = replayPath(sampleAdventure, [1, 2, 3]);
    expect(messages).toEqual([
      { type: 'bot', text: 'Start node' },
      { type: 'user', text: 'Go to 2' },
      { type: 'bot', text: 'Middle node' },
      { type: 'user', text: 'Go to 3' },
      { type: 'bot', text: 'End node' },
    ]);
  });

  test('handles single-node path (just bot message)', () => {
    const messages = replayPath(sampleAdventure, [1]);
    expect(messages).toEqual([
      { type: 'bot', text: 'Start node' },
    ]);
  });

  test('stops at invalid node ID', () => {
    const messages = replayPath(sampleAdventure, [1, 999]);
    expect(messages).toEqual([
      { type: 'bot', text: 'Start node' },
    ]);
  });

  test('returns empty array for empty path', () => {
    expect(replayPath(sampleAdventure, [])).toEqual([]);
  });
});

describe('getCurrentNode', () => {
  test('returns null when no adventure loaded', () => {
    currentAdventure = null;
    gameState = null;
    expect(getCurrentNode()).toBeNull();
  });

  test('returns current node when state exists', () => {
    currentAdventure = sampleAdventure;
    gameState = { adventureId: 'test', chosenPath: [1, 2] };
    const node = getCurrentNode();
    expect(node.id).toBe(2);
    expect(node.text).toBe('Middle node');
  });
});

describe('isEnding', () => {
  test('returns true when current node has no options', () => {
    currentAdventure = sampleAdventure;
    gameState = { adventureId: 'test', chosenPath: [1, 2, 3] };
    expect(isEnding()).toBe(true);
  });

  test('returns false when current node has options', () => {
    currentAdventure = sampleAdventure;
    gameState = { adventureId: 'test', chosenPath: [1] };
    expect(isEnding()).toBe(false);
  });

  test('returns falsy when no state', () => {
    currentAdventure = null;
    gameState = null;
    expect(isEnding()).toBeFalsy();
  });
});

/* ==========================================
   localStorage
   ========================================== */

describe('saveState', () => {
  test('writes serialized gameState to localStorage', () => {
    gameState = { adventureId: 'test', chosenPath: [1, 2] };
    saveState();
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(stored)).toEqual({ adventureId: 'test', chosenPath: [1, 2] });
  });
});

describe('loadSavedState', () => {
  test('returns parsed state from localStorage', () => {
    const state = { adventureId: 'test', chosenPath: [1] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadSavedState()).toEqual(state);
  });

  test('returns null when nothing saved', () => {
    expect(loadSavedState()).toBeNull();
  });

  test('returns null on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    expect(loadSavedState()).toBeNull();
  });
});

/* ==========================================
   Fetch / network
   ========================================== */

describe('fetchJSON', () => {
  test('returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
    const result = await fetchJSON('test.json');
    expect(result).toEqual({ data: 'test' });
  });

  test('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    await expect(fetchJSON('missing.json')).rejects.toThrow('Failed to load missing.json');
  });
});

describe('loadAdventureIndex', () => {
  test('populates adventureIndex', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sampleIndex),
    });
    await loadAdventureIndex();
    expect(adventureIndex).toEqual(sampleIndex);
  });
});

describe('loadAdventure', () => {
  beforeEach(() => {
    adventureIndex = [...sampleIndex];
  });

  test('returns adventure with id set', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Adventure', nodes: sampleAdventure.nodes }),
    });
    const result = await loadAdventure('test');
    expect(result.id).toBe('test');
    expect(result.title).toBe('Test Adventure');
    expect(result.nodes).toEqual(sampleAdventure.nodes);
  });

  test('returns null for unknown id', async () => {
    const result = await loadAdventure('nonexistent');
    expect(result).toBeNull();
  });
});

/* ==========================================
   DOM rendering
   ========================================== */

describe('buildChatbotUI', () => {
  test('creates expected DOM structure', () => {
    buildChatbotUI();
    expect(document.getElementById('chatbot-bar')).not.toBeNull();
    expect(document.getElementById('chatbot-toggle')).not.toBeNull();
    expect(document.getElementById('chatbot-window')).not.toBeNull();
    expect(document.getElementById('chatbot-messages')).not.toBeNull();
    expect(document.getElementById('chatbot-choices')).not.toBeNull();
    expect(document.getElementById('chatbot-arrow')).not.toBeNull();
  });

  test('title contains chatbot title string', () => {
    buildChatbotUI();
    const title = document.querySelector('.chatbot-bar-title');
    expect(title.textContent).toBe(STRINGS.chatbot.title);
  });

  test('toggle click toggles window open state', () => {
    // jsdom window.innerWidth defaults to 1024 (> 768), so buildChatbotUI auto-opens
    buildChatbotUI();
    const toggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');

    const initialState = chatWindow.classList.contains('open');
    toggle.click();
    expect(chatWindow.classList.contains('open')).toBe(!initialState);

    toggle.click();
    expect(chatWindow.classList.contains('open')).toBe(initialState);
  });
});

describe('renderMessages', () => {
  beforeEach(() => {
    buildChatbotUI();
  });

  test('renders message history as chat bubbles', () => {
    messageHistory = [
      { type: 'bot', text: 'Hello' },
      { type: 'user', text: 'Hi there' },
    ];
    renderMessages();

    const msgs = document.querySelectorAll('.chat-message');
    expect(msgs.length).toBe(2);
    expect(msgs[0].classList.contains('bot')).toBe(true);
    expect(msgs[0].textContent.trim()).toBe('Hello');
    expect(msgs[1].classList.contains('user')).toBe(true);
    expect(msgs[1].textContent.trim()).toBe('Hi there');
  });

  test('converts newlines to <br>', () => {
    messageHistory = [{ type: 'bot', text: 'Line 1\nLine 2' }];
    renderMessages();

    const msg = document.querySelector('.chat-message');
    expect(msg.innerHTML).toContain('<br>');
  });

  test('handles empty message history', () => {
    messageHistory = [];
    renderMessages();
    expect(document.querySelectorAll('.chat-message').length).toBe(0);
  });
});

describe('renderChoices', () => {
  beforeEach(() => {
    buildChatbotUI();
    currentAdventure = sampleAdventure;
  });

  test('renders option buttons for current node', () => {
    gameState = { adventureId: 'test', chosenPath: [1] };
    renderChoices();

    const buttons = document.querySelectorAll('.choice-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Go to 2');
    expect(buttons[1].textContent).toBe('Go to 3');
  });

  test('renders end buttons at ending node', () => {
    gameState = { adventureId: 'test', chosenPath: [1, 2, 3] };
    renderChoices();

    const endBtns = document.querySelectorAll('.end-btn');
    expect(endBtns.length).toBe(3);
    expect(endBtns[0].textContent).toBe(STRINGS.chatbot.restart);
    expect(endBtns[1].textContent).toBe(STRINGS.chatbot.newAdventure);
    expect(endBtns[2].textContent).toBe(STRINGS.chatbot.chooseAdventureBtn);
  });

  test('renders adventure picker buttons in picker mode', () => {
    gameState = { adventureId: 'test', chosenPath: [1] };
    adventureIndex = [...sampleIndex];
    pickerMode = true;
    renderChoices();

    const pickerBtns = document.querySelectorAll('.picker-btn');
    expect(pickerBtns.length).toBe(2);
    expect(pickerBtns[0].textContent).toBe('Test Adventure');
    expect(pickerBtns[1].textContent).toBe('Other Adventure');
  });
});

/* ==========================================
   Integration
   ========================================== */

describe('handleChoice', () => {
  beforeEach(() => {
    buildChatbotUI();
    currentAdventure = sampleAdventure;
    gameState = { adventureId: 'test', chosenPath: [1] };
    messageHistory = [{ type: 'bot', text: 'Start node' }];
  });

  test('adds user and bot messages, updates path, saves state', () => {
    handleChoice(2);
    expect(messageHistory).toEqual([
      { type: 'bot', text: 'Start node' },
      { type: 'user', text: 'Go to 2' },
      { type: 'bot', text: 'Middle node' },
    ]);
    expect(gameState.chosenPath).toEqual([1, 2]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
      adventureId: 'test',
      chosenPath: [1, 2],
    });
  });

  test('renders updated messages and choices', () => {
    handleChoice(2);
    const msgs = document.querySelectorAll('.chat-message');
    expect(msgs.length).toBe(3);
    const buttons = document.querySelectorAll('.choice-btn');
    expect(buttons.length).toBe(1); // node 2 has one option
  });
});

describe('startAdventure', () => {
  beforeEach(() => {
    buildChatbotUI();
    adventureIndex = [...sampleIndex];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Adventure', nodes: sampleAdventure.nodes }),
    });
  });

  test('sets up fresh game state and renders first node', async () => {
    await startAdventure('test');

    expect(gameState.adventureId).toBe('test');
    expect(gameState.chosenPath).toEqual([1]);
    expect(messageHistory[0].text).toContain('Test Adventure');
    expect(messageHistory[1].text).toBe('Start node');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.adventureId).toBe('test');
  });
});

describe('startRandomAdventure', () => {
  beforeEach(() => {
    buildChatbotUI();
    adventureIndex = [...sampleIndex];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Other Adventure', nodes: sampleAdventure.nodes }),
    });
  });

  test('picks from available adventures', async () => {
    await startRandomAdventure();
    expect(gameState).not.toBeNull();
    expect(gameState.adventureId).toBeDefined();
  });

  test('excludes specified adventure when possible', async () => {
    // With only 2 adventures, excluding "test" should pick "other"
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Other Adventure', nodes: sampleAdventure.nodes }),
    });
    await startRandomAdventure('test');
    expect(gameState.adventureId).toBe('other');
  });
});

describe('initChatbot', () => {
  test('loads index and shows welcome screen on fresh state', async () => {
    const indexResponse = { ok: true, json: () => Promise.resolve(sampleIndex) };
    global.fetch = jest.fn().mockResolvedValueOnce(indexResponse);

    await initChatbot();

    expect(document.getElementById('chatbot-bar')).not.toBeNull();
    expect(welcomeMode).toBe(true);
    expect(gameState).toBeNull();
    expect(messageHistory.length).toBe(1);
    expect(messageHistory[0].text).toBe(STRINGS.chatbot.welcomeGreeting);
  });

  test('restores saved state and replays path', async () => {
    const savedState = { adventureId: 'test', chosenPath: [1, 2] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    const indexResponse = { ok: true, json: () => Promise.resolve(sampleIndex) };
    const adventureResponse = { ok: true, json: () => Promise.resolve({ title: 'Test Adventure', nodes: sampleAdventure.nodes }) };
    global.fetch = jest.fn()
      .mockResolvedValueOnce(indexResponse)
      .mockResolvedValueOnce(adventureResponse);

    await initChatbot();

    expect(gameState).toEqual(savedState);
    expect(welcomeMode).toBe(false);
    // Should have: title message + replayed bot/user messages
    const botMessages = messageHistory.filter(m => m.type === 'bot');
    expect(botMessages.length).toBeGreaterThanOrEqual(2);
  });

  test('shows error message when index fails to load', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    await initChatbot();

    expect(messageHistory).toEqual([{ type: 'bot', text: STRINGS.chatbot.loadError }]);
  });
});

/* ==========================================
   Welcome mode
   ========================================== */

describe('showWelcome', () => {
  beforeEach(() => {
    buildChatbotUI();
    adventureIndex = [...sampleIndex];
  });

  test('sets welcomeMode and displays greeting', () => {
    showWelcome();
    expect(welcomeMode).toBe(true);
    expect(messageHistory).toEqual([{ type: 'bot', text: STRINGS.chatbot.welcomeGreeting }]);
  });

  test('does not save state to localStorage', () => {
    showWelcome();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('renders welcome buttons', () => {
    showWelcome();
    const pickerBtns = document.querySelectorAll('.picker-btn');
    expect(pickerBtns.length).toBe(2);
    const randomBtn = document.querySelector('.welcome-random-btn');
    expect(randomBtn).not.toBeNull();
  });
});

describe('renderChoices in welcome mode', () => {
  beforeEach(() => {
    buildChatbotUI();
    adventureIndex = [...sampleIndex];
    welcomeMode = true;
  });

  test('renders adventure picker buttons and random button', () => {
    renderChoices();

    const pickerBtns = document.querySelectorAll('.picker-btn');
    expect(pickerBtns.length).toBe(2);
    expect(pickerBtns[0].textContent).toBe('Test Adventure');
    expect(pickerBtns[1].textContent).toBe('Other Adventure');

    const randomBtn = document.querySelector('.welcome-random-btn');
    expect(randomBtn).not.toBeNull();
    expect(randomBtn.textContent).toBe(STRINGS.chatbot.randomAdventureBtn);
  });

  test('clicking adventure button clears welcomeMode and starts adventure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Adventure', nodes: sampleAdventure.nodes }),
    });

    renderChoices();
    const pickerBtns = document.querySelectorAll('.picker-btn');
    pickerBtns[0].click();
    await new Promise(r => setTimeout(r, 0));

    expect(welcomeMode).toBe(false);
    expect(gameState).not.toBeNull();
    expect(gameState.adventureId).toBe('test');
  });

  test('clicking random button clears welcomeMode and starts random adventure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Adventure', nodes: sampleAdventure.nodes }),
    });

    renderChoices();
    const randomBtn = document.querySelector('.welcome-random-btn');
    randomBtn.click();
    await new Promise(r => setTimeout(r, 0));

    expect(welcomeMode).toBe(false);
    expect(gameState).not.toBeNull();
  });
});
