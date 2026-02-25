/* ========================================
   Resume Page — Renders CV as PDF via pdf.js
   Uses STRINGS from js/strings.js
   ======================================== */

function buildResumePage() {
  const s = STRINGS.resume;
  document.title = s.pageTitle;

  document.getElementById('resume-page').innerHTML = `
    <div class="resume-header">
      <h1>${s.heading}</h1>
      <a href="assets/cv.pdf" download="owen_layton_cv.pdf" class="btn btn-secondary">${s.downloadCV}</a>
    </div>
    <div class="cv-canvas-container" id="cv-canvas-container"></div>
  `;

  renderPDFPages('assets/cv.pdf', document.getElementById('cv-canvas-container'));
}

async function renderPDFPages(url, container) {
  if (typeof pdfjsLib === 'undefined') {
    container.innerHTML = '<p>Unable to load PDF viewer.</p>';
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    const pdf = await pdfjsLib.getDocument(url).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const canvas = document.createElement('canvas');
      canvas.className = 'cv-page-canvas';
      container.appendChild(canvas);

      const containerWidth = container.clientWidth;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale: scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      }).promise;
    }
  } catch (e) {
    container.innerHTML = '<p>Unable to load resume PDF.</p>';
  }
}

document.addEventListener('DOMContentLoaded', buildResumePage);
