beforeAll(() => {
  loadScript('js/sidebar.js');
});

beforeEach(() => {
  document.body.innerHTML = '<div id="sidebar-container"></div>';
  // Default to index.html
  delete window.location;
  window.location = new URL('http://localhost/index.html');
});

/* ==========================================
   DOM rendering
   ========================================== */

describe('buildSidebar', () => {
  test('creates sidebar nav with correct structure', () => {
    buildSidebar();
    expect(document.getElementById('sidebar')).not.toBeNull();
    expect(document.getElementById('hamburger-btn')).not.toBeNull();
    expect(document.querySelector('.sidebar-nav')).not.toBeNull();
    expect(document.querySelector('.sidebar-header h2').textContent).toBe(STRINGS.sidebar.header);
  });

  test('includes About Me, Resume, Games, and Contact links', () => {
    buildSidebar();
    const nav = document.querySelector('.sidebar-nav');
    const links = nav.querySelectorAll('a');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));

    expect(hrefs).toContain('index.html');
    expect(hrefs).toContain('resume.html');
    expect(hrefs).toContain('games.html');
    expect(hrefs).toContain('contact.html');
  });

  test('sidebar header links to index.html', () => {
    buildSidebar();
    const headerLink = document.querySelector('.sidebar-header-link');
    expect(headerLink).not.toBeNull();
    expect(headerLink.getAttribute('href')).toBe('index.html');
  });

  test('games link navigates to games.html', () => {
    buildSidebar();
    const gamesLink = document.querySelector('.dropdown-link');
    expect(gamesLink).not.toBeNull();
    expect(gamesLink.getAttribute('href')).toBe('games.html');
    expect(gamesLink.textContent).toContain('Games');
  });

  test('includes sidebar canvas and scroll wrapper', () => {
    buildSidebar();
    const sidebar = document.getElementById('sidebar');
    expect(sidebar.querySelector('#shader-sidebar-canvas')).not.toBeNull();
    expect(sidebar.querySelector('.sidebar-scroll')).not.toBeNull();
    expect(sidebar.querySelector('.sidebar-scroll .sidebar-header')).not.toBeNull();
    expect(sidebar.querySelector('.sidebar-scroll .sidebar-nav')).not.toBeNull();
  });

  test('games dropdown arrow is separate from link', () => {
    buildSidebar();
    const row = document.querySelector('.dropdown-row');
    expect(row).not.toBeNull();
    expect(row.querySelector('.dropdown-link')).not.toBeNull();
    expect(row.querySelector('.dropdown-arrow')).not.toBeNull();
    expect(document.getElementById('games-dropdown-toggle').tagName).toBe('BUTTON');
  });

  test('renders professional and personal categories', () => {
    buildSidebar();
    const categories = document.querySelectorAll('.dropdown-category');
    const categoryTexts = Array.from(categories).map(c => c.textContent);

    expect(categoryTexts).toContain(STRINGS.sidebar.categoryProfessional);
    expect(categoryTexts).toContain(STRINGS.sidebar.categoryPersonal);
  });

  test('renders game links from GAME_INDEX', () => {
    buildSidebar();
    const dropdown = document.getElementById('games-dropdown');
    const gameLinks = dropdown.querySelectorAll('a');

    GAME_INDEX.forEach(game => {
      const link = Array.from(gameLinks).find(a => a.textContent === game.title);
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe(`games.html?game=${game.slug}`);
    });
  });

  test('marks About Me as active on index.html', () => {
    delete window.location;
    window.location = new URL('http://localhost/index.html');
    buildSidebar();

    const aboutLink = document.querySelector('.sidebar-nav a[href="index.html"]');
    expect(aboutLink.classList.contains('active')).toBe(true);
  });

  test('marks Resume as active on resume.html', () => {
    delete window.location;
    window.location = new URL('http://localhost/resume.html');
    buildSidebar();

    const resumeLink = document.querySelector('a[href="resume.html"]');
    expect(resumeLink.classList.contains('active')).toBe(true);
  });

  test('marks Games as active on games.html', () => {
    delete window.location;
    window.location = new URL('http://localhost/games.html');
    buildSidebar();

    const gamesLink = document.querySelector('.dropdown-link');
    expect(gamesLink.classList.contains('active')).toBe(true);
  });

  test('marks Contact as active on contact.html', () => {
    delete window.location;
    window.location = new URL('http://localhost/contact.html');
    buildSidebar();

    const contactLink = document.querySelector('a[href="contact.html"]');
    expect(contactLink.classList.contains('active')).toBe(true);
  });

  test('marks correct game as active when ?game= parameter present', () => {
    const slug = GAME_INDEX[0].slug;
    delete window.location;
    window.location = new URL(`http://localhost/games.html?game=${slug}`);
    buildSidebar();

    const gameLink = document.querySelector(`a[href="games.html?game=${slug}"]`);
    expect(gameLink.classList.contains('active')).toBe(true);
  });

  test('opens games dropdown on games.html', () => {
    delete window.location;
    window.location = new URL('http://localhost/games.html');
    buildSidebar();

    const toggle = document.getElementById('games-dropdown-toggle');
    const dropdown = document.getElementById('games-dropdown');
    expect(toggle.classList.contains('open')).toBe(true);
    expect(dropdown.classList.contains('open')).toBe(true);
  });

  test('does not auto-open games dropdown on non-games pages', () => {
    delete window.location;
    window.location = new URL('http://localhost/index.html');
    buildSidebar();

    const toggle = document.getElementById('games-dropdown-toggle');
    const dropdown = document.getElementById('games-dropdown');
    expect(toggle.classList.contains('open')).toBe(false);
    expect(dropdown.classList.contains('open')).toBe(false);
  });
});

/* ==========================================
   Events
   ========================================== */

describe('sidebar events', () => {
  beforeEach(() => {
    buildSidebar();
  });

  test('games dropdown arrow opens/closes on click', () => {
    const toggle = document.getElementById('games-dropdown-toggle');
    const dropdown = document.getElementById('games-dropdown');

    toggle.click();
    expect(toggle.classList.contains('open')).toBe(true);
    expect(dropdown.classList.contains('open')).toBe(true);

    toggle.click();
    expect(toggle.classList.contains('open')).toBe(false);
    expect(dropdown.classList.contains('open')).toBe(false);
  });

  test('hamburger toggles sidebar open/close', () => {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(true);
    expect(sidebar.classList.contains('open')).toBe(true);

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(false);
    expect(sidebar.classList.contains('open')).toBe(false);
  });

  test('clicking outside sidebar closes it', () => {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');

    // Open sidebar
    hamburger.click();
    expect(sidebar.classList.contains('open')).toBe(true);

    // Click outside (on body)
    const outsideClick = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(outsideClick);

    expect(sidebar.classList.contains('open')).toBe(false);
    expect(hamburger.classList.contains('active')).toBe(false);
  });
});
