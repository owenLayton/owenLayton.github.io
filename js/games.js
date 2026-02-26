/* ========================================
   Games Page — Data & Rendering
   Uses STRINGS from js/strings.js
   Uses GAME_INDEX from js/game-registry.js
   ======================================== */

function getGameBySlug(slug) {
  return GAME_INDEX.find(g => g.slug === slug);
}

function isGif(url) {
  return typeof url === 'string' && url.split('?')[0].toLowerCase().endsWith('.gif');
}

function toEmbedUrl(url) {
  if (typeof url !== 'string') return url;
  var match;
  match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  return url;
}

function renderGamesGrid(container) {
  const s = STRINGS.games;
  const professionalGames = GAME_INDEX.filter(g => g.category === 'professional');
  const personalGames = GAME_INDEX.filter(g => g.category === 'personal');

  const cardImage = (game) => {
    const src = game.heroGif || game.heroImage;
    if (!src) return '';
    return `<img src="${src}" alt="${game.title}" class="game-card-image">`;
  };

  const renderCards = (list) => list.map(game => `
    <a href="games.html?game=${game.slug}" class="card game-card">
      ${cardImage(game)}
      <span class="game-category ${game.category}">${game.category}</span>
      <h3>${game.title}</h3>
      <p>${game.subtitle.substring(0, 120)}</p>
    </a>
  `).join('');

  container.innerHTML = `
    <h1>${s.heading}</h1>
    <p>${s.subheading}</p>
    ${professionalGames.length > 0 ? `
      <h2 class="games-category-heading">${s.categoryProfessional}</h2>
      <div class="games-grid">${renderCards(professionalGames)}</div>
    ` : ''}
    ${personalGames.length > 0 ? `
      <h2 class="games-category-heading">${s.categoryPersonal}</h2>
      <div class="games-grid">${renderCards(personalGames)}</div>
    ` : ''}
  `;
}

function renderGameDetail(game, container) {
  const s = STRINGS.games;
  let html = `
    <div class="game-detail">
      <a href="games.html" class="back-link">${s.backLink}</a>
      <h1>${game.title}</h1>
  `;

  if (game.heroGif) {
    html += `<img src="${game.heroGif}" alt="${game.title}" class="game-hero gif">`;
  } else if (game.heroImage) {
    html += `<img src="${game.heroImage}" alt="${game.title}" class="game-hero">`;
  }
  if (game.heroVideo) {
    html += `<iframe src="${toEmbedUrl(game.heroVideo)}" class="game-hero-video" allowfullscreen title="${s.trailerTitle(game.title)}"></iframe>`;
  }

  html += `<p class="game-subtitle">${game.subtitle}</p>`;

  if (game.description) {
    if (Array.isArray(game.description)) {
      html += `<ul class="game-description">${game.description.map(item => `<li>${item}</li>`).join('')}</ul>`;
    } else {
      html += `<p class="game-description">${game.description}</p>`;
    }
  }

  const metaItems = [];
  if (game.role) metaItems.push(`<span class="game-meta-item"><strong>${s.metaRole}</strong> ${game.role}</span>`);
  if (game.tools) metaItems.push(`<span class="game-meta-item"><strong>${s.metaTools}</strong> ${game.tools.join(', ')}</span>`);
  if (game.platforms) metaItems.push(`<span class="game-meta-item"><strong>${s.metaPlatforms}</strong> ${game.platforms.join(', ')}</span>`);

  if (metaItems.length > 0) {
    html += `<div class="game-meta">${metaItems.join('')}</div>`;
  }

  if (game.gallery && game.gallery.length > 0) {
    html += `
      <h2>${s.galleryTitle}</h2>
      <div class="game-gallery">
        ${game.gallery.map(img => `<img src="${img}" alt="${s.screenshotAlt(game.title)}" class="${isGif(img) ? 'gif' : ''}">`).join('')}
      </div>
    `;
  }

  if (game.videos && game.videos.length > 0) {
    html += `
      <h2>${s.videosTitle}</h2>
      <div class="game-videos">
        ${game.videos.map(url => `<iframe src="${toEmbedUrl(url)}" allowfullscreen title="${s.videoTitle(game.title)}"></iframe>`).join('')}
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

async function initGamesPage() {
  const s = STRINGS.games;
  document.title = s.pageTitle;

  const container = document.getElementById('games-content');
  if (!container) return;

  await loadGameIndex();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('game');

  if (slug) {
    const indexEntry = getGameBySlug(slug);
    if (indexEntry) {
      try {
        const game = await loadGameDetail(slug);
        renderGameDetail(game, container);
      } catch (e) {
        container.innerHTML = `<h1>${s.notFoundTitle}</h1><p>${s.notFoundMessage}</p><a href="games.html" class="btn btn-primary">${s.notFoundButton}</a>`;
      }
    } else {
      container.innerHTML = `<h1>${s.notFoundTitle}</h1><p>${s.notFoundMessage}</p><a href="games.html" class="btn btn-primary">${s.notFoundButton}</a>`;
    }
  } else {
    renderGamesGrid(container);
  }
}

document.addEventListener('DOMContentLoaded', initGamesPage);
