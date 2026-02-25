/* ========================================
   Sidebar — Shared navigation component
   Injected on every page via #sidebar-container
   Uses STRINGS from js/strings.js
   Uses GAME_INDEX from js/game-registry.js
   ======================================== */

function buildSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const s = STRINGS.sidebar;
  const games = GAME_INDEX;

  const professionalGames = games.filter(g => g.category === 'professional');
  const personalGames = games.filter(g => g.category === 'personal');

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const urlParams = new URLSearchParams(window.location.search);
  const currentGame = urlParams.get('game');

  function activeClass(page) {
    return currentPage === page && !currentGame ? 'active' : '';
  }

  function gameActiveClass(slug) {
    return currentGame === slug ? 'active' : '';
  }

  const gameLinks = (list) =>
    list.map(g => `<li><a href="games.html?game=${g.slug}" class="${gameActiveClass(g.slug)}">${g.title}</a></li>`).join('');

  const isGamesPage = currentPage === 'games.html';

  container.innerHTML = `
    <button class="hamburger" id="hamburger-btn" aria-label="${s.hamburgerLabel}">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <nav class="sidebar" id="sidebar">
      <canvas id="shader-sidebar-canvas"></canvas>
      <div class="sidebar-scroll">
        <div class="sidebar-header">
          <a href="index.html" class="sidebar-header-link"><h2>${s.header}</h2></a>
        </div>
        <ul class="sidebar-nav">
          <li><a href="index.html" class="${activeClass('index.html')}">${s.aboutMe}</a></li>
          <li><a href="resume.html" class="${activeClass('resume.html')}">${s.resume}</a></li>
          <li>
            <div class="dropdown-row">
              <a href="games.html" class="dropdown-link ${activeClass('games.html')}">${s.games}</a>
              <button class="dropdown-arrow ${isGamesPage ? 'open' : ''}" id="games-dropdown-toggle" aria-label="Toggle games list"></button>
            </div>
            <ul class="dropdown-submenu ${isGamesPage ? 'open' : ''}" id="games-dropdown">
              <li class="dropdown-category">${s.categoryProfessional}</li>
              ${gameLinks(professionalGames)}
              <li class="dropdown-category">${s.categoryPersonal}</li>
              ${gameLinks(personalGames)}
            </ul>
          </li>
          <li><a href="contact.html" class="${activeClass('contact.html')}">${s.contact}</a></li>
        </ul>
      </div>
    </nav>
  `;

  initSidebarEvents();
}

function initSidebarEvents() {
  const toggle = document.getElementById('games-dropdown-toggle');
  const dropdown = document.getElementById('games-dropdown');

  if (toggle && dropdown) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      dropdown.classList.toggle('open');
    });
  }

  const hamburger = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('active');
        sidebar.classList.remove('open');
      }
    });
  }
}

async function initSidebar() {
  try {
    await loadGameIndex();
  } catch (e) {
    console.error('Failed to load game index for sidebar:', e);
  }
  buildSidebar();
  if (typeof initSidebarShader === 'function') {
    initSidebarShader();
  }
}

document.addEventListener('DOMContentLoaded', initSidebar);
