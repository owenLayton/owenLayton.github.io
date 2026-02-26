/* ========================================
   Shader Backgrounds — Synthwave WebGL2
   Renders animated backgrounds on canvas
   elements for main page and sidebar.
   ======================================== */
(function () {
  'use strict';

  /* ---------- Configuration ---------- */

  var CONFIG = {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    mainScale: 0.5,
    sidebarScale: 0.5,

    /* ---------- Post-processing toggles ---------- */
    /* Set to true/false to enable/disable effects   */
    crtScanlines: true,
    filmBurn: true,
  };

  if (window.innerWidth <= 768) {
    CONFIG.mainScale = 0.35;
    CONFIG.sidebarScale = 0.35;
  }

  /* ---------- State ---------- */

  var mainGL = null;
  var sidebarGL = null;
  var mainProgram = null;
  var sidebarProgram = null;
  var mainUniforms = {};
  var sidebarUniforms = {};
  var mainVAO = null;
  var sidebarVAO = null;
  var mainAnimId = null;
  var sidebarAnimId = null;
  var mainRunning = false;
  var sidebarRunning = false;
  var startTime = performance.now() / 1000.0;

  /* ---------- Shared GLSL ---------- */

  var VERT_SRC = [
    '#version 300 es',
    'in vec2 aPosition;',
    'out vec2 vUV;',
    'void main() {',
    '  vUV = aPosition * 0.5 + 0.5;',
    '  gl_Position = vec4(aPosition, 0.0, 1.0);',
    '}',
  ].join('\n');

  var MAIN_FRAG_SRC = [
    '#version 300 es',
    'precision mediump float;',
    'in vec2 vUV;',
    'out vec4 fragColor;',
    'uniform float uTime;',
    'uniform vec2 uResolution;',
    'uniform int uCRT;',
    'uniform int uFilmBurn;',
    '',
    'const vec3 SKY_TOP  = vec3(0.051, 0.008, 0.129);',
    'const vec3 SKY_MID  = vec3(0.22, 0.04, 0.30);',
    'const vec3 HORIZON  = vec3(1.0, 0.165, 0.427);',
    'const vec3 SUN_TOP  = vec3(1.0, 0.85, 0.2);',
    'const vec3 SUN_BOT  = vec3(1.0, 0.165, 0.427);',
    'const vec3 GRID_A   = vec3(0.710, 0.216, 0.949);',
    'const vec3 GRID_B   = vec3(0.020, 0.851, 0.910);',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
    '}',
    '',
    'float sun(vec2 uv, float hy, float aspect) {',
    '  vec2 c = vec2(0.5, hy + 0.18);',
    '  float r = 0.14;',
    '  vec2 d = uv - c;',
    '  d.x *= aspect;',
    '  float dist = length(d);',
    '  float circle = smoothstep(r, r - 0.005, dist);',
    '  float sy = (uv.y - c.y) / r;',
    '  if (sy < 0.0) {',
    '    float sl = step(0.5, fract(sy * 18.0));',
    '    float fade = smoothstep(-1.0, -0.1, sy);',
    '    circle *= mix(sl, 1.0, fade);',
    '  }',
    '  return circle;',
    '}',
    '',
    'float grid(vec2 uv, float hy, float t, float aspect) {',
    '  if (uv.y > hy) return 0.0;',
    '  float depth = hy - uv.y;',
    '  if (depth < 0.001) return 0.0;',
    '  float z = 0.5 / depth;',
    '  float x = (uv.x - 0.5) * aspect * z * 2.0;',
    '  float sz = z + t * 1.5;',
    '  float lx = smoothstep(0.04, 0.0, abs(fract(x) - 0.5) * 2.0 / (z * 0.5 + 1.0));',
    '  float lz = smoothstep(0.04, 0.0, abs(fract(sz * 0.5) - 0.5) * 2.0);',
    '  float g = max(lx, lz);',
    '  g *= (1.0 - exp(-depth * 3.0));',
    '  g *= smoothstep(0.0, 0.05, depth);',
    '  return g;',
    '}',
    '',
    '/* Returns: 0.0 = no building, 1.0 = wall, 2.0 = lit window */',
    'float city(vec2 uv, float hy, float aspect) {',
    '  float ax = uv.x * aspect;',
    '  float wy = uv.y - hy;',
    '',
    '  /* Building columns in aspect-corrected space */',
    '  float bw = 0.035;',
    '  float col_id = floor(ax / bw);',
    '  float within = fract(ax / bw);',
    '  /* Envelope computed from column center so height is stable on resize */',
    '  float colCenter = (col_id + 0.5) * bw;',
    '  float halfSpan = aspect * 0.333;',
    '  float screenCenter = aspect * 0.5;',
    '  float cx = abs(colCenter - screenCenter) / halfSpan;',
    '  float envelope = 1.0 - smoothstep(0.0, 1.0, cx);',
    '  /* Boost: buildings near center are significantly taller */',
    '  float centerBoost = 1.0 + 0.8 * (1.0 - smoothstep(0.0, 0.6, cx));',
    '  if (envelope < 0.01) return 0.0;',
    '  float h1 = hash(vec2(col_id, 0.0));',
    '  float h2 = hash(vec2(col_id, 1.0));',
    '  float h3 = hash(vec2(col_id, 2.0));',
    '  float baseH = (0.015 + h1 * 0.06) * envelope * centerBoost;',
    '  if (h1 > 0.7) baseH += 0.03 * envelope;',
    '  /* Narrow gap between buildings */',
    '  float gap = smoothstep(0.0, 0.02, within) * smoothstep(1.0, 0.98, within);',
    '  /* Building shape variants based on hash */',
    '  float maxH = baseH;',
    '  if (h3 < 0.15) {',
    '    /* Stepped pyramid — 3 tiers getting narrower */',
    '    float tier1 = baseH * 0.5;',
    '    float tier2 = baseH * 0.8;',
    '    float tier3 = baseH;',
    '    if (wy < tier1) { maxH = tier1; }',
    '    else if (within > 0.15 && within < 0.85 && wy < tier2) { maxH = tier2; }',
    '    else if (within > 0.3 && within < 0.7 && wy < tier3) { maxH = tier3; }',
    '    else if (wy >= tier1) { maxH = tier1; }',
    '  } else if (h3 < 0.28) {',
    '    /* Spire / needle — thin antenna on top */',
    '    float spireW = 0.06;',
    '    float spireH = baseH + 0.035 * envelope;',
    '    if (within > 0.5 - spireW && within < 0.5 + spireW && wy < spireH) {',
    '      maxH = spireH;',
    '    }',
    '  } else if (h3 < 0.38) {',
    '    /* Dome top — semicircle cap on the building */',
    '    float domeR = 0.018 * envelope;',
    '    float dx = (within - 0.5) * bw;',
    '    float dy = wy - baseH;',
    '    if (dy > 0.0 && dy < domeR) {',
    '      float domeX = dx / (bw * 0.5);',
    '      float domeEdge = sqrt(max(1.0 - domeX * domeX, 0.0)) * domeR;',
    '      if (dy < domeEdge) maxH = baseH + domeR;',
    '    }',
    '  } else if (h2 > 0.5) {',
    '    /* Tower on top (original style) */',
    '    float towerH = baseH + h2 * 0.025 * envelope;',
    '    float towerW = 0.3 + h2 * 0.2;',
    '    if (within > 0.5 - towerW * 0.5 && within < 0.5 + towerW * 0.5) {',
    '      maxH = towerH;',
    '    }',
    '  }',
    '  float bldg = step(wy, maxH) * step(0.0, wy) * gap;',
    '  if (bldg < 0.5) return 0.0;',
    '  /* Window grid inside building */',
    '  float winRow = fract(wy * 200.0);',
    '  float winCol = fract(within * 4.0);',
    '  float isWinSlot = step(0.25, winRow) * step(winRow, 0.7)',
    '                   * step(0.2, winCol) * step(winCol, 0.75);',
    '  /* Only some windows are lit (hash per window cell) */',
    '  float wid = floor(wy * 200.0) + col_id * 97.0 + floor(within * 4.0) * 31.0;',
    '  float lit = step(0.6, hash(vec2(wid, 2.0)));',
    '  /* Encode tint per window: 2.0 = cyan, 3.0 = full magenta */',
    '  float tint = hash(vec2(wid, 5.0));',
    '  if (isWinSlot > 0.5 && lit > 0.5) return 2.0 + tint;',
    '  return 1.0;',
    '}',
    '',
    'float stars(vec2 uv, float t, float aspect) {',
    '  vec2 auv = vec2(uv.x * aspect, uv.y);',
    '  float cellSize = 120.0;',
    '  vec2 cell = floor(auv * cellSize);',
    '  float h = hash(cell);',
    '  if (h > 0.985) {',
    '    vec2 center = (cell + 0.5) / cellSize;',
    '    float d = length(auv - center) * cellSize;',
    '    float b = smoothstep(0.45, 0.0, d) * (h - 0.985) * 66.0;',
    '    float speed = 0.8 + h * 2.0;',
    '    float phase = h * 6.28 + dot(cell, vec2(3.17, 7.23));',
    '    b *= 0.5 + 0.5 * sin(t * speed + phase);',
    '    return b;',
    '  }',
    '  return 0.0;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = vUV;',
    '  float aspect = uResolution.x / uResolution.y;',
    '  float hy = 0.38;',
    '  vec3 col;',
    '',
    '  if (uv.y > hy) {',
    '    float t = (uv.y - hy) / (1.0 - hy);',
    '    t = pow(t, 0.7);',
    '    col = mix(HORIZON, SKY_MID, smoothstep(0.0, 0.3, t));',
    '    col = mix(col, SKY_TOP, smoothstep(0.3, 1.0, t));',
    '  } else {',
    '    col = vec3(0.02, 0.005, 0.06);',
    '  }',
    '',
    '  if (uv.y > hy + 0.15) {',
    '    col += vec3(stars(uv, uTime, aspect));',
    '  }',
    '',
    '  float sm = sun(uv, hy, aspect);',
    '  if (sm > 0.0) {',
    '    float st = (uv.y - hy) / 0.36;',
    '    vec3 sc = mix(SUN_BOT, SUN_TOP, clamp(st, 0.0, 1.0));',
    '    col = mix(col, sc, sm);',
    '  }',
    '',
    '  col += HORIZON * exp(-abs(uv.y - hy) * 15.0) * 0.25;',
    '',
    '  /* Cityscape silhouette on the horizon */',
    '  float bldg = city(uv, hy, aspect);',
    '  if (bldg > 1.5) {',
    '    float tint = bldg - 2.0;',
    '    vec3 winCol = mix(GRID_B, HORIZON, tint * tint * 0.3);',
    '    col = winCol * 0.7;',
    '  } else if (bldg > 0.5) {',
    '    col = vec3(0.01, 0.005, 0.02);',
    '  }',
    '',
    '  float gv = grid(uv, hy, uTime, aspect);',
    '  vec3 gc = mix(GRID_A, GRID_B, sin(uTime * 0.4) * 0.5 + 0.5);',
    '  col += gc * gv * 0.5;',
    '',
    '  float vig = 1.0 - length((uv - 0.5) * vec2(1.2, 1.0)) * 0.6;',
    '  col *= vig;',
    '  col *= 0.7;',
    '',
    '  /* CRT scanlines + static */',
    '  if (uCRT == 1) {',
    '    float scanline = sin(gl_FragCoord.y * 3.14159) * 0.5 + 0.5;',
    '    col *= 0.85 + 0.15 * scanline;',
    '    float flicker = 0.995 + 0.005 * sin(uTime * 8.0);',
    '    col *= flicker;',
    '    float staticBurst = hash(vec2(floor(uTime * 2.0), 0.0));',
    '    if (staticBurst > 0.85) {',
    '      float noise = hash(gl_FragCoord.xy + fract(uTime * 100.0)) * 2.0 - 1.0;',
    '      float intensity = (staticBurst - 0.85) * 6.67;',
    '      col += noise * 0.08 * intensity;',
    '    }',
    '  }',
    '',
    '  /* Film burn — one at a time, 20-60s apart, top-right */',
    '  if (uFilmBurn == 1) {',
    '    /* Walk burn events to find current one */',
    '    float burnLife = 1.0;',
    '    float cumT = 0.0;',
    '    for (int i = 0; i < 64; i++) {',
    '      float fi = float(i);',
    '      float gap = 20.0 + hash(vec2(fi, 0.3)) * 40.0;',
    '      float start = cumT + gap;',
    '      float end = start + burnLife;',
    '      if (uTime < start) break;',
    '      if (uTime < end) {',
    '        float t = (uTime - start) / burnLife;',
    '        float seed = hash(vec2(fi, 7.3));',
    '',
    '        float peak = 0.08 + seed * 0.06;',
    '        float growR = smoothstep(0.0, 0.3, t) * peak;',
    '        float shrinkR = smoothstep(0.0, 0.3, 1.0 - t) * peak;',
    '        float radius = min(growR, shrinkR);',
    '',
    '        if (radius > 0.001) {',
    '          vec2 origin = vec2(0.78 + fract(seed * 5.13) * 0.18,',
    '                             0.78 + fract(seed * 11.7) * 0.18);',
    '          float s2 = hash(vec2(fi, 13.1));',
    '          vec2 drift = vec2(sin(t * 2.0 + s2 * 6.28),',
    '                            cos(t * 2.0 + s2 * 6.28)) * 0.02;',
    '          vec2 center = origin + drift * t;',
    '',
    '          vec2 d = (uv - center) * vec2(aspect, 1.0);',
    '          float dist = length(d);',
    '          float angle = atan(d.y, d.x);',
    '',
    '          float warp = 0.0;',
    '          warp += sin(angle * 2.0 + t * 3.0 + seed * 20.0) * 0.025;',
    '          warp += sin(angle * 3.0 - t * 4.5 + seed * 40.0) * 0.015;',
    '          warp += cos(angle * 1.0 + t * 2.0 + seed * 10.0) * 0.018;',
    '          dist += warp;',
    '',
    '          float inner = smoothstep(radius, radius - 0.012, dist);',
    '          float edge  = smoothstep(radius + 0.02, radius, dist) - inner;',
    '',
    '          col = mix(col, vec3(0.0), inner);',
    '          col += vec3(1.0, 0.95, 0.85) * edge * 0.7;',
    '        }',
    '        break;',
    '      }',
    '      cumT = end;',
    '    }',
    '  }',
    '',
    '  fragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  var SIDEBAR_FRAG_SRC = [
    '#version 300 es',
    'precision mediump float;',
    'in vec2 vUV;',
    'out vec4 fragColor;',
    'uniform float uTime;',
    'uniform vec2 uResolution;',
    '',
    'const vec3 BG      = vec3(0.082, 0.020, 0.208);',
    'const vec3 PURPLE   = vec3(0.710, 0.216, 0.949);',
    'const vec3 PINK     = vec3(1.0, 0.165, 0.427);',
    'const vec3 CYAN     = vec3(0.020, 0.851, 0.910);',
    '',
    'void main() {',
    '  vec2 uv = vUV;',
    '  float t = uTime * 0.12;',
    '  float v1 = sin(uv.x * 3.0 + t);',
    '  float v2 = sin(uv.y * 3.0 + t * 1.3);',
    '  float v3 = sin((uv.x + uv.y) * 2.0 + t * 0.7);',
    '  float v4 = sin(length(uv - 0.5) * 5.0 - t * 0.9);',
    '  float p = (v1 + v2 + v3 + v4) * 0.25 * 0.5 + 0.5;',
    '  vec3 col = BG;',
    '  col = mix(col, PURPLE, smoothstep(0.3, 0.5, p) * 0.12);',
    '  col = mix(col, PINK, smoothstep(0.5, 0.7, p) * 0.08);',
    '  col = mix(col, CYAN, smoothstep(0.7, 0.9, p) * 0.06);',
    '  fragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  /* ---------- WebGL Helpers ---------- */

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vSrc, fSrc) {
    var vs = createShader(gl, gl.VERTEX_SHADER, vSrc);
    var fs = createShader(gl, gl.FRAGMENT_SHADER, fSrc);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  function setupQuad(gl, program) {
    var verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return vao;
  }

  /* ---------- WebGL1 Fallback Conversion ---------- */

  function toWebGL1Vertex() {
    return [
      'attribute vec2 aPosition;',
      'varying vec2 vUV;',
      'void main() {',
      '  vUV = aPosition * 0.5 + 0.5;',
      '  gl_Position = vec4(aPosition, 0.0, 1.0);',
      '}',
    ].join('\n');
  }

  function toWebGL1Fragment(src) {
    return src
      .replace('#version 300 es', '')
      .replace('in vec2 vUV;', 'varying vec2 vUV;')
      .replace('out vec4 fragColor;', '')
      .replace(/fragColor/g, 'gl_FragColor');
  }

  function setupQuadWGL1(gl, program) {
    var verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  /* ---------- Canvas Sizing ---------- */

  function resizeCanvas(canvas, gl, scale) {
    var w, h;
    if (canvas.id === 'shader-bg-canvas') {
      w = window.innerWidth;
      h = window.innerHeight;
    } else {
      var parent = canvas.parentElement;
      w = parent ? parent.clientWidth : 260;
      h = parent ? parent.clientHeight : window.innerHeight;
    }
    var rw = Math.floor(w * scale * CONFIG.pixelRatio);
    var rh = Math.floor(h * scale * CONFIG.pixelRatio);
    if (canvas.width !== rw || canvas.height !== rh) {
      canvas.width = rw;
      canvas.height = rh;
      gl.viewport(0, 0, rw, rh);
    }
  }

  /* ---------- Get Context (WebGL2 → WebGL1 fallback) ---------- */

  function getContextAndProgram(canvas, fragSrc) {
    var gl = canvas.getContext('webgl2');
    var isWGL2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl');
    if (!gl) return null;

    var vSrc, fSrc;
    if (isWGL2) {
      vSrc = VERT_SRC;
      fSrc = fragSrc;
    } else {
      vSrc = toWebGL1Vertex();
      fSrc = toWebGL1Fragment(fragSrc);
    }

    var program = createProgram(gl, vSrc, fSrc);
    if (!program) return null;

    if (isWGL2) {
      var vao = setupQuad(gl, program);
      return { gl: gl, program: program, vao: vao, isWGL2: true };
    } else {
      setupQuadWGL1(gl, program);
      return { gl: gl, program: program, vao: null, isWGL2: false };
    }
  }

  /* ---------- Reduced Motion Check ---------- */

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Main Background ---------- */

  function initMainShader() {
    var canvas = document.getElementById('shader-bg-canvas');
    if (!canvas) return;

    var result = getContextAndProgram(canvas, MAIN_FRAG_SRC);
    if (!result) {
      canvas.style.display = 'none';
      return;
    }

    mainGL = result.gl;
    mainProgram = result.program;
    mainVAO = result.vao;
    mainGL.useProgram(mainProgram);
    mainUniforms.uTime = mainGL.getUniformLocation(mainProgram, 'uTime');
    mainUniforms.uResolution = mainGL.getUniformLocation(mainProgram, 'uResolution');
    mainUniforms.uCRT = mainGL.getUniformLocation(mainProgram, 'uCRT');
    mainUniforms.uFilmBurn = mainGL.getUniformLocation(mainProgram, 'uFilmBurn');
    mainGL.uniform1i(mainUniforms.uCRT, CONFIG.crtScanlines ? 1 : 0);
    mainGL.uniform1i(mainUniforms.uFilmBurn, CONFIG.filmBurn ? 1 : 0);

    resizeCanvas(canvas, mainGL, CONFIG.mainScale);
    document.body.classList.add('webgl-active');

    if (prefersReducedMotion()) {
      renderMainFrame(0);
      return;
    }

    mainRunning = true;
    renderMainLoop();
  }

  function renderMainFrame(time) {
    if (!mainGL) return;
    if (mainVAO) mainGL.bindVertexArray(mainVAO);
    mainGL.uniform1f(mainUniforms.uTime, time);
    mainGL.uniform2f(mainUniforms.uResolution, mainGL.canvas.width, mainGL.canvas.height);
    mainGL.drawArrays(mainGL.TRIANGLES, 0, 3);
  }

  function renderMainLoop() {
    if (!mainRunning) return;
    var time = performance.now() / 1000.0 - startTime;
    renderMainFrame(time);
    mainAnimId = requestAnimationFrame(renderMainLoop);
  }

  /* ---------- Sidebar Shader ---------- */

  function initSidebarShader() {
    var canvas = document.getElementById('shader-sidebar-canvas');
    if (!canvas) return;

    var result = getContextAndProgram(canvas, SIDEBAR_FRAG_SRC);
    if (!result) {
      canvas.style.display = 'none';
      return;
    }

    sidebarGL = result.gl;
    sidebarProgram = result.program;
    sidebarVAO = result.vao;
    sidebarGL.useProgram(sidebarProgram);
    sidebarUniforms.uTime = sidebarGL.getUniformLocation(sidebarProgram, 'uTime');
    sidebarUniforms.uResolution = sidebarGL.getUniformLocation(sidebarProgram, 'uResolution');

    resizeCanvas(canvas, sidebarGL, CONFIG.sidebarScale);

    if (prefersReducedMotion()) {
      renderSidebarFrame(0);
      return;
    }

    sidebarRunning = true;
    renderSidebarLoop();
  }

  function renderSidebarFrame(time) {
    if (!sidebarGL) return;
    if (sidebarVAO) sidebarGL.bindVertexArray(sidebarVAO);
    sidebarGL.uniform1f(sidebarUniforms.uTime, time);
    sidebarGL.uniform2f(sidebarUniforms.uResolution, sidebarGL.canvas.width, sidebarGL.canvas.height);
    sidebarGL.drawArrays(sidebarGL.TRIANGLES, 0, 3);
  }

  function renderSidebarLoop() {
    if (!sidebarRunning) return;
    var time = performance.now() / 1000.0 - startTime;
    renderSidebarFrame(time);
    sidebarAnimId = requestAnimationFrame(renderSidebarLoop);
  }

  /* ---------- Lifecycle ---------- */

  function handleResize() {
    if (mainGL) resizeCanvas(document.getElementById('shader-bg-canvas'), mainGL, CONFIG.mainScale);
    if (sidebarGL) resizeCanvas(document.getElementById('shader-sidebar-canvas'), sidebarGL, CONFIG.sidebarScale);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      mainRunning = false;
      sidebarRunning = false;
      if (mainAnimId) cancelAnimationFrame(mainAnimId);
      if (sidebarAnimId) cancelAnimationFrame(sidebarAnimId);
    } else {
      if (mainGL && !prefersReducedMotion()) {
        mainRunning = true;
        renderMainLoop();
      }
      if (sidebarGL && !prefersReducedMotion()) {
        sidebarRunning = true;
        renderSidebarLoop();
      }
    }
  }

  /* ---------- Init ---------- */

  function init() {
    initMainShader();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Expose for sidebar.js and tests
  window.initSidebarShader = initSidebarShader;
  window.initMainShader = initMainShader;

  document.addEventListener('DOMContentLoaded', init);
})();
