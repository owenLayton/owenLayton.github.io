/* ========================================
   Button-Driven Adventure Chatbot
   Loads adventures from JSON files.
   State persists via localStorage across pages.
   ======================================== */

const STORAGE_KEY = 'portfolio_chatbot_state';

let adventureIndex = [];
let currentAdventure = null;
let messageHistory = [];
let gameState = null;
let pickerMode = false;
let welcomeMode = false;

/* ---------- State persistence ---------- */

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function loadSavedState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) { /* fall through */ }
  }
  return null;
}

/* ---------- Data loading (fetchJSON from js/utils.js) ---------- */

async function loadAdventureIndex() {
  adventureIndex = await fetchJSON('data/adventure-index.json');
}

async function loadAdventure(id) {
  const entry = adventureIndex.find(a => a.id === id);
  if (!entry) return null;
  const adventure = await fetchJSON(entry.file);
  adventure.id = id;
  return adventure;
}

function getNode(adventure, nodeId) {
  return adventure.nodes.find(n => n.id === nodeId);
}

/* ---------- Path replay ---------- */

function replayPath(adventure, chosenPath) {
  const messages = [];
  for (let i = 0; i < chosenPath.length; i++) {
    const node = getNode(adventure, chosenPath[i]);
    if (!node) break;

    if (i > 0) {
      const prevNode = getNode(adventure, chosenPath[i - 1]);
      if (prevNode) {
        const chosenOption = prevNode.options.find(o => o.target === chosenPath[i]);
        if (chosenOption) {
          messages.push({ type: 'user', text: chosenOption.text });
        }
      }
    }

    messages.push({ type: 'bot', text: node.text });
  }
  return messages;
}

/* ---------- Game actions ---------- */

async function startAdventure(id) {
  currentAdventure = await loadAdventure(id);
  if (!currentAdventure) return;

  const firstNode = currentAdventure.nodes[0];
  gameState = { adventureId: id, chosenPath: [firstNode.id] };
  messageHistory = [
    { type: 'bot', text: `— ${currentAdventure.title} —` },
    { type: 'bot', text: firstNode.text },
  ];
  pickerMode = false;
  welcomeMode = false;
  saveState();
  renderMessages();
  renderChoices();
}

async function startRandomAdventure(excludeId) {
  const candidates = adventureIndex.filter(a => a.id !== excludeId);
  const pool = candidates.length > 0 ? candidates : adventureIndex;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  await startAdventure(pick.id);
}

function showWelcome() {
  welcomeMode = true;
  messageHistory = [{ type: 'bot', text: STRINGS.chatbot.welcomeGreeting }];
  renderMessages();
  renderChoices();
}

function handleChoice(targetId) {
  const currentNodeId = gameState.chosenPath[gameState.chosenPath.length - 1];
  const currentNode = getNode(currentAdventure, currentNodeId);
  const chosenOption = currentNode.options.find(o => o.target === targetId);

  if (chosenOption) {
    messageHistory.push({ type: 'user', text: chosenOption.text });
  }

  const nextNode = getNode(currentAdventure, targetId);
  if (nextNode) {
    messageHistory.push({ type: 'bot', text: nextNode.text });
    gameState.chosenPath.push(targetId);
    saveState();
  }

  renderMessages();
  renderChoices();
}

function getCurrentNode() {
  if (!currentAdventure || !gameState) return null;
  const nodeId = gameState.chosenPath[gameState.chosenPath.length - 1];
  return getNode(currentAdventure, nodeId);
}

function isEnding() {
  const node = getCurrentNode();
  return node && node.options.length === 0;
}

/* ---------- Rendering ---------- */

