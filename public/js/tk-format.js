// tk-format.js — shared number formatting for calculator readouts.
// fmtSI(0.0545, 'A') → "54.5 mA", fmtSI(6868.9, 'Hz') → "6.869 kHz".
// Display only: never feed its output back into inputs or URL params.
(function () {
  var PREFIXES = { '-12': 'p', '-9': 'n', '-6': 'µ', '-3': 'm', '0': '', '3': 'k', '6': 'M', '9': 'G' };

  // value: number; unit: string ('' for none); sig: significant figures (default 4)
  function fmtSI(value, unit, sig) {
    unit = unit || '';
    sig = sig || 4;
    var sep = unit ? ' ' : '';
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    if (value === 0) return '0' + sep + unit;

    var sign = value < 0 ? '−' : '';
    var a = Math.abs(value);
    var exp = Math.floor(Math.log10(a) / 3) * 3;
    exp = Math.max(-12, Math.min(9, exp));
    var m = Number((a / Math.pow(10, exp)).toPrecision(sig));
    // rounding can carry 999.96 up to 1000: move to the next prefix
    if (m >= 1000 && exp < 9) {
      exp += 3;
      m = Number((a / Math.pow(10, exp)).toPrecision(sig));
    }
    // Number() already drops trailing zeros ("54.50" → 54.5)
    var p = PREFIXES[String(exp)];
    return sign + String(m) + (unit || p ? ' ' + p + unit : '');
  }

  window.fmtSI = fmtSI;
  window.TKFormat = { fmtSI: fmtSI };
})();
