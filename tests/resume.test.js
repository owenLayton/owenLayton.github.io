beforeAll(() => {
  loadScript('js/resume.js');
});

beforeEach(() => {
  document.body.innerHTML = '<main class="main-content" id="resume-page"></main>';
  document.title = '';
});

/* ==========================================
   DOM rendering
   ========================================== */

describe('buildResumePage', () => {
  test('renders page heading and download button', () => {
    buildResumePage();

    const heading = document.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe(STRINGS.resume.heading);

    const downloadLink = document.querySelector('a[href="assets/cv.pdf"]');
    expect(downloadLink).not.toBeNull();
    expect(downloadLink.hasAttribute('download')).toBe(true);
  });

  test('sets document title', () => {
    buildResumePage();
    expect(document.title).toBe(STRINGS.resume.pageTitle);
  });

  test('renders canvas container for PDF', () => {
    buildResumePage();

    const container = document.getElementById('cv-canvas-container');
    expect(container).not.toBeNull();
    expect(container.classList.contains('cv-canvas-container')).toBe(true);
  });

  test('renders header with heading and download button together', () => {
    buildResumePage();

    const header = document.querySelector('.resume-header');
    expect(header).not.toBeNull();
    expect(header.querySelector('h1')).not.toBeNull();
    expect(header.querySelector('a[download]')).not.toBeNull();
  });
});

/* ==========================================
   renderPDFPages
   ========================================== */

describe('renderPDFPages', () => {
  test('shows fallback message when pdfjsLib is not available', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // pdfjsLib is not defined in jsdom
    await renderPDFPages('assets/cv.pdf', container);

    expect(container.innerHTML).toContain('Unable to load PDF viewer');
  });
});
