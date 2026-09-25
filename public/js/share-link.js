// share-link.js — shareable calculator state in the query string.
// Pages read TKShare.params() on load, call TKShare.write({...}) whenever
// their inputs change, and wire a "Copy link" button with TKShare.bindCopy().
// The canonical URL strips the query, so these links never create duplicates.
(function () {
  function params() {
    try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
  }

  // Replace the current URL with the given fields; empty values are omitted
  function write(fields) {
    var p = new URLSearchParams();
    Object.keys(fields).forEach(function (k) {
      var v = fields[k];
      if (v === undefined || v === null || String(v).trim() === '') return;
      p.set(k, String(v).trim());
    });
    var q = p.toString();
    try {
      history.replaceState(history.state, '', location.pathname + (q ? '?' + q : '') + location.hash);
    } catch (e) { /* sandboxed frames can refuse replaceState */ }
  }

  // Set a <select> only if the value is one of its options
  function setSelect(el, value) {
    if (!el || value === null || value === undefined) return false;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === value) { el.value = value; return true; }
    }
    return false;
  }

  // Accept plain decimal / exponent numbers only (no "1e3abc", no "")
  function num(value) {
    if (value === null || value === undefined) return null;
    var s = String(value).trim();
    if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) return null;
    var n = Number(s);
    return Number.isFinite(n) ? s : null;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  function bindCopy(btn) {
    if (!btn) return;
    var label = btn.textContent;
    var timer = null;
    btn.addEventListener('click', function () {
      copyText(location.href).then(function () {
        btn.textContent = 'Copied ✓';
      }, function () {
        btn.textContent = 'Copy failed';
      }).then(function () {
        clearTimeout(timer);
        timer = setTimeout(function () { btn.textContent = label; }, 1600);
      });
    });
  }

  window.TKShare = { params: params, write: write, setSelect: setSelect, num: num, bindCopy: bindCopy };
})();
