/* TronKits — Logo Generator
 * Builds a self-contained SVG logo: text (outlined to vector paths), an optional
 * geometric shape, and optional rules above/below and left/right of the text.
 *
 * The exported SVG has NO font-family dependency: every glyph is a <path>, so the
 * file renders identically in any browser, in Illustrator, Figma, Inkscape, or print.
 *
 * The same buildLogo() runs in Node (for tests) and in the browser (for preview),
 * so what you see in the preview is byte-for-byte what you download.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TKLogo = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------- constants
  var FS = 100;              // nominal font size; everything scales off this
  var PAD = 0.22 * FS;       // outer padding of the exported artboard
  var SHAPE_PAD = 0.30 * FS; // clearance between the content and an enclosing shape
  var MARK_GAP = 0.34 * FS;  // gap between a shape used as a mark and the wordmark
  var MAX_SHAPE_H = 1.5;     // an enclosing shape may never exceed 1.5x the content height

  // Archivo Black ships as a single black weight — there is no "regular" Archivo Black,
  // so its weight control is disabled rather than faked by synthetically thickening strokes.
  var FONTS = {
    'space-grotesk': {
      label: 'Space Grotesk',
      weights: { 400: '/fonts/space-grotesk-400.woff', 700: '/fonts/space-grotesk-700.woff' }
    },
    'archivo-black': {
      label: 'Archivo Black',
      weights: { 400: '/fonts/archivo-black-400.woff' }
    },
    'jetbrains-mono': {
      label: 'JetBrains Mono',
      weights: { 400: '/fonts/jetbrains-mono-400.woff', 700: '/fonts/jetbrains-mono-700.woff' }
    },
    'playfair-display': {
      label: 'Playfair Display',
      weights: { 400: '/fonts/playfair-display-400.woff', 700: '/fonts/playfair-display-700.woff' }
    }
  };

  /** The file for a family at the requested weight, falling back to whatever it has. */
  function fontFile(family, weight) {
    var w = FONTS[family].weights;
    return w[weight] || w[700] || w[400];
  }

  /** Does this family actually have both a regular and a bold? */
  function hasBold(family) {
    var w = FONTS[family].weights;
    return !!(w[400] && w[700]);
  }

  var PNG_SIZES = [128, 256, 512, 1024, 2048];

  var SHAPES = ['none', 'circle', 'square', 'rounded', 'chamfered', 'hexagon', 'diamond'];
  var LAYOUTS = ['inside', 'above', 'left'];

  var PALETTE = [
    { name: 'Ink',    hex: '#15263A' },
    { name: 'Orange', hex: '#E25C2C' },
    { name: 'Red',    hex: '#C9442C' },
    { name: 'Yellow', hex: '#E5B043' },
    { name: 'Green',  hex: '#2D8F60' },
    { name: 'Blue',   hex: '#2E6DA4' },
    { name: 'Violet', hex: '#6B47B8' },
    { name: 'Copper', hex: '#B87333' },
    { name: 'Paper',  hex: '#F5EFDD' }
  ];

  var DEFAULTS = {
    text: 'TRONKITS',
    font: 'space-grotesk',
    weight: 700,
    uppercase: true,
    tracking: 0.08,         // em
    layout: 'inside',
    shape: 'hexagon',
    shapeStyle: 'outline',  // 'outline' | 'fill'
    strokeWeight: 5,        // px, at FS = 100
    rulesH: true,
    rulesV: false,
    ruleWeight: 3,
    ruleGap: 0.24,          // fraction of FS
    colorText: '#15263A',
    colorShape: '#E25C2C',
    colorRule: '#15263A'
  };

  // ------------------------------------------------------------------ helpers
  function r2(n) { return Math.round(n * 100) / 100; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Serialize an opentype Path to SVG path data.
   *
   * We deliberately do NOT use opentype's own path.toPathData(): version 2.0.0
   * emits NaN into the coordinate stream for some glyph runs (the command list
   * itself is fine — the bug is in their serializer). Doing it by hand is a dozen
   * lines and gives us exact control over precision.
   */
  function pathToD(path) {
    var out = [];
    for (var i = 0; i < path.commands.length; i++) {
      var c = path.commands[i];
      switch (c.type) {
        case 'M': out.push('M' + r2(c.x) + ' ' + r2(c.y)); break;
        case 'L': out.push('L' + r2(c.x) + ' ' + r2(c.y)); break;
        case 'C': out.push('C' + r2(c.x1) + ' ' + r2(c.y1) + ' ' + r2(c.x2) + ' ' + r2(c.y2) + ' ' + r2(c.x) + ' ' + r2(c.y)); break;
        case 'Q': out.push('Q' + r2(c.x1) + ' ' + r2(c.y1) + ' ' + r2(c.x) + ' ' + r2(c.y)); break;
        case 'Z': out.push('Z'); break;
      }
    }
    return out.join('');
  }

  function emptyBox() {
    return { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  }

  function growBox(box, x1, y1, x2, y2) {
    box.x1 = Math.min(box.x1, x1);
    box.y1 = Math.min(box.y1, y1);
    box.x2 = Math.max(box.x2, x2);
    box.y2 = Math.max(box.y2, y2);
  }

  /**
   * Given a content box of size w x h that must sit INSIDE `shape`, return the
   * half-width / half-height of the shape that contains it with `pad` clearance.
   * Each case is a closed-form containment guarantee — no shape can ever clip text.
   */
  function fitShape(shape, w, h, pad) {
    var W = w + 2 * pad, H = h + 2 * pad; // padded content box
    var s, R, hh;
    switch (shape) {
      case 'circle':
        R = Math.sqrt((W / 2) * (W / 2) + (H / 2) * (H / 2)); // circumradius of the box
        return { hw: R, hh: R };

      case 'square':
        s = Math.max(W, H) / 2;
        return { hw: s, hh: s };

      case 'rounded':
        // the corner radius eats into the corners; treat it as a shallow chamfer
        s = Math.max(Math.max(W, H) / 2, (W + H) / (2 * 1.70));
        return { hw: s, hh: s };

      case 'chamfered':
        // cut corners: the rect fits iff W/2 + H/2 <= s(2 - k), k = chamfer ratio
        s = Math.max(Math.max(W, H) / 2, (W + H) / (2 * (2 - 0.26)));
        return { hw: s, hh: s };

      case 'hexagon':
        // Flat-top hexagon. Its half-height is hh for |x| <= hw/2, then tapers linearly
        // to zero at hw. The padded box fits iff  hw >= hh*W / (2*hh - H/2).
        //
        // A *regular* hexagon satisfies that with equality at hh = (sqrt3/2)*R,
        // R = W/2 + H/(2*sqrt3) — but for a wide wordmark that regular hexagon becomes
        // absurdly tall (the text ends up a thin band floating in the middle). So we cap
        // the height and re-solve for the width. Short text keeps a regular hexagon;
        // long text relaxes smoothly into a flatter one. No discontinuity while typing.
        R = Math.max(H / Math.sqrt(3), W / 2 + H / (2 * Math.sqrt(3)));
        hh = Math.min((Math.sqrt(3) / 2) * R, MAX_SHAPE_H * H);
        return { hw: hh * W / (2 * hh - H / 2), hh: hh };

      case 'diamond':
        // A rect fits iff W/(2a) + H/(2b) <= 1. The regular case (a = b) gives
        // R = (W+H)/2; same height cap and re-solve as the hexagon, for the same reason.
        R = (W + H) / 2;
        hh = Math.min(R, MAX_SHAPE_H * H);
        return { hw: (W / 2) / (1 - H / (2 * hh)), hh: hh };

      default:
        return { hw: 0, hh: 0 };
    }
  }

  /** Emit the SVG element for `shape` occupying the box centred on (cx, cy). */
  function shapeEl(shape, cx, cy, hw, hh, style, color, sw) {
    var paint = style === 'fill'
      ? 'fill="' + color + '"'
      : 'fill="none" stroke="' + color + '" stroke-width="' + r2(sw) + '" stroke-linejoin="round"';
    var pts, c;

    function poly(points) {
      return '<polygon points="' +
        points.map(function (p) { return r2(p[0]) + ',' + r2(p[1]); }).join(' ') +
        '" ' + paint + '/>';
    }

    switch (shape) {
      case 'circle':
        return '<circle cx="' + r2(cx) + '" cy="' + r2(cy) + '" r="' + r2(hw) + '" ' + paint + '/>';

      case 'square':
        return '<rect x="' + r2(cx - hw) + '" y="' + r2(cy - hh) + '" width="' + r2(hw * 2) +
               '" height="' + r2(hh * 2) + '" ' + paint + '/>';

      case 'rounded':
        return '<rect x="' + r2(cx - hw) + '" y="' + r2(cy - hh) + '" width="' + r2(hw * 2) +
               '" height="' + r2(hh * 2) + '" rx="' + r2(Math.min(hw, hh) * 0.30) + '" ' + paint + '/>';

      case 'chamfered':
        c = 0.26 * Math.min(hw, hh);
        return poly([
          [cx - hw + c, cy - hh], [cx + hw - c, cy - hh],
          [cx + hw, cy - hh + c], [cx + hw, cy + hh - c],
          [cx + hw - c, cy + hh], [cx - hw + c, cy + hh],
          [cx - hw, cy + hh - c], [cx - hw, cy - hh + c]
        ]);

      case 'hexagon': // flat-top: two points on the horizontal axis, four corners
        return poly([
          [cx + hw, cy], [cx + hw / 2, cy + hh], [cx - hw / 2, cy + hh],
          [cx - hw, cy], [cx - hw / 2, cy - hh], [cx + hw / 2, cy - hh]
        ]);

      case 'diamond':
        return poly([[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]]);

      default:
        return '';
    }
  }

  function line(x1, y1, x2, y2, color, w) {
    return '<line x1="' + r2(x1) + '" y1="' + r2(y1) + '" x2="' + r2(x2) + '" y2="' + r2(y2) +
           '" stroke="' + color + '" stroke-width="' + r2(w) + '" stroke-linecap="square"/>';
  }

  // -------------------------------------------------------------------- build
  /**
   * @param {object} opts see DEFAULTS
   * @param {opentype.Font} font a parsed font
   * @returns {{svg:string, width:number, height:number}}
   */
  function buildLogo(opts, font) {
    var o = Object.assign({}, DEFAULTS, opts || {});
    var text = String(o.text == null ? '' : o.text);
    if (o.uppercase) text = text.toUpperCase();
    if (!text.trim()) throw new Error('EMPTY_TEXT');

    // --- 1. Text, outlined to a path --------------------------------------
    var path = font.getPath(text, 0, 0, FS, { letterSpacing: o.tracking, kerning: true });
    var d = pathToD(path);
    var pb = path.getBoundingBox();
    var tw = pb.x2 - pb.x1;
    var th = pb.y2 - pb.y1;
    if (!isFinite(tw) || !isFinite(th) || tw <= 0 || th <= 0) throw new Error('EMPTY_TEXT');

    // Land the text's ink box with its top-left corner on the origin.
    var TX = 0, TY = 0;
    var textTransform = 'translate(' + r2(TX - pb.x1) + ' ' + r2(TY - pb.y1) + ')';

    var els = [];
    var box = emptyBox();
    growBox(box, TX, TY, TX + tw, TY + th);

    // --- 2. Rules ----------------------------------------------------------
    // They hug the text's ink box, offset by a gap, and never touch it. When both
    // pairs are on they extend to meet, closing into a rectangle around the text.
    var G = o.ruleGap * FS;
    var rw = o.ruleWeight;
    var hOn = !!o.rulesH, vOn = !!o.rulesV;
    var rx1 = TX - G, rx2 = TX + tw + G;
    var ry1 = TY - G, ry2 = TY + th + G;

    if (hOn) {
      var hx1 = vOn ? rx1 : TX;
      var hx2 = vOn ? rx2 : TX + tw;
      els.push(line(hx1, ry1, hx2, ry1, o.colorRule, rw));
      els.push(line(hx1, ry2, hx2, ry2, o.colorRule, rw));
      growBox(box, hx1 - rw / 2, ry1 - rw / 2, hx2 + rw / 2, ry2 + rw / 2);
    }
    if (vOn) {
      var vy1 = hOn ? ry1 : TY;
      var vy2 = hOn ? ry2 : TY + th;
      els.push(line(rx1, vy1, rx1, vy2, o.colorRule, rw));
      els.push(line(rx2, vy1, rx2, vy2, o.colorRule, rw));
      growBox(box, rx1 - rw / 2, vy1 - rw / 2, rx2 + rw / 2, vy2 + rw / 2);
    }

    // The wordmark — text plus rules — as a single unit.
    var content = { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
    var cw = content.x2 - content.x1;
    var ch = content.y2 - content.y1;
    var ccx = (content.x1 + content.x2) / 2;
    var ccy = (content.y1 + content.y2) / 2;

    // --- 3. Shape ----------------------------------------------------------
    var shape = o.shape;
    if (shape && shape !== 'none') {
      var sw = o.shapeStyle === 'outline' ? o.strokeWeight : 0;
      var half, scx, scy;

      if (o.layout === 'inside') {
        half = fitShape(shape, cw, ch, SHAPE_PAD);
        scx = ccx;
        scy = ccy;
      } else {
        // The shape becomes a mark set beside the wordmark: a symmetric badge.
        var S = Math.max(0.62 * ch, 0.42 * FS);
        half = { hw: S, hh: S };
        if (shape === 'hexagon') half.hh = (Math.sqrt(3) / 2) * half.hw;

        if (o.layout === 'above') {
          scx = ccx;
          scy = content.y1 - MARK_GAP - half.hh - sw / 2;
        } else { // 'left'
          scx = content.x1 - MARK_GAP - half.hw - sw / 2;
          scy = ccy;
        }
      }

      els.unshift(shapeEl(shape, scx, scy, half.hw, half.hh, o.shapeStyle, o.colorShape, sw));
      growBox(box,
        scx - half.hw - sw / 2, scy - half.hh - sw / 2,
        scx + half.hw + sw / 2, scy + half.hh + sw / 2);
    }

    // Text is drawn last, so a filled shape can never cover it.
    els.push('<path d="' + d + '" fill="' + o.colorText + '" transform="' + textTransform + '"/>');

    // --- 4. Artboard -------------------------------------------------------
    var W = (box.x2 - box.x1) + 2 * PAD;
    var H = (box.y2 - box.y1) + 2 * PAD;
    var ox = PAD - box.x1;
    var oy = PAD - box.y1;

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + r2(W) + ' ' + r2(H) + '" ' +
      'width="' + r2(W) + '" height="' + r2(H) + '" role="img" aria-labelledby="t">' +
      '<title id="t">' + esc(text) + '</title>' +
      '<g transform="translate(' + r2(ox) + ' ' + r2(oy) + ')">' +
      els.join('') +
      '</g></svg>';

    return { svg: svg, width: W, height: H };
  }

  return {
    buildLogo: buildLogo,
    fontFile: fontFile,
    hasBold: hasBold,
    FONTS: FONTS,
    PNG_SIZES: PNG_SIZES,
    SHAPES: SHAPES,
    LAYOUTS: LAYOUTS,
    PALETTE: PALETTE,
    DEFAULTS: DEFAULTS
  };
});

/* ------------------------------------------------------------------ browser UI
 * Everything below runs only in the browser. Node tests import the module above.
 */
if (typeof document !== 'undefined') (function () {
  'use strict';

  var TK = window.TKLogo;
  var fontCache = {};
  var current = Object.assign({}, TK.DEFAULTS);
  var lastSvg = '';

  function $(id) { return document.getElementById(id); }

  var preview = $('lgPreview');
  var status = $('lgStatus');
  var dlBtn = $('lgDownload');
  var pngBtn = $('lgDownloadPng');
  var pngSize = $('lgPngSize');
  var lastSize = null;

  function setExportsEnabled(on) {
    if (dlBtn) dlBtn.disabled = !on;
    if (pngBtn) pngBtn.disabled = !on;
  }

  function slug() {
    return (current.text || 'logo').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'logo';
  }

  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.style.color = kind === 'error' ? 'var(--red)'
      : kind === 'ok' ? 'var(--green)'
      : 'var(--yellow)';
  }

  function loadFont(family, weight) {
    var file = TK.fontFile(family, weight);
    if (fontCache[file]) return Promise.resolve(fontCache[file]);
    return fetch(file)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) {
        fontCache[file] = window.opentype.parse(buf);
        return fontCache[file];
      });
  }

  /* Families with only one cut (Archivo Black) get their weight control disabled —
   * we don't fake a bold by fattening the strokes, because that looks like a fake bold. */
  function syncWeightControl() {
    var box = $('lgBold');
    if (!box) return;
    var supported = TK.hasBold(current.font);
    box.disabled = !supported;
    var wrap = box.closest('.tk-check');
    if (wrap) {
      wrap.style.opacity = supported ? '1' : '0.4';
      wrap.title = supported ? '' : TK.FONTS[current.font].label + ' only ships one weight';
    }
    if (!supported) {
      // fall back to the only weight the family actually has
      current.weight = TK.FONTS[current.font].weights[700] ? 700 : 400;
      box.checked = current.weight === 700;
    }
  }

  function render() {
    loadFont(current.font, current.weight).then(function (font) {
      var out;
      try {
        out = TK.buildLogo(current, font);
      } catch (e) {
        lastSvg = '';
        lastSize = null;
        setExportsEnabled(false);
        preview.innerHTML = '';
        setStatus(e.message === 'EMPTY_TEXT' ? 'ENTER SOME TEXT' : 'RENDER FAILED', 'error');
        return;
      }
      lastSvg = out.svg;
      lastSize = { w: out.width, h: out.height };
      preview.innerHTML = out.svg;

      // Let the preview scale to its container without distorting.
      var node = preview.querySelector('svg');
      if (node) {
        node.removeAttribute('width');
        node.removeAttribute('height');
        node.style.maxWidth = '100%';
        node.style.maxHeight = '340px';
      }
      setExportsEnabled(true);
      setStatus(Math.round(out.width) + ' × ' + Math.round(out.height) + ' · GLYPHS OUTLINED', 'ok');
    }).catch(function (e) {
      setStatus('FONT FAILED TO LOAD', 'error');
      console.error(e);
    });
  }

  // ------------------------------------------------------------ control wiring
  function bind(id, key, transform) {
    var el = $(id);
    if (!el) return;
    var evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, function () {
      var v = el.type === 'checkbox' ? el.checked : el.value;
      current[key] = transform ? transform(v) : v;
      var out = $(id + 'Out');
      if (out) out.textContent = el.value;
      render();
    });
  }

  bind('lgText', 'text');
  bind('lgUpper', 'uppercase');

  var fontSel = $('lgFont');
  if (fontSel) {
    fontSel.addEventListener('change', function () {
      current.font = fontSel.value;
      syncWeightControl();
      render();
    });
  }

  var boldBox = $('lgBold');
  if (boldBox) {
    boldBox.addEventListener('change', function () {
      current.weight = boldBox.checked ? 700 : 400;
      render();
    });
  }

  bind('lgTracking', 'tracking', parseFloat);
  bind('lgLayout', 'layout');
  bind('lgShape', 'shape');
  bind('lgStrokeWeight', 'strokeWeight', parseFloat);
  bind('lgRulesH', 'rulesH');
  bind('lgRulesV', 'rulesV');
  bind('lgRuleWeight', 'ruleWeight', parseFloat);
  bind('lgRuleGap', 'ruleGap', parseFloat);

  // Outline / filled segmented buttons
  var styleBtns = document.querySelectorAll('[data-shape-style]');
  Array.prototype.forEach.call(styleBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(styleBtns, function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      current.shapeStyle = btn.getAttribute('data-shape-style');
      render();
    });
  });

  function markActiveSwatch(target, hex) {
    var swatches = document.querySelectorAll('[data-swatch-target="' + target + '"]');
    Array.prototype.forEach.call(swatches, function (sw) {
      var match = sw.getAttribute('data-hex').toLowerCase() === String(hex).toLowerCase();
      sw.classList.toggle('is-active', match);
    });
  }

  // Palette swatches plus a custom picker, for each of the three colour targets
  ['Text', 'Shape', 'Rule'].forEach(function (target) {
    var key = 'color' + target;
    var picker = $('lgCustom' + target);
    var swatches = document.querySelectorAll('[data-swatch-target="' + target + '"]');

    Array.prototype.forEach.call(swatches, function (sw) {
      sw.addEventListener('click', function () {
        var hex = sw.getAttribute('data-hex');
        current[key] = hex;
        if (picker) picker.value = hex;
        markActiveSwatch(target, hex);
        render();
      });
    });

    if (picker) {
      picker.addEventListener('input', function () {
        current[key] = picker.value;
        markActiveSwatch(target, picker.value);
        render();
      });
    }
  });

  // -------------------------------------------------------------- SVG download
  if (dlBtn) {
    dlBtn.addEventListener('click', function () {
      if (!lastSvg) return;
      saveBlob(new Blob([lastSvg], { type: 'image/svg+xml;charset=utf-8' }), slug() + '.svg');
    });
  }

  // -------------------------------------------------------------- PNG download
  /* Rasterise the *same* SVG we'd hand you as a file: load it into an <img> via a
   * blob URL, draw it to a canvas at the requested size, export the canvas.
   *
   * The SVG is pure <path>/<polygon>/<line> with no external references, so the
   * canvas is never tainted and toBlob() works. The background stays transparent.
   * `longest edge` is the size you pick, and the other edge follows the aspect
   * ratio — a logo is rarely square, and squashing it into one would be worse. */
  if (pngBtn) {
    pngBtn.addEventListener('click', function () {
      if (!lastSvg || !lastSize) return;

      var target = parseInt(pngSize ? pngSize.value : '512', 10);
      var scale = target / Math.max(lastSize.w, lastSize.h);
      var w = Math.max(1, Math.round(lastSize.w * scale));
      var h = Math.max(1, Math.round(lastSize.h * scale));

      pngBtn.disabled = true;
      setStatus('RASTERISING ' + w + ' × ' + h + '…');

      var svgUrl = URL.createObjectURL(new Blob([lastSvg], { type: 'image/svg+xml;charset=utf-8' }));
      var img = new Image();

      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(function (blob) {
          pngBtn.disabled = false;
          if (!blob) { setStatus('PNG EXPORT FAILED', 'error'); return; }
          saveBlob(blob, slug() + '-' + w + 'x' + h + '.png');
          setStatus('PNG SAVED · ' + w + ' × ' + h, 'ok');
        }, 'image/png');
      };

      img.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        pngBtn.disabled = false;
        setStatus('PNG EXPORT FAILED', 'error');
      };

      img.src = svgUrl;
    });
  }

  // Seed the active swatches, then draw the default logo.
  markActiveSwatch('Text', current.colorText);
  markActiveSwatch('Shape', current.colorShape);
  markActiveSwatch('Rule', current.colorRule);
  syncWeightControl();
  setStatus('LOADING FONT…');
  render();
})();