function renderMessages() {
  const messagesEl = document.getElementById('chatbot-messages');
  if (!messagesEl) return;

  messagesEl.innerHTML = messageHistory.map(msg => `
    <div class="chat-message ${msg.type}">
      ${msg.text.replace(/\n/g, '<br>')}
    </div>
  `).join('');

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function scrollToBottom() {
  const messagesEl = document.getElementById('chatbot-messages');
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderChoices() {
  const choicesEl = document.getElementById('chatbot-choices');
  if (!choicesEl) return;

  if (welcomeMode) {
    choicesEl.innerHTML = adventureIndex.map(a => `
      <button class="choice-btn picker-btn" data-adventure-id="${a.id}">${a.title}</button>
    `).join('') +
      `<button class="choice-btn welcome-random-btn">${STRINGS.chatbot.randomAdventureBtn}</button>`;

    choicesEl.querySelectorAll('.picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        welcomeMode = false;
        startAdventure(btn.dataset.adventureId);
      });
    });
    choicesEl.querySelector('.welcome-random-btn').addEventListener('click', () => {
      welcomeMode = false;
      startRandomAdventure();
    });
    setTimeout(scrollToBottom, 0);
    return;
  }

  if (pickerMode) {
    choicesEl.innerHTML = adventureIndex.map(a => `
      <button class="choice-btn picker-btn" data-adventure-id="${a.id}">${a.title}</button>
    `).join('');

    choicesEl.querySelectorAll('.picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pickerMode = false;
        startAdventure(btn.dataset.adventureId);
      });
    });
    setTimeout(scrollToBottom, 0);
    return;
  }

  const node = getCurrentNode();
  if (!node) return;

  if (isEnding()) {
    choicesEl.innerHTML = `
      <button class="choice-btn end-btn" data-action="restart">${STRINGS.chatbot.restart}</button>
      <button class="choice-btn end-btn" data-action="new">${STRINGS.chatbot.newAdventure}</button>
      <button class="choice-btn end-btn" data-action="choose">${STRINGS.chatbot.chooseAdventureBtn}</button>
    `;
    choicesEl.querySelector('[data-action="restart"]').addEventListener('click', () => {
      startAdventure(gameState.adventureId);
    });
    choicesEl.querySelector('[data-action="new"]').addEventListener('click', () => {
      startRandomAdventure(gameState.adventureId);
    });
    choicesEl.querySelector('[data-action="choose"]').addEventListener('click', () => {
      pickerMode = true;
      messageHistory.push({ type: 'bot', text: STRINGS.chatbot.chooseAdventure });
      renderMessages();
      renderChoices();
    });
  } else {
    choicesEl.innerHTML = node.options.map(opt => `
      <button class="choice-btn" data-target="${opt.target}">${opt.text}</button>
    `).join('');

    choicesEl.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleChoice(parseInt(btn.dataset.target, 10));
      });
    });
  }

  setTimeout(scrollToBottom, 0);
}

/* ---------- UI construction ---------- */

function buildChatbotUI() {
  const container = document.getElementById('chatbot-container');
  if (!container) return;

  container.innerHTML = `
    <div class="chatbot-bar" id="chatbot-bar">
      <div class="chatbot-bar-inner" id="chatbot-toggle">
        <span class="chatbot-bar-title">${STRINGS.chatbot.title}</span>
        <span class="chatbot-bar-arrow" id="chatbot-arrow">&#9650;</span>
      </div>
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-choices" id="chatbot-choices"></div>
      </div>
    </div>
  `;

  const toggle = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');

  const arrow = document.getElementById('chatbot-arrow');

  toggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    arrow.classList.toggle('open', chatWindow.classList.contains('open'));
    if (chatWindow.classList.contains('open')) {
      const messagesEl = document.getElementById('chatbot-messages');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  });

  if (window.innerWidth > 768) {
    chatWindow.classList.add('open');
    arrow.classList.add('open');
  }
}

/* ---------- Init ---------- */

async function initChatbot() {
  buildChatbotUI();

  try {
    await loadAdventureIndex();
  } catch (e) {
    messageHistory = [{ type: 'bot', text: STRINGS.chatbot.loadError }];
    renderMessages();
    return;
  }

  const saved = loadSavedState();

  if (saved && saved.adventureId && saved.chosenPath && saved.chosenPath.length > 0) {
    try {
      currentAdventure = await loadAdventure(saved.adventureId);
      gameState = saved;
      messageHistory = [{ type: 'bot', text: `— ${currentAdventure.title} —` }];
      messageHistory = messageHistory.concat(replayPath(currentAdventure, gameState.chosenPath));
      renderMessages();
      renderChoices();
      return;
    } catch (e) { /* fall through to new adventure */ }
  }

  showWelcome();
}

document.addEventListener('DOMContentLoaded', initChatbot);
