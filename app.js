/* myFont â€” client-side template generator (original code, calibrated geometry) */
(function () {
  'use strict';

  var MINIMAL = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?'-()@#&+/$\"").split("");
  var SPANISH_EXTRA = "\u00d1\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00bf\u00a1".split("");

  // Calibrated geometry (points, top-down; flipped for pdf-lib bottom-up origin)
  var PAGE_W = 595.28, PAGE_H = 841.89, M = 40, HEADER_H = 70;
  var COLS = 6, ROWS = 7, GAP = 4;
  var FS = 79, ASC = 0.718; // ghost ascender fills capLine..baseline; feet land on baseline
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
    return v === 'spanish' ? MINIMAL.concat(SPANISH_EXTRA) : MINIMAL.slice();
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

  async function generate() {
    if (!window.PDFLib) { $('status').textContent = 'PDF engine missing (vendor/pdf-lib.min.js)'; return; }
    $('status').textContent = t('generating');
    var chars = charset();
    var withGhost = $('chk-ghost').checked;
    var PDFLib = window.PDFLib;
    var doc = await PDFLib.PDFDocument.create();
    var helv = await doc.embedFont(PDFLib.StandardFonts.Helvetica);

    var gridW = PAGE_W - 2 * M;
    var gridH = PAGE_H - M - (M + HEADER_H);
    var cw = gridW / COLS, ch = gridH / ROWS;
    var perPage = COLS * ROWS;
    var pages = Math.ceil(chars.length / perPage);

    for (var p = 0; p < pages; p++) {
      var page = doc.addPage([PAGE_W, PAGE_H]);
      page.drawText('myFont', {
        x: M, y: flip(M + 14), size: 14, font: helv, color: rgb(HDR1)
      });
      page.drawText(t('headerLine1') + ' ' + t('headerLine2'), {
        x: M, y: flip(M + 40), size: 8, font: helv, color: rgb(HDR2),
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
          var tw = helv.widthOfTextAtSize(g, FS);
          page.drawText(g, {
            x: x + (w - tw) / 2, y: flip(baseline),
            size: FS, font: helv, color: rgb(withGhostDebug() || GHOST)
          });
        }
        page.drawText(g, {
          x: x + 3, y: flip(y + 12), size: 9, font: helv, color: rgb(GREY)
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

  async function init() {
    try {
      var es = await (await fetch('i18n/es.json')).json();
      var en = await (await fetch('i18n/en.json')).json();
      I18N = { es: es, en: en };
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
