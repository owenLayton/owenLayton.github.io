# Owen Layton — Game Developer Portfolio

A static portfolio website built with vanilla HTML, CSS, and JavaScript. Features WebGL synthwave shader backgrounds, a game showcase with image/GIF/video support, a PDF resume viewer, an interactive adventure chatbot, and a contact form. Hosted on GitHub Pages.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Updating Content](#updating-content)
  - [About / Bio](#about--bio)
  - [Adding Media to the Bio](#adding-media-to-the-bio)
  - [Highlights / At a Glance](#highlights--at-a-glance)
  - [Profile Photo](#profile-photo)
- [Games](#games)
  - [Adding a New Game](#adding-a-new-game)
  - [Game Index Fields](#game-index-fields)
  - [Game Detail Fields](#game-detail-fields)
  - [Gallery Items with Captions](#gallery-items-with-captions)
  - [Video Items with Captions](#video-items-with-captions)
  - [GIF Support](#gif-support)
  - [YouTube URL Handling](#youtube-url-handling)
- [Resume / CV](#resume--cv)
- [Contact Form](#contact-form)
- [Adventures (Chatbot)](#adventures-chatbot)
  - [Adding a New Adventure](#adding-a-new-adventure)
  - [Adventure JSON Format](#adventure-json-format)
  - [Adventure Editor](#adventure-editor)
- [Sidebar Navigation](#sidebar-navigation)
- [Shader Backgrounds](#shader-backgrounds)
  - [Main Background Shader](#main-background-shader)
  - [Sidebar Shader](#sidebar-shader)
  - [Performance & Accessibility](#performance--accessibility)
  - [Shader Configuration](#shader-configuration)
- [Adding a New Page](#adding-a-new-page)
- [Styling & Theming](#styling--theming)
  - [CSS Custom Properties](#css-custom-properties)
  - [Key CSS Classes](#key-css-classes)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Suites](#test-suites)
  - [Writing New Tests](#writing-new-tests)
- [Deployment](#deployment)

---

## Project Structure

```
index.html                  Home / About Me page
games.html                  Games portfolio (grid + detail views)
resume.html                 Resume page (PDF viewer + download)
contact.html                Contact form (Formspree)
404.html                    Custom 404 page

css/
  styles.css                All styles (CSS custom properties for theming)

js/
  strings.js                All user-facing text and content data
  utils.js                  Shared utilities (fetchJSON, toEmbedUrl)
  sidebar.js                Sidebar navigation (shared across pages)
  games.js                  Games page rendering (grid + detail)
  game-registry.js          Game data loading (async JSON)
  resume.js                 Resume page (pdf.js canvas rendering)
  chatbot.js                Adventure chatbot (localStorage state)
  shaders.js                WebGL shader backgrounds (synthwave)

data/
  game-index.json           Game manifest (list of all games)
  games/*.json              Individual game detail files
  adventure-index.json      Adventure manifest
  adventures/*.json         Individual adventure files

assets/
  cv.pdf                    Resume PDF file
  <game-slug>/              Game-specific images, GIFs, videos
  about-me/                 About page images

tests/
  setup.js                  Test environment initialisation
  *.test.js                 Jest test suites

tools/
  editor.html               Visual adventure editor (dev tool)
```

---

## Getting Started

**Prerequisites:** Node.js (for testing only — the site itself needs no build step).

```bash
# Install test dependencies
npm install

# Start local dev server
npm run dev
# Opens at http://localhost:3000

# Run tests
npm test
```

The site uses `fetch()` for JSON data, so you need an HTTP server — `file://` won't work.

---

## Updating Content

Almost all text content lives in `js/strings.js` in the `STRINGS` object. Edit this file to update what appears on the site.

### About / Bio

Edit `STRINGS.about` in `js/strings.js`:

```javascript
about: {
  pageTitle: 'Owen Layton — Game Developer Portfolio',
  name: 'Owen Layton',
  photoAlt: 'Photo of Owen Layton',
  tagline: 'Software Engineer &amp; Game Developer',
  introParagraph: 'Welcome to my portfolio! ...',

  sectionTitle: 'About Me',
  bio: [
    'First paragraph of text...',
    'Second paragraph of text...',
  ],
  // ...
}
```

The `bio` array supports both plain strings (rendered as `<p>` tags) and media objects (see below).

### Adding Media to the Bio

You can mix text and media freely in the `bio` array. Each media object needs a `type`, `src`, and optionally `alt` and `caption`:

```javascript
bio: [
  'A paragraph of text...',

  // Static image with caption
  {
    type: 'image',
    src: 'assets/about-me/team-photo.png',
    alt: 'Team photo',
    caption: 'Our team at GDC 2024'
  },

  'Another paragraph...',

  // Animated GIF with caption
  {
    type: 'gif',
    src: 'assets/about-me/gameplay-demo.gif',
    alt: 'Gameplay demo',
    caption: 'Early prototype of the combat system'
  },

  'More text...',

  // YouTube video with caption
  {
    type: 'video',
    src: 'https://www.youtube.com/watch?v=VIDEO_ID',
    alt: 'Project demo',
    caption: 'A walkthrough of my latest project'
  },
],
```

**Supported types:**
| Type | Renders as | Notes |
|------|-----------|-------|
| `'image'` | `<img>` | Scaled to max-width 720px |
| `'gif'` | `<img>` with no height constraint | Animates automatically |
| `'video'` | `<iframe>` (16:9) | YouTube URLs auto-converted to embed format |

All three types support an optional `caption` that renders as italic text below the media.

### Highlights / At a Glance

Edit the `highlights` array in `STRINGS.about`:

```javascript
highlights: [
  { title: 'Engines &amp; Tools', text: 'Unity' },
  { title: 'Languages', text: 'C#, JavaScript, Java, C++' },
  { title: 'Disciplines', text: 'Gameplay programming, systems design' },
  { title: 'Interests', text: 'Creative tech, procedural generation' },
],
```

These render in a 2-column grid on the About page.

### Profile Photo

Replace the `src` attribute in `index.html` (line ~45) or place your image in `assets/about-me/` and update the path.

---

## Games

Games are data-driven via JSON files. The game index and individual game details are loaded asynchronously.

### Adding a New Game

1. **Create the game detail file** at `data/games/your-slug.json` (see fields below)
2. **Add an entry** to `data/game-index.json`:
   ```json
   {
     "slug": "your-slug",
     "title": "Your Game Title",
     "category": "professional",
     "subtitle": "A short description of your game.",
     "heroImage": "assets/your-slug/hero.png",
     "file": "data/games/your-slug.json"
   }
   ```
3. **Add game assets** to `assets/your-slug/` (images, GIFs, etc.)
4. **Run tests** to validate: `npm test`

The game will automatically appear in the sidebar dropdown and games grid.

### Game Index Fields

These fields appear in `data/game-index.json` and control the grid card display:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | URL-safe identifier (used in `?game=slug`) |
| `title` | string | Yes | Game name |
| `category` | string | Yes | `"professional"` or `"personal"` |
| `subtitle` | string | Yes | Short description (truncated to 120 chars on cards) |
| `heroImage` | string | No | Image URL for the card thumbnail |
| `heroGif` | string | No | Animated GIF for the card (takes priority over heroImage) |
| `file` | string | Yes | Path to the game detail JSON file |

### Game Detail Fields

These fields go in `data/games/your-slug.json`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Must match the index entry |
| `title` | string | Yes | Game name |
| `category` | string | Yes | `"professional"` or `"personal"` |
| `subtitle` | string | Yes | Shown as italic subheader |
| `description` | string or string[] | No | Paragraph or bullet list |
| `heroImage` | string | No | Large image at top of detail page |
| `heroGif` | string | No | Animated GIF hero (takes priority over heroImage) |
| `heroVideo` | string | No | YouTube or embed URL for hero video |
| `gallery` | array | No | Screenshots/GIFs (strings or objects, see below) |
| `videos` | array | No | Additional video embeds (strings or objects, see below) |
| `role` | string | No | Your role on the project |
| `tools` | string[] | No | Technologies used |
| `platforms` | string[] | No | Target platforms |

**Example:**
```json
{
  "slug": "my-game",
  "title": "My Game",
  "category": "personal",
  "subtitle": "A puzzle game built in Unity.",
  "description": [
    "Designed and built all gameplay systems.",
    "Implemented procedural level generation."
  ],
  "heroImage": "assets/my-game/hero.png",
  "heroVideo": "https://www.youtube.com/watch?v=VIDEO_ID",
  "gallery": [
    "assets/my-game/screenshot1.png",
    { "src": "assets/my-game/screenshot2.png", "caption": "The main menu" },
    { "src": "assets/my-game/demo.gif", "caption": "Combat system demo" }
  ],
  "videos": [
    { "src": "https://www.youtube.com/watch?v=ABC123", "caption": "Devlog #1" }
  ],
  "role": "Solo Developer",
  "tools": ["Unity", "C#"],
  "platforms": ["Windows", "WebGL"]
}
```

### Gallery Items with Captions

Gallery items can be either a plain URL string or an object with `src` and `caption`:

```json
"gallery": [
  "assets/screenshot1.png",
  { "src": "assets/screenshot2.png", "caption": "Level editor view" },
  { "src": "assets/gameplay.gif", "caption": "Gameplay loop demo" }
]
```

Plain strings render without a caption. You can mix both formats freely.

### Video Items with Captions

Same pattern as gallery — plain URL or object with caption:

```json
"videos": [
  "https://www.youtube.com/watch?v=VIDEO_ID",
  { "src": "https://www.youtube.com/watch?v=OTHER_ID", "caption": "Launch trailer" }
]
```

### GIF Support

GIFs are detected automatically by file extension. When a URL ends in `.gif`:

- **Gallery GIFs** get `height: auto` instead of the fixed 180px crop, so the full animation is visible
- **Hero GIFs** (`heroGif` field) use `object-fit: contain` with no max-height, showing the full image

Use the `heroGif` field instead of `heroImage` when you want an animated hero.

### YouTube URL Handling

YouTube URLs are automatically converted to embed format. All of these work:

```
https://www.youtube.com/watch?v=VIDEO_ID     -> auto-converted
https://youtu.be/VIDEO_ID                     -> auto-converted
https://www.youtube.com/embed/VIDEO_ID        -> used as-is
```

This applies to `heroVideo`, `videos` arrays, and bio video objects.

---

## Resume / CV

The resume page (`resume.html`) renders your PDF using pdf.js canvas rendering — no browser PDF toolbar.

- **PDF file:** Place your CV at `assets/cv.pdf`
- **Download filename:** Downloads as `owen_layton_cv.pdf` (configured in both `js/resume.js` and `index.html`)
- **Page text:** Edit `STRINGS.resume` in `js/strings.js`

To change the download filename, update the `download="..."` attribute in:
- `js/resume.js` (resume page download button)
- `index.html` (about page download button)

---

## Contact Form

The contact form (`contact.html`) submits to [Formspree](https://formspree.io).

- **Form endpoint:** Set in `contact.html` (the `action` attribute on the `<form>`)
- **Form labels & placeholders:** Edit `STRINGS.contact` in `js/strings.js`
- **Styling:** Form inputs have a yellow outline for visibility against the shader background

To use your own Formspree endpoint, update the form action URL in `contact.html`.

---

## Adventures (Chatbot)

The Adventure Bot is an interactive text adventure chatbot that appears at the bottom of every page. Players make choices via buttons, and their progress is saved to `localStorage`.

### Adding a New Adventure

1. Open `tools/editor.html` in a browser to use the visual editor
2. Create or load an adventure, edit nodes, and validate
3. Export the JSON file to `data/adventures/`
4. Add an entry to `data/adventure-index.json`:
   ```json
   { "id": "your-id", "title": "Your Title", "file": "data/adventures/your-id.json" }
   ```
5. Run `npm test` to validate the adventure structure

The data tests (`data.test.js`) automatically validate every adventure in the index, checking for unique IDs, valid targets, reachable nodes, and at least one ending.

### Adventure JSON Format

```json
{
  "title": "Adventure Title",
  "nodes": [
    {
      "id": 1,
      "text": "Story text shown to the player.",
      "options": [
        { "text": "Button label", "target": 2 },
        { "text": "Another choice", "target": 3 }
      ]
    },
    {
      "id": 2,
      "text": "An ending node has an empty options array.",
      "options": []
    }
  ]
}
```

**Rules:**
- Node `id` values must be unique integers
- Every `target` must reference an existing node `id`
- Nodes with `"options": []` are endings
- All nodes must be reachable from the first node
- No dead-end loops (single-option cycles with no escape)

### Adventure Editor

Open `tools/editor.html` directly in a browser (no server needed).

**Features:**
- **Visual graph** — nodes and connections on an interactive canvas
- **JSON editor** — syntax-highlighted, syncs in real-time with the graph
- **Validation** — checks unique IDs, valid targets, reachability, and endings
- **Load/Export** — load existing adventure files, export new ones
- **Interactions** — click to select, drag to reposition, scroll to zoom, pan the canvas

---

## Sidebar Navigation

The sidebar (`js/sidebar.js`) is shared across all pages. It includes:

- **Header link** — links to `index.html`
- **Navigation links** — About Me, Resume, Games (with dropdown), Contact
- **Games dropdown** — split button: clicking "Games" navigates to `games.html`, clicking the arrow toggles the submenu
- **Game submenu** — auto-populated from `data/game-index.json`, organised by professional/personal categories
- **Active state** — current page link is highlighted automatically
- **Mobile hamburger** — responsive menu toggle on small screens
- **Shader canvas** — subtle plasma shader behind the nav (see Shader section)

The sidebar content (labels, category names) is configured in `STRINGS.sidebar` in `js/strings.js`.

---

## Shader Backgrounds

The site uses WebGL fragment shaders for animated backgrounds (`js/shaders.js`).

### Main Background Shader

A full-viewport canvas (`#shader-bg-canvas`) behind all content, rendering:
- **Gradient sky** — deep purple to hot pink
- **Retro sun** — with horizontal scan-line gaps, aspect-ratio corrected to stay circular
- **Perspective grid** — scrolling toward the viewer, aspect-ratio corrected for square cells
- **Star field** — twinkling stars with randomised speed and phase, aspect-ratio corrected for consistent size
- **Vignette** — darkens edges for text readability
- **Brightness** — 0.7 multiplier to keep content readable

### Sidebar Shader

A canvas (`#shader-sidebar-canvas`) behind the sidebar nav, rendering a subtle slow-moving plasma using the accent colours (purple, pink, cyan) with very low opacity blending (0.06–0.12).

### Performance & Accessibility

- **WebGL2 → WebGL1 fallback** — automatically tries WebGL2, falls back to WebGL1 if unavailable
- **CSS gradient fallback** — if WebGL is completely unavailable, existing CSS gradients are preserved (the `body.webgl-active` class is only added when shaders work)
- **Render resolution** — canvases render at 50% resolution (35% on mobile) for performance
- **Tab visibility** — animation pauses when the tab is hidden
- **`prefers-reduced-motion`** — renders a single static frame instead of animating

### Shader Configuration

Key values in `js/shaders.js`:

```javascript
var CONFIG = {
  pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
  mainScale: 0.5,        // render resolution (0.35 on mobile)
  sidebarScale: 0.5,
};
```

**Main shader tunables** (in `MAIN_FRAG_SRC`):
- Horizon position: `float hy = 0.38`
- Sun position: `hy + 0.18`, radius `0.14`
- Grid scroll speed: `t * 1.5`
- Star cell size: `120.0`, threshold `0.985`
- Star twinkle speed range: `0.8` to `2.8`
- Brightness: `col *= 0.7`
- Vignette strength: `* 0.6`

**Sidebar shader tunables** (in `SIDEBAR_FRAG_SRC`):
- Animation speed: `uTime * 0.12`
- Purple mix: `0.12`, Pink mix: `0.08`, Cyan mix: `0.06`

---

## Adding a New Page

1. **Create the HTML file** — copy an existing page (e.g. `contact.html`) as a template
2. **Include required elements:**
   ```html
   <canvas id="shader-bg-canvas"></canvas>
   <div class="page-wrapper">
     <div id="sidebar-container"></div>
     <main class="main-content" id="main-content">
       <div id="your-page"></div>
     </main>
   </div>
   <div id="chatbot-container"></div>
   ```
3. **Include shared scripts** (in this order):
   ```html
   <script src="js/shaders.js"></script>
   <script src="js/strings.js"></script>
   <script src="js/utils.js"></script>
   <script src="js/game-registry.js"></script>
   <script src="js/sidebar.js"></script>
   <script src="js/chatbot.js"></script>
   ```
4. **Add page-specific script** after the shared scripts
5. **Add strings** to `js/strings.js` under a new section in the `STRINGS` object
6. **Add sidebar link** — edit `js/sidebar.js` to add a link in the nav, and update `js/strings.js` for the label
7. **Add tests** in `tests/` for the new page

---

## Styling & Theming

All styles live in `css/styles.css`. The synthwave theme is controlled via CSS custom properties.

### CSS Custom Properties

```css
/* Backgrounds */
--bg-primary: #0d0221;
--bg-secondary: #150535;
--bg-card: #1a0a3e;

/* Text */
--text-primary: #e8e0f0;
--text-secondary: #f0eaf7;

/* Accent colours */
--accent-pink: #ff2a6d;
--accent-purple: #b537f2;
--accent-cyan: #05d9e8;
--accent-yellow: #f9f002;
--accent-green: #39ff14;
--accent-orange: #ff6c11;

/* Neon glows */
--neon-pink: 0 0 20px rgba(255, 42, 109, 0.4);
--neon-cyan: 0 0 20px rgba(5, 217, 232, 0.4);
--neon-purple: 0 0 20px rgba(181, 55, 242, 0.4);

/* Layout */
--sidebar-width: 260px;
--border-radius: 12px;
--border-radius-sm: 8px;
--transition-speed: 0.3s;
--font-primary: 'Poppins', sans-serif;
```

To change the colour scheme, update these variables at the top of `styles.css`.

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.page-wrapper` | Main flex container (sidebar + content) |
| `.main-content` | Content area with sidebar margin |
| `.sidebar` | Fixed left navigation |
| `.card` | Generic card component with hover effects |
| `.btn`, `.btn-primary`, `.btn-secondary` | Button styles |
| `.game-card` | Game grid card |
| `.game-hero`, `.game-hero.gif` | Hero image/GIF on detail page |
| `.game-hero-video` | Hero video iframe (16:9) |
| `.game-gallery` | Gallery grid |
| `.gallery-item`, `.video-item` | Gallery/video items with optional captions |
| `.bio-media` | Media item in the bio section |
| `.cv-canvas-container` | PDF canvas container |
| `.chatbot-bar-inner` | Chatbot toggle bar |
| `.section-divider` | Horizontal rule separator |

---

## Testing

### Running Tests

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npx jest tests/games.test.js
```

### Test Suites

| Suite | File | What it tests |
|-------|------|---------------|
| Strings | `tests/strings.test.js` | Data integrity of STRINGS, required properties, template functions, bio media objects |
| Chatbot | `tests/chatbot.test.js` | Pure logic, localStorage persistence, fetch, DOM rendering, full integration |
| Games | `tests/games.test.js` | Game lookup, grid/detail rendering, URL routing, hero video embed conversion |
| Sidebar | `tests/sidebar.test.js` | DOM structure, nav links, active states, dropdown, event handling, shader canvas |
| Data | `tests/data.test.js` | Adventure + game JSON structure, unique IDs, valid targets, graph reachability |
| Game Registry | `tests/game-registry.test.js` | Async loading, caching, GAME_INDEX structure, game detail fields |
| Resume | `tests/resume.test.js` | Page rendering, PDF canvas container, download button, error fallback |
| Shaders | `tests/shaders.test.js` | WebGL fallback, canvas visibility, init function exposure |
| Editor | `tests/editor.test.js` | Adventure validator: errors, warnings, stats, dead-end loop detection |

The data tests automatically validate **every** adventure and game file referenced in the index files, so adding new content and running `npm test` will catch structural errors.

### Writing New Tests

Tests use [Jest](https://jestjs.io/) with jsdom. The test setup (`tests/setup.js`):

1. Loads `strings.js`, `utils.js`, and `game-registry.js` into the global scope
2. Pre-loads all game data into `FULL_GAME_DATA`
3. Mocks `loadGameIndex()` and `loadGameDetail()` as synchronous
4. Provides `loadScript(relPath)` to load other JS files (strips `DOMContentLoaded` listeners)

**Example test:**
```javascript
const { loadScript } = require('./setup');
beforeAll(() => loadScript('js/your-page.js'));

test('renders the page', () => {
  document.body.innerHTML = '<div id="your-page"></div>';
  buildYourPage();
  expect(document.querySelector('h1').textContent).toBe('Expected Title');
});
```

**Note:** For WebGL-dependent code, mock `HTMLCanvasElement.prototype.getContext` to return `null` (jsdom doesn't support WebGL):
```javascript
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function () { return null; };
});
```

---

## Deployment

Push to GitHub and enable GitHub Pages on the target branch. No build step needed — the site is entirely static.

```bash
git push origin main
```

The site will be live at `https://owenlayton.github.io/`.
