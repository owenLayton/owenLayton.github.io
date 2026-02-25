# Owen Layton — Game Developer Portfolio

A static portfolio website built with plain HTML, CSS, and JavaScript. Hosted on GitHub Pages.

## Project Structure

```
index.html              About / home page
games.html              Games portfolio (grid + detail views)
contact.html            Contact form (Formspree)
404.html                Custom 404 page
css/styles.css          All styles (CSS custom properties for theming)
js/strings.js           All user-facing text and game data (edit this to update content)
js/sidebar.js           Shared sidebar navigation
js/games.js             Games page rendering
js/chatbot.js           Button-driven adventure chatbot
data/adventure-index.json       Adventure manifest
data/adventures/*.json          Individual adventure files
tools/editor.html               Visual adventure editor (dev tool)
tests/                          Unit tests (Jest)
```

## Updating Content

Most content changes only require editing `js/strings.js`:

- **Bio / About text** — `STRINGS.about` (name, tagline, bio, highlights)
- **Game entries** — `STRINGS.gameData` (add/remove game objects)
- **Contact page text** — `STRINGS.contact`
- **Sidebar labels** — `STRINGS.sidebar`
- **Chatbot UI text** — `STRINGS.chatbot`

## Adding a New Adventure

1. Open `tools/editor.html` in a browser to use the visual editor
2. Create or load an adventure, edit nodes, and validate
3. Export the JSON file to `data/adventures/`
4. Add an entry to `data/adventure-index.json`:
   ```json
   { "id": "your-id", "title": "Your Title", "file": "data/adventures/your-id.json" }
   ```
5. Run `npm test` to validate the adventure structure

### Adventure Editor

Open `tools/editor.html` directly in a browser (no server needed). Features:

- **Visual graph** — nodes and connections rendered on an interactive canvas
- **JSON editor** — syntax-highlighted, syncs in real-time with the graph
- **Validation** — checks unique IDs, valid targets, reachability, and endings
- **Load/Export** — load existing adventure files, export new ones
- **Interactions** — click to select, drag to reposition, scroll to zoom, pan the canvas

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

- Node `id` values must be unique integers within the adventure
- Every `target` must reference an existing node `id`
- Nodes with `"options": []` are endings
- All nodes must be reachable from the first node

## Testing

### Prerequisites

```
npm install
```

### Run Tests

```
npm test
```

### Test Suites

| Suite | File | What it tests |
|---|---|---|
| Strings | `tests/strings.test.js` | Data integrity, required properties, template functions, slug uniqueness |
| Chatbot | `tests/chatbot.test.js` | Pure logic, localStorage, fetch, DOM rendering, full integration |
| Games | `tests/games.test.js` | Game lookup, grid/detail rendering, URL routing |
| Sidebar | `tests/sidebar.test.js` | DOM structure, nav links, active states, event handling |
| Data | `tests/data.test.js` | Adventure JSON structure, unique IDs, valid targets, graph reachability |

The data validation tests (`data.test.js`) automatically check every adventure file listed in `adventure-index.json`, so adding a new adventure and running `npm test` will catch structural errors like missing targets or unreachable nodes.

## Development

No build step required. Open any `.html` file with a local server (e.g. `npx serve`) to develop locally. The `fetch()` calls for adventure data require HTTP, so `file://` won't work.

## Deployment

Push to GitHub and enable GitHub Pages on the target branch. No build step needed.
