/* myFont - client-side template generator (original code, calibrated geometry) */
(function () {
  'use strict';

  var CS = window.MYFONT_CHARSETS;
  var FULL = {
    minimal: CS.minimal.split(''),
    spanish: (CS.minimal + CS.spanish).split(''),
    latin1: (CS.minimal + CS.spanish + CS.latin1).split(''),
    exta: (CS.minimal + CS.spanish + CS.latin1 + CS.exta).split(''),
    pro: (CS.minimal + CS.spanish + CS.latin1 + CS.exta + CS.pro).split('')
  };

  // Calibrated geometry (points, top-down; flipped for pdf-lib bottom-up origin)
  var PAGE_W = 595.28, PAGE_H = 841.89, M = 40, HEADER_H = 70;
  var COLS = 6, ROWS = 7, GAP = 4;
  var FS = 75; // DejaVu Sans ghost: caps -0.7pt, arches +2pt (balanced fit to guide bands); feet exact on baseline
  var GREY = [0.784, 0.784, 0.784];       // #c8c8c8 guides
  var GHOST = [0.851, 0.851, 0.851];      // #d9d9d9 vanishes in thresholding
  var HDR1 = [0.6, 0.6, 0.6];
  var HDR2 = [0.667, 0.667, 0.667];
  var RED = [1, 0, 0];

  function rgb(c) { return window.PDFLib.rgb(c[0], c[1], c[2]); }

  var I18N = {};
  var lang = localStorage.getItem('myfont-lang') || 'es';
  var pdfUrl = null;

  var $ = function (id) { return document.getElementById(id); };

  function t(key, vars) {
    var s = (I18N[lang] && I18N[lang][key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    var hero = $('hero-title');
    hero.textContent = t('heroTitle');
    hero.setAttribute('data-t', t('heroTitle'));
    document.title = t('docTitle');
    $('btn-es').classList.toggle('on', lang === 'es');
    $('btn-en').classList.toggle('on', lang === 'en');
    localStorage.setItem('myfont-lang', lang);
    $('status').textContent = '';
  }

  function charset() {
    var v = $('sel-charset').value;
    return (FULL[v] || FULL.spanish).slice();
  }

  function flip(y) { return PAGE_H - y; }

  function dashedH(page, x1, x2, yTop, width) {
    var y = flip(yTop);
    for (var x = x1; x < x2; x += 5) {
      page.drawLine({
        start: { x: x, y: y }, end: { x: Math.min(x + 2, x2), y: y },
        thickness: width, color: rgb(GREY)
      });
    }
  }

  async function loadFontBytes() {
    try {
      var r = await fetch('vendor/fonts/DejaVuSans.ttf');
      if (r.ok) return await r.arrayBuffer();
    } catch (e) { /* file:// or offline -> embedded */ }
    var b64 = window.MYFONT_DEJAVU_B64;
    var bin = atob(b64);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var sc = document.createElement("script");
      sc.src = src;
      sc.onload = res;
      sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }

  async function ensureLibs() {
    if (!window.fontkit) await loadScript('vendor/fontkit.min.js');
    if (!window.MYFONT_DEJAVU_B64) await loadScript("dejavu-b64.js");
  }

  async function generate() {
    try { await ensureLibs(); } catch (e) {
      $('status').textContent = 'library load error: ' + e.message;
      return;
    }
    if (!window.PDFLib) { $('status').textContent = 'PDF engine missing (vendor/pdf-lib.min.js)'; return; }
    $('status').textContent = t('generating');
    var chars = charset();
    var withGhost = $('chk-ghost').checked;
    var PDFLib = window.PDFLib;
    var doc = await PDFLib.PDFDocument.create();
    doc.registerFontkit(window.fontkit);
    var fontBytes = await loadFontBytes();
  var customFont = await doc.embedFont(fontBytes);

    var gridW = PAGE_W - 2 * M;
    var gridH = PAGE_H - M - (M + HEADER_H);
    var cw = gridW / COLS, ch = gridH / ROWS;
    var perPage = COLS * ROWS;
    var pages = Math.ceil(chars.length / perPage);

    for (var p = 0; p < pages; p++) {
      var page = doc.addPage([PAGE_W, PAGE_H]);
      page.drawText('myFont', {
        x: M, y: flip(M + 14), size: 14, font: customFont, color: rgb(HDR1)
      });
      page.drawText(t('headerLine1') + ' ' + t('headerLine2'), {
        x: M, y: flip(M + 40), size: 8, font: customFont, color: rgb(HDR2),
        maxWidth: gridW, lineHeight: 10
      });
      var slice = chars.slice(p * perPage, (p + 1) * perPage);
      slice.forEach(function (g, i) {
        var x = M + (i % COLS) * cw;
        var y = M + HEADER_H + Math.floor(i / COLS) * ch;
        var w = cw - GAP, h = ch - GAP;
        var baseline = y + h * 0.78;
        var capLine = y + h * 0.18;
        var xLine = baseline - (baseline - capLine) * (480 / 700);

        page.drawRectangle({
          x: x, y: flip(y + h), width: w, height: h,
          borderColor: rgb(GREY), borderWidth: 0.8
        });
        page.drawLine({
          start: { x: x, y: flip(baseline) }, end: { x: x + w, y: flip(baseline) },
          thickness: 0.8, color: rgb(GREY)
        });
        dashedH(page, x, x + w, xLine, 0.5);
        dashedH(page, x, x + w, capLine, 0.5);

        if (withGhost) {
          var tw = customFont.widthOfTextAtSize(g, FS);
          page.drawText(g, {
            x: x + (w - tw) / 2, y: flip(baseline),
            size: FS, font: customFont, color: rgb(withGhostDebug() || GHOST)
          });
        }
        page.drawText(g, {
          x: x + 3, y: flip(y + 12), size: 9, font: customFont, color: rgb(GREY)
        });
      });
    }

    var bytes = await doc.save();
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    pdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    $('preview').src = pdfUrl;
    $('btn-download').disabled = false;
    $('btn-print').disabled = false;
    $('status').textContent = t('ready', { pages: pages, chars: chars.length });
  }

  // Hook for QA: ?ghost=red paints ghosts red for pixel measurement
  function withGhostDebug() {
    if (new URLSearchParams(location.search).get('ghost') === 'red') {
      return RED;
    }
    return null;
  }

  function download() {
    if (!pdfUrl) { $('status').textContent = t('needGenerate'); return; }
    var a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'myfont-template-' + $('sel-charset').value + '-' + lang + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function printPdf() {
    if (!pdfUrl) { $('status').textContent = t('needGenerate'); return; }
    var f = $('preview');
    f.focus();
    f.contentWindow.print();
  }

  async function loadI18n() {
    try {
      var es = await (await fetch('i18n/es.json')).json();
      var en = await (await fetch('i18n/en.json')).json();
      return { es: es, en: en };
    } catch (e) {
      // file:// or offline: fall back to embedded copy
      if (window.MYFONT_I18N) return window.MYFONT_I18N;
      throw e;
    }
  }

  async function init() {
    try {
      I18N = await loadI18n();
    } catch (e) {
      $('status').textContent = 'i18n load error: ' + e.message;
      return;
    }
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    applyLang();
    $('btn-es').addEventListener('click', function () { lang = 'es'; applyLang(); });
    $('btn-en').addEventListener('click', function () { lang = 'en'; applyLang(); });
    $('btn-make').addEventListener('click', generate);
    $('btn-download').addEventListener('click', download);
    $('btn-print').addEventListener('click', printPdf);
    generate();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
