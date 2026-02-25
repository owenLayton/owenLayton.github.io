beforeAll(() => {
  // Mock getContext to return null cleanly (jsdom throws instead of returning null)
  HTMLCanvasElement.prototype.getContext = function () { return null; };
  loadScript('js/shaders.js');
});

beforeEach(() => {
  document.body.innerHTML = '<canvas id="shader-bg-canvas"></canvas><div id="sidebar-container"></div>';
  document.body.classList.remove('webgl-active');
});

/* ==========================================
   WebGL fallback (jsdom has no WebGL)
   ========================================== */

describe('WebGL fallback', () => {
  test('hides background canvas when WebGL is unavailable', () => {
    const canvas = document.getElementById('shader-bg-canvas');
    initMainShader();
    expect(canvas.style.display).toBe('none');
  });

  test('does not add webgl-active class when WebGL is unavailable', () => {
    initMainShader();
    expect(document.body.classList.contains('webgl-active')).toBe(false);
  });

  test('does not throw when shader-bg-canvas is missing', () => {
    document.body.innerHTML = '';
    expect(() => initMainShader()).not.toThrow();
  });
});

/* ==========================================
   Sidebar shader API
   ========================================== */

describe('initSidebarShader', () => {
  test('is exposed as a global function', () => {
    expect(typeof window.initSidebarShader).toBe('function');
  });

  test('initMainShader is exposed as a global function', () => {
    expect(typeof window.initMainShader).toBe('function');
  });

  test('does not throw when sidebar canvas is missing', () => {
    expect(() => window.initSidebarShader()).not.toThrow();
  });

  test('hides sidebar canvas when WebGL is unavailable', () => {
    document.body.innerHTML = '<canvas id="shader-sidebar-canvas"></canvas>';
    window.initSidebarShader();
    const canvas = document.getElementById('shader-sidebar-canvas');
    expect(canvas.style.display).toBe('none');
  });
});
